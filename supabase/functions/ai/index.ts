// Edge Function `ai`: єдина точка входу до ШІ для застосунку.
// Розгортання: supabase functions deploy ai --no-verify-jwt
// (токен користувача перевіряємо тут самі). Секрет: supabase secrets set ANTHROPIC_API_KEY=...
//
// Порядок: користувач → пара і згода на ШІ → перевірка даних → кеш → ліміт → модель.
// Відповідь із кешу ліміт не витрачає; якщо модель не відповіла, запит повертається в ліміт.

import Anthropic from 'npm:@anthropic-ai/sdk@0.133.0';
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

import { FEATURES, tidy, type Feature } from './features.ts';

// Дешева швидка модель: короткі тексти українською їй під силу
const MODEL = 'claude-haiku-5-5';
// Змінити, коли змінюються промпти: інакше кеш віддаватиме старі відповіді
const PROMPT_VERSION = 1;
const CACHE_DAYS = 30;

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY'), timeout: 30_000 });

// CORS потрібен лише вебверсії для розробки; телефону він не заважає
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
  json(status, { error, ...extra });

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

type Quota = { used: number; quota: number; plus: boolean; resets_at: string | null };

async function readQuota(userId: string): Promise<Quota | null> {
  // ai_quota() читає auth.uid(), тож рахуємо тут напряму від імені сервера
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const [{ data: rows }, { data: limit }] = await Promise.all([
    admin
      .from('ai_requests')
      .select('created_at')
      .eq('user_id', userId)
      .gt('created_at', since)
      .order('created_at', { ascending: true }),
    admin.rpc('ai_daily_limit', { p_user: userId }),
  ]);
  if (!rows || typeof limit !== 'number') return null;
  const oldest = rows[0]?.created_at as string | undefined;
  return {
    used: rows.length,
    quota: limit,
    plus: limit > 3,
    resets_at: oldest ? new Date(Date.parse(oldest) + 24 * 3600_000).toISOString() : null,
  };
}

async function ask(feature: Feature, input: Record<string, unknown>) {
  const spec = FEATURES[feature];
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: spec.maxTokens,
    system: spec.system,
    messages: [{ role: 'user', content: spec.prompt(input) }],
    output_config: { effort: 'low', format: { type: 'json_schema', schema: spec.schema } },
  });
  if (response.stop_reason === 'refusal') return { refused: true as const };
  if (response.stop_reason === 'max_tokens') throw new Error('max_tokens');
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('no_text');
  return { result: tidy(feature, JSON.parse(text.text)) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail(405, 'method_not_allowed');

  // ─── Хто питає ───
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return fail(401, 'not_authenticated');
  const { data: auth } = await admin.auth.getUser(token);
  const userId = auth.user?.id;
  if (!userId) return fail(401, 'not_authenticated');

  let body: { feature?: unknown; input?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, 'bad_request');
  }
  const feature = body.feature as Feature;
  if (!Object.hasOwn(FEATURES, feature)) return fail(400, 'bad_request');

  // ─── Пара і згода ───
  const { data: member } = await admin
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!member) return fail(403, 'no_couple');
  const { data: people } = await admin
    .from('couple_members')
    .select('user_id, profile:profiles(ai_enabled)')
    .eq('couple_id', member.couple_id)
    .returns<{ user_id: string; profile: { ai_enabled: boolean } | null }[]>();
  const me = people?.find((p) => p.user_id === userId);
  if (me?.profile?.ai_enabled === false) return fail(403, 'ai_disabled');
  const partner = people?.find((p) => p.user_id !== userId);
  const partnerAllowsAi = partner?.profile?.ai_enabled !== false;

  const input = FEATURES[feature].parse(body.input, { partnerAllowsAi });
  if (!input) {
    return fail(
      partnerAllowsAi ? 400 : 403,
      partnerAllowsAi ? 'bad_request' : 'partner_ai_disabled',
    );
  }

  // ─── Кеш ───
  const key = await sha256(JSON.stringify({ v: PROMPT_VERSION, model: MODEL, feature, input }));
  const fresh = new Date(Date.now() - CACHE_DAYS * 24 * 3600_000).toISOString();
  const { data: cached } = await admin
    .from('ai_cache')
    .select('result')
    .eq('couple_id', member.couple_id)
    .eq('key', key)
    .gt('created_at', fresh)
    .maybeSingle();
  if (cached) {
    return json(200, { result: cached.result, cached: true, quota: await readQuota(userId) });
  }

  // ─── Ліміт ───
  const { data: requestId, error: quotaError } = await admin.rpc('ai_take_quota', {
    p_user: userId,
    p_feature: feature,
  });
  if (quotaError) return fail(500, 'server_error');
  if (!requestId) return fail(429, 'limit_reached', { quota: await readQuota(userId) });

  // ─── Модель ───
  const refund = () => admin.from('ai_requests').delete().eq('id', requestId);
  let answer: Awaited<ReturnType<typeof ask>>;
  try {
    answer = await ask(feature, input);
  } catch (e) {
    await refund();
    if (e instanceof Anthropic.RateLimitError) return fail(503, 'busy');
    console.error('ai failed', feature, e instanceof Error ? e.message : e);
    return fail(502, 'ai_failed');
  }
  if ('refused' in answer) {
    await refund();
    return fail(422, 'refused');
  }

  await admin.from('ai_cache').upsert({ couple_id: member.couple_id, key, result: answer.result });
  // Прибираємо прострочений кеш цієї пари, щоб таблиця не росла
  await admin.from('ai_cache').delete().eq('couple_id', member.couple_id).lt('created_at', fresh);

  return json(200, { result: answer.result, cached: false, quota: await readQuota(userId) });
});
