// Edge Function `revenuecat`: записує право на Plus у plus_entitlements.
// Розгортання: supabase functions deploy revenuecat --no-verify-jwt
// Секрети: supabase secrets set REVENUECAT_SECRET_KEY=sk_... REVENUECAT_WEBHOOK_AUTH=...
//
// Два входи:
// • вебхук RevenueCat (заголовок Authorization = REVENUECAT_WEBHOOK_AUTH) — будь-яка подія
// • застосунок після покупки чи відновлення (токен користувача) — щоб Plus з'явився одразу,
//   не чекаючи вебхука
// В обох випадках не розбираємо типи подій, а питаємо в RevenueCat актуальний стан покупця
// (GET /v1/subscribers): так порядок і повтори вебхуків не можуть зіпсувати статус.
// Далі тригери в базі перераховують couples.plus_until для пари.

import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

// Ідентифікатор entitlement у RevenueCat, до якого прив'язані всі продукти Plus
const ENTITLEMENT = 'plus';
// Покупка «назавжди» не має дати завершення
const LIFETIME = '9999-12-31T00:00:00Z';

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const SECRET_KEY = Deno.env.get('REVENUECAT_SECRET_KEY') ?? '';
const WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '';

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Порівняння без витоку довжини збігу через час відповіді
function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

// ─── Стан покупця ────────────────────────────────────────────────────────────

type Entitlement = {
  expires_date: string | null;
  grace_period_expires_date: string | null;
  product_identifier: string;
};

type Subscription = {
  store?: string;
  period_type?: string;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
};

type Subscriber = {
  entitlements: Record<string, Entitlement | undefined>;
  subscriptions: Record<string, Subscription | undefined>;
  non_subscriptions: Record<string, { store?: string }[] | undefined>;
};

async function fetchSubscriber(userId: string): Promise<Subscriber> {
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${SECRET_KEY}`, Accept: 'application/json' } },
  );
  if (!response.ok) throw new Error(`revenuecat ${response.status}`);
  const body = (await response.json()) as { subscriber: Subscriber };
  return body.subscriber;
}

const later = (a: string | null, b: string | null) =>
  !a ? b : !b ? a : Date.parse(a) > Date.parse(b) ? a : b;

// Переносить стан з RevenueCat у plus_entitlements для одного користувача
async function syncUser(userId: string): Promise<void> {
  const subscriber = await fetchSubscriber(userId);
  const entitlement = subscriber.entitlements[ENTITLEMENT];

  if (!entitlement) {
    // Права немає (повернення коштів, перенесення покупки на інший акаунт).
    // Рядок не видаляємо: завершуємо його, щоб лишилась історія для воронки.
    const { error } = await admin
      .from('plus_entitlements')
      .update({ expires_at: new Date().toISOString(), will_renew: false })
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString());
    if (error) throw error;
    return;
  }

  const product = entitlement.product_identifier;
  const subscription = subscriber.subscriptions[product];
  const lifetime = entitlement.expires_date === null;
  // У пільговий період після невдалої оплати Plus ще діє
  const expiresAt = lifetime
    ? LIFETIME
    : later(entitlement.expires_date, entitlement.grace_period_expires_date)!;
  const store = subscription?.store ?? subscriber.non_subscriptions[product]?.at(-1)?.store;

  const { error } = await admin.from('plus_entitlements').upsert({
    user_id: userId,
    expires_at: expiresAt,
    product_id: product.slice(0, 200),
    store: store?.slice(0, 40) ?? null,
    period_type: lifetime ? null : (subscription?.period_type?.toUpperCase().slice(0, 20) ?? null),
    will_renew:
      !lifetime &&
      Date.parse(expiresAt) > Date.now() &&
      !subscription?.unsubscribe_detected_at &&
      !subscription?.billing_issues_detected_at,
  });
  if (error) throw error;
}

// Лише наші користувачі: анонімні id RevenueCat і тестові події пропускаємо
async function knownUsers(ids: string[]): Promise<string[]> {
  const candidates = [...new Set(ids.filter((id) => UUID.test(id)))];
  if (candidates.length === 0) return [];
  const { data, error } = await admin.from('profiles').select('id').in('id', candidates);
  if (error) throw error;
  return data.map((row) => row.id as string);
}

// ─── Вхід ────────────────────────────────────────────────────────────────────

type WebhookEvent = {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_from?: string[];
  transferred_to?: string[];
};

async function handleWebhook(req: Request): Promise<Response> {
  let event: WebhookEvent;
  try {
    event = ((await req.json()) as { event?: WebhookEvent }).event ?? {};
  } catch {
    return json(400, { error: 'bad_request' });
  }
  const ids = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
    ...(event.transferred_from ?? []),
    ...(event.transferred_to ?? []),
  ].filter((id): id is string => typeof id === 'string');

  try {
    for (const userId of await knownUsers(ids)) await syncUser(userId);
  } catch (e) {
    // Не 200 — RevenueCat повторить подію пізніше
    console.error('revenuecat webhook', event.type, e instanceof Error ? e.message : e);
    return json(500, { error: 'sync_failed' });
  }
  return json(200, { ok: true });
}

async function handleApp(token: string): Promise<Response> {
  const { data: auth } = await admin.auth.getUser(token);
  const userId = auth.user?.id;
  if (!userId) return json(401, { error: 'not_authenticated' });
  try {
    await syncUser(userId);
  } catch (e) {
    console.error('revenuecat sync', e instanceof Error ? e.message : e);
    return json(502, { error: 'sync_failed' });
  }
  return json(200, { ok: true });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!SECRET_KEY) return json(500, { error: 'not_configured' });

  const header = req.headers.get('Authorization') ?? '';
  if (WEBHOOK_AUTH && safeEqual(header, WEBHOOK_AUTH)) return handleWebhook(req);

  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'not_authenticated' });
  return handleApp(token);
});
