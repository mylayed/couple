import { FunctionsHttpError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Budget, DateMood } from '@/data/dateIdeas';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { formatTimeOfDay } from '@/utils/dates';
import { StorageKeys, zustandStorage } from './storage';
import { supabase } from './supabase';
import { useSync } from './sync';

// ШІ працює лише через Edge Function `ai` (supabase/functions/ai): там ключ, промпти,
// ліміти й кеш. Застосунок надсилає тільки потрібні поля, див. екран «ШІ і дані» (/ai).

export type NoteTone = 'tender' | 'playful' | 'romantic';

export const NOTE_TONES: { value: NoteTone; title: string }[] = [
  { value: 'tender', title: 'Ніжно' },
  { value: 'playful', title: 'Жартівливо' },
  { value: 'romantic', title: 'Романтично' },
];

export type AiIdea = { title: string; description: string; budget: Budget; mood: DateMood };
export type YearStory = { title: string; text: string };

type Inputs = {
  date_ideas: {
    budget: Budget | null;
    mood: DateMood | null;
    month: number;
    liked: string[];
    dreams: string[];
    exclude: string[];
  };
  note: { tone: NoteTone; draft: string; partner: string; variant: number };
  year_story: {
    year: number;
    me: string;
    partner: string;
    stats: Record<string, number>;
    busiestMonth: number | null;
    topMoments: { title: string; count: number }[];
    dreams: string[];
    captions: string[];
  };
};

type Outputs = {
  date_ideas: { ideas: AiIdea[] };
  note: { text: string };
  year_story: YearStory;
};

export type AiFeature = keyof Inputs;

// ─── Ліміт ───────────────────────────────────────────────────────────────────

export type AiQuota = { used: number; quota: number; plus: boolean; resets_at: string | null };

export const useAiQuota = create<{ quota: AiQuota | null }>()(() => ({ quota: null }));

export async function refreshAiQuota(): Promise<void> {
  const { data, error } = await supabase.rpc('ai_quota').maybeSingle<AiQuota>();
  if (!error && data) useAiQuota.setState({ quota: data });
}

export function quotaText(quota: AiQuota | null): string | null {
  if (!quota) return null;
  if (quota.plus) return 'ШІ без обмежень з Plus';
  const left = Math.max(0, quota.quota - quota.used);
  if (left > 0) return `ШІ: лишилось ${left} із ${quota.quota} запитів на добу`;
  return quota.resets_at
    ? `Запити ШІ вичерпано. Наступний буде доступний о ${formatTimeOfDay(new Date(quota.resets_at))}`
    : 'Запити ШІ вичерпано, спробуй пізніше';
}

// ─── Згода ───────────────────────────────────────────────────────────────────

// Свою згоду користувач змінює в налаштуваннях; партнерова потрібна для спільних даних пари
export function useAiConsent(): { mine: boolean; partner: boolean } {
  const mine = useAuth((s) => s.profile?.ai_enabled !== false);
  const partner = useCouple((s) => s.partner?.ai_enabled !== false);
  return { mine, partner };
}

// ─── Запит ───────────────────────────────────────────────────────────────────

const ERRORS: Record<string, string> = {
  not_authenticated: 'Спершу увійди в акаунт.',
  no_couple: 'ШІ доступний, коли ви з’єднані в пару.',
  ai_disabled: 'ШІ вимкнено в налаштуваннях.',
  partner_ai_disabled: 'Партнер вимкнув ШІ, тож спільні дані пари ми не надсилаємо.',
  refused: 'ШІ не зміг допомогти з цим запитом. Спробуй сформулювати інакше.',
  busy: 'ШІ зараз перевантажений. Спробуй за хвилину.',
};

const NETWORK_ERROR = 'Немає з’єднання. Перевір інтернет і спробуй ще раз.';
const GENERIC_ERROR = 'ШІ не відповів. Спробуй ще раз.';

export type AiResult<T> = { data: T; error: null } | { data: null; error: string };

export async function askAi<F extends AiFeature>(
  feature: F,
  input: Inputs[F],
): Promise<AiResult<Outputs[F]>> {
  try {
    const { data, error } = await supabase.functions.invoke('ai', { body: { feature, input } });
    if (error) {
      if (!(error instanceof FunctionsHttpError)) return { data: null, error: NETWORK_ERROR };
      const body = (await (error.context as Response).json().catch(() => ({}))) as {
        error?: string;
        quota?: AiQuota | null;
      };
      if (body.quota) useAiQuota.setState({ quota: body.quota });
      if (body.error === 'limit_reached') {
        return { data: null, error: quotaText(body.quota ?? null) ?? GENERIC_ERROR };
      }
      return { data: null, error: (body.error && ERRORS[body.error]) || GENERIC_ERROR };
    }
    const payload = data as { result: Outputs[F]; quota: AiQuota | null };
    if (payload.quota) useAiQuota.setState({ quota: payload.quota });
    return { data: payload.result, error: null };
  } catch {
    return { data: null, error: NETWORK_ERROR };
  }
}

// ─── Історії року ────────────────────────────────────────────────────────────

// Готова історія лежить на телефоні, щоб не питати ШІ щоразу при відкритті екрана.
// input — дані, з яких її написано: якщо вони змінились, пропонуємо оновити.
type StoredStory = YearStory & { input: string };

type StoriesState = { coupleId: string | null; byYear: Record<string, StoredStory> };

export const useYearStories = create<StoriesState>()(
  persist(() => ({ coupleId: null, byYear: {} }) as StoriesState, {
    name: StorageKeys.aiStories,
    storage: createJSONStorage(() => zustandStorage),
  }),
);

export function useYearStory(year: number): StoredStory | null {
  const coupleId = useSync((s) => s.coupleId);
  return useYearStories((s) => (s.coupleId === coupleId ? (s.byYear[year] ?? null) : null));
}

export function saveYearStory(year: number, story: StoredStory): void {
  const coupleId = useSync.getState().coupleId;
  useYearStories.setState((s) => ({
    coupleId,
    byYear: { ...(s.coupleId === coupleId ? s.byYear : {}), [year]: story },
  }));
}
