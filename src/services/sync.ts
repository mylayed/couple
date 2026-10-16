import type { RealtimeChannel } from '@supabase/supabase-js';
import { randomUUID } from 'expo-crypto';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useAuth } from '@/store/auth';
import { StorageKeys, zustandStorage } from './storage';
import { supabase } from './supabase';

// Синхронізація спільних даних пари (схема в розділі «Дані» PLAN.md):
// • інтерфейс читає кеш у MMKV і відкривається без мережі
// • зміни одразу застосовуються локально й стають у чергу (outbox), яка відправляється з повторами
// • зміни партнера приходять через Realtime, а пропущені довантажуються після курсора updated_at
// • ID генерує клієнт, тож повторна відправка не створює дублікатів; видалення м'яке

type SyncedBase = {
  id: string;
  couple_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ImportantDate = SyncedBase & {
  title: string;
  date: string; // YYYY-MM-DD
  kind: 'anniversary' | 'birthday' | 'first' | 'trip' | 'other';
  repeats_yearly: boolean;
  created_by: string | null;
};

export type Moment = SyncedBase & {
  title: string;
  icon: string | null;
  remind_after_days: number | null;
  created_by: string | null;
};

export type MomentLog = SyncedBase & {
  moment_id: string;
  happened_on: string; // YYYY-MM-DD
  note: string | null;
  created_by: string | null;
};

export type DailyAnswer = SyncedBase & {
  user_id: string;
  question_date: string; // YYYY-MM-DD
  question_id: string;
  answer: string;
};

export type TouchKind = 'heart' | 'hug' | 'thinking';

export type Note = SyncedBase & {
  body: string;
  style: 'rose' | 'violet' | 'mint' | 'dawn';
  // Відкриття й реакцію ставить отримувач
  opened_at: string | null;
  reaction: TouchKind | null;
  created_by: string | null;
};

export type Touch = SyncedBase & {
  kind: TouchKind;
  created_by: string | null;
};

export type MoodKind = 'great' | 'good' | 'ok' | 'low' | 'bad';

// Лише те, що партнер може бачити: приватне лишається на телефоні (src/store/moods.ts)
export type Mood = SyncedBase & {
  user_id: string;
  mood_date: string; // YYYY-MM-DD
  mood: MoodKind;
  note: string | null;
};

export type AnswerComment = SyncedBase & {
  answer_id: string;
  body: string;
  created_by: string | null;
};

export type BucketItem = SyncedBase & {
  title: string;
  note: string | null;
  done_at: string | null;
  created_by: string | null;
};

export type ListKind = 'movies' | 'restaurants' | 'gifts' | 'shopping' | 'other';

export type SharedList = SyncedBase & {
  title: string;
  kind: ListKind;
  created_by: string | null;
};

export type ListItem = SyncedBase & {
  list_id: string;
  title: string;
  done_at: string | null;
  created_by: string | null;
};

export type GameKind = 'guess' | 'pair';

export type GameRound = SyncedBase & {
  kind: GameKind;
  question_ids: string[];
  created_by: string | null;
};

// Вибір партнера сервер віддає лише після власного, тож до того його тут немає
export type GameAnswer = SyncedBase & {
  round_id: string;
  user_id: string;
  choices: number[];
};

export type Challenge = SyncedBase & {
  challenge_id: string;
  title: string;
  done_at: string | null;
  created_by: string | null;
};

// Фото лежить у Storage; шляхи з'являються, коли завантаження завершилось (src/services/photos.ts)
export type Memory = SyncedBase & {
  happened_on: string; // YYYY-MM-DD
  caption: string | null;
  photo_path: string | null;
  thumb_path: string | null;
  photo_width: number | null;
  photo_height: number | null;
  created_by: string | null;
};

export type MemoryComment = SyncedBase & {
  memory_id: string;
  body: string;
  created_by: string | null;
};

export type SyncedTables = {
  important_dates: ImportantDate;
  moments: Moment;
  moment_logs: MomentLog;
  daily_answers: DailyAnswer;
  answer_comments: AnswerComment;
  notes: Note;
  touches: Touch;
  moods: Mood;
  bucket_items: BucketItem;
  lists: SharedList;
  list_items: ListItem;
  game_rounds: GameRound;
  game_answers: GameAnswer;
  challenges: Challenge;
  memories: Memory;
  memory_comments: MemoryComment;
};

export type SyncedTable = keyof SyncedTables;

// Порядок важливий: відмітки посилаються на дії, коментарі — на відповіді,
// пункти — на списки, вибір у грі — на раунд, коментарі до спогадів — на спогади, тому батьківські записи відправляються першими
const TABLES: SyncedTable[] = [
  'important_dates',
  'moments',
  'moment_logs',
  'daily_answers',
  'answer_comments',
  'notes',
  'touches',
  'moods',
  'bucket_items',
  'lists',
  'list_items',
  'game_rounds',
  'game_answers',
  'challenges',
  'memories',
  'memory_comments',
];

// Таблиці, де власник записаний у user_id, а не в created_by
const USER_OWNED: SyncedTable[] = ['daily_answers', 'moods', 'game_answers'];

// Поля, які заповнює сервер або сам модуль синхронізації
type ManagedField =
  'couple_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'user_id';
export type RowInput<T extends SyncedTable> = Omit<SyncedTables[T], ManagedField | 'id'> & {
  id?: string;
};

type AnyRow = SyncedBase & Record<string, unknown>;
type OutboxItem = { table: SyncedTable; id: string; attempts: number };

type SyncState = {
  coupleId: string | null;
  rows: { [T in SyncedTable]: Record<string, SyncedTables[T]> };
  cursors: Partial<Record<SyncedTable, string>>;
  outbox: OutboxItem[];
};

const emptyRows = (): SyncState['rows'] => ({
  important_dates: {},
  moments: {},
  moment_logs: {},
  daily_answers: {},
  answer_comments: {},
  notes: {},
  touches: {},
  moods: {},
  bucket_items: {},
  lists: {},
  list_items: {},
  game_rounds: {},
  game_answers: {},
  challenges: {},
  memories: {},
  memory_comments: {},
});

export const useSync = create<SyncState>()(
  persist(() => ({ coupleId: null, rows: emptyRows(), cursors: {}, outbox: [] }) as SyncState, {
    name: StorageKeys.sync,
    storage: createJSONStorage(() => zustandStorage),
    // У кеші зі старішої версії застосунку може не бути нових таблиць
    merge: (persisted, current) => {
      const saved = (persisted ?? {}) as Partial<SyncState>;
      return { ...current, ...saved, rows: { ...emptyRows(), ...saved.rows } };
    },
  }),
);

function tableRows(table: SyncedTable): Record<string, AnyRow> {
  return useSync.getState().rows[table] as unknown as Record<string, AnyRow>;
}

function putRows(table: SyncedTable, rows: AnyRow[]): void {
  if (rows.length === 0) return;
  useSync.setState((s) => {
    const next = { ...s.rows[table] } as Record<string, AnyRow>;
    for (const row of rows) next[row.id] = row;
    return { rows: { ...s.rows, [table]: next } };
  });
}

const isPending = (table: SyncedTable, id: string) =>
  useSync.getState().outbox.some((item) => item.table === table && item.id === id);

// Серверні рядки перемагають за updated_at; рядки з невідправленими змінами не чіпаємо,
// після відправки їх однаково замінить відповідь сервера
function mergeFromServer(table: SyncedTable, incoming: AnyRow[]): void {
  const current = tableRows(table);
  const accepted = incoming.filter((row) => {
    if (isPending(table, row.id)) return false;
    const existing = current[row.id];
    return !existing || existing.updated_at <= row.updated_at;
  });
  putRows(table, accepted);
}

// ─── Хуки для екранів ────────────────────────────────────────────────────────

export function useRows<T extends SyncedTable>(table: T): SyncedTables[T][] {
  const map = useSync((s) => s.rows[table]);
  return useMemo(
    () => (Object.values(map) as SyncedTables[T][]).filter((row) => !row.deleted_at),
    [map],
  );
}

export function useRow<T extends SyncedTable>(table: T, id: string): SyncedTables[T] | null {
  const row = useSync((s) => s.rows[table][id]) as SyncedTables[T] | undefined;
  return row && !row.deleted_at ? row : null;
}

// ─── Запис ───────────────────────────────────────────────────────────────────

function enqueue(table: SyncedTable, id: string): void {
  useSync.setState((s) =>
    isPending(table, id) ? s : { outbox: [...s.outbox, { table, id, attempts: 0 }] },
  );
  void flush();
}

// Створює або оновлює запис. Повертає його id.
// restore повертає м'яко видалений запис, наприклад настрій, яким знову діляться з партнером.
export function saveRow<T extends SyncedTable>(
  table: T,
  input: RowInput<T> | (Partial<RowInput<T>> & { id: string }),
  { restore = false }: { restore?: boolean } = {},
): string | null {
  const { coupleId } = useSync.getState();
  const userId = useAuth.getState().session?.user.id;
  if (!coupleId || !userId) return null;

  const id = input.id ?? randomUUID();
  const now = new Date().toISOString();
  const existing = tableRows(table)[id];
  const owner = USER_OWNED.includes(table) ? { user_id: userId } : { created_by: userId };
  const row = {
    ...(existing ?? { created_at: now, deleted_at: null, ...owner }),
    ...input,
    ...(restore ? { deleted_at: null } : {}),
    id,
    couple_id: coupleId,
    updated_at: now,
  } as AnyRow;

  putRows(table, [row]);
  enqueue(table, id);
  return id;
}

export function deleteRow(table: SyncedTable, id: string): void {
  const existing = tableRows(table)[id];
  if (!existing || existing.deleted_at) return;
  putRows(table, [{ ...existing, deleted_at: new Date().toISOString() }]);
  enqueue(table, id);
}

// ─── Відправка черги ─────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5;
let flushing = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 1000;

// Мережа, сервер чи прострочений токен: варто повторити пізніше
const isTransient = (status: number) =>
  status === 0 || status === 401 || status === 429 || status >= 500;

function scheduleRetry(): void {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void flush();
  }, retryDelay);
  retryDelay = Math.min(retryDelay * 2, 60_000);
}

function removeFromOutbox(table: SyncedTable, id: string): void {
  useSync.setState((s) => ({
    outbox: s.outbox.filter((item) => !(item.table === table && item.id === id)),
  }));
}

// Сервер відхилив запис назавжди: беремо його версію або прибираємо локальний рядок
async function restoreFromServer(table: SyncedTable, id: string): Promise<void> {
  const { data, status } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (isTransient(status)) return;
  if (data) {
    putRows(table, [data as AnyRow]);
  } else {
    useSync.setState((s) => {
      const next = { ...s.rows[table] } as Record<string, AnyRow>;
      delete next[id];
      return { rows: { ...s.rows, [table]: next } };
    });
  }
}

export async function flush(): Promise<void> {
  if (flushing || !useSync.getState().coupleId) return;
  flushing = true;
  try {
    const queue = [...useSync.getState().outbox].sort(
      (a, b) => TABLES.indexOf(a.table) - TABLES.indexOf(b.table),
    );
    for (const item of queue) {
      const sent = tableRows(item.table)[item.id];
      if (!sent) {
        removeFromOutbox(item.table, item.id);
        continue;
      }
      // updated_at ставить сервер; created_at лишаємо, щоб порядок не залежав від мережі
      const { updated_at: _localTime, ...payload } = sent;
      const { data, error, status } = await supabase
        .from(item.table)
        .upsert(payload)
        .select()
        .single();

      if (error && isTransient(status)) {
        scheduleRetry();
        return;
      }

      // Поки йшов запит, рядок могли змінити ще раз: тоді він лишається в черзі
      const changedMeanwhile = tableRows(item.table)[item.id] !== sent;

      if (error) {
        // Новішу версію відправимо наступним проходом
        if (changedMeanwhile) continue;
        const attempts = item.attempts + 1;
        if (attempts < MAX_ATTEMPTS) {
          useSync.setState((s) => ({
            outbox: s.outbox.map((o) =>
              o.table === item.table && o.id === item.id ? { ...o, attempts } : o,
            ),
          }));
          continue;
        }
        console.warn(`sync: ${item.table} ${item.id} відхилено`, error.message);
        removeFromOutbox(item.table, item.id);
        await restoreFromServer(item.table, item.id);
        continue;
      }

      if (!changedMeanwhile) {
        removeFromOutbox(item.table, item.id);
        putRows(item.table, [data as AnyRow]);
      }

      // Відповідь партнера на це питання сервер віддає лише після нашої, тож довантажуємо її
      if (item.table === 'daily_answers') {
        const { data: answers } = await supabase
          .from('daily_answers')
          .select('*')
          .eq('couple_id', sent.couple_id)
          .eq('question_date', sent.question_date as string);
        if (answers) mergeFromServer('daily_answers', answers as AnyRow[]);
      }
      // Так само з вибором партнера в раунді гри
      if (item.table === 'game_answers') {
        const { data: answers } = await supabase
          .from('game_answers')
          .select('*')
          .eq('round_id', sent.round_id as string);
        if (answers) mergeFromServer('game_answers', answers as AnyRow[]);
      }
    }
    retryDelay = 1000;
  } finally {
    flushing = false;
  }
  // Поки відправляли, могли з'явитися нові зміни; відхилені записи пробуємо пізніше
  const { outbox } = useSync.getState();
  if (outbox.some((item) => item.attempts === 0)) void flush();
  else if (outbox.length > 0) scheduleRetry();
}

// ─── Довантаження змін ───────────────────────────────────────────────────────

const PAGE_SIZE = 500;
// Транзакції комітяться не в порядку updated_at, тому беремо невеликий запас назад
const CURSOR_OVERLAP_MS = 10_000;

async function pullTable(table: SyncedTable, coupleId: string): Promise<boolean> {
  for (;;) {
    const cursor = useSync.getState().cursors[table];
    let query = supabase
      .from(table)
      .select('*')
      .eq('couple_id', coupleId)
      .order('updated_at')
      .limit(PAGE_SIZE);
    if (cursor) {
      query = query.gt(
        'updated_at',
        new Date(Date.parse(cursor) - CURSOR_OVERLAP_MS).toISOString(),
      );
    }
    const { data, error } = await query;
    if (error || !data) return false;
    // Пара могла змінитися, поки йшов запит
    if (useSync.getState().coupleId !== coupleId) return false;

    const rows = data as AnyRow[];
    mergeFromServer(table, rows);
    const last = rows.at(-1)?.updated_at;
    if (last && last !== cursor) {
      useSync.setState((s) => ({ cursors: { ...s.cursors, [table]: last } }));
    }
    // Остання сторінка, або сторінка вся в межах запасу і курсор не зрушив
    if (rows.length < PAGE_SIZE || !last || last === cursor) return true;
  }
}

export async function pullAll(): Promise<void> {
  const { coupleId } = useSync.getState();
  if (!coupleId) return;
  for (const table of TABLES) {
    if (!(await pullTable(table, coupleId))) return;
  }
}

// ─── Життєвий цикл ───────────────────────────────────────────────────────────

let channel: RealtimeChannel | null = null;

function unsubscribe(): void {
  if (channel) void supabase.removeChannel(channel);
  channel = null;
}

// Викликає src/services/couple.ts, коли пару з'єднано, змінено або роз'єднано
export function setSyncCouple(coupleId: string | null): void {
  if (useSync.getState().coupleId !== coupleId) {
    // Дані іншої пари на цьому телефоні більше не потрібні
    unsubscribe();
    useSync.setState({ coupleId, rows: emptyRows(), cursors: {}, outbox: [] });
  }
  if (!coupleId || channel) return;

  let next = supabase.channel(`couple-data:${coupleId}`);
  for (const table of TABLES) {
    next = next.on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `couple_id=eq.${coupleId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') return; // видалення в нас лише м'які
        mergeFromServer(table, [payload.new as AnyRow]);
      },
    );
  }
  channel = next.subscribe((status) => {
    // Після (пере)підключення довантажуємо все, що пропустили, і відправляємо чергу
    if (status === 'SUBSCRIBED') {
      void pullAll();
      void flush();
    }
  });
}

// Застосунок повернувся на екран: Realtime міг відключитися у фоні
export function resumeSync(): void {
  void pullAll();
  void flush();
}
