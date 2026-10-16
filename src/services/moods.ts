import { randomUUID } from 'expo-crypto';
import {
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSunIcon,
  SunIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { useMemo } from 'react';

import { useAuth } from '@/store/auth';
import { useMyMoods, type MoodVisibility, type MyMood } from '@/store/moods';
import { todayIso } from '@/utils/dates';
import { deleteRow, saveRow, useRows, useSync, type Mood, type MoodKind } from './sync';

// Настрій дня. Приватність вирішується тут, до відправки: сервер отримує лише те,
// що партнер має право бачити (див. міграцію 20261018120000_engagement.sql).

export const MOODS: { kind: MoodKind; label: string; icon: PhosphorIcon }[] = [
  { kind: 'great', label: 'Чудово', icon: SunIcon },
  { kind: 'good', label: 'Добре', icon: CloudSunIcon },
  { kind: 'ok', label: 'Так собі', icon: CloudIcon },
  { kind: 'low', label: 'Сумно', icon: CloudRainIcon },
  { kind: 'bad', label: 'Важко', icon: CloudLightningIcon },
];

export const moodMeta = (kind: MoodKind) => MOODS.find((m) => m.kind === kind) ?? MOODS[2];

export const VISIBILITY: { value: MoodVisibility; label: string; hint: string }[] = [
  { value: 'all', label: 'Усе', hint: 'Партнер бачить настрій і коментар' },
  { value: 'mood', label: 'Лише настрій', hint: 'Коментар бачиш лише ти' },
  { value: 'private', label: 'Нічого', hint: 'Настрій лишається на цьому телефоні' },
];

// Власний настрій за день: локальний запис (з приватним) або той, що прийшов з іншого телефона
export function useMyMood(date = todayIso()): MyMood | null {
  const coupleId = useSync((s) => s.coupleId);
  const local = useMyMoods((s) => (s.coupleId === coupleId ? s.entries[date] : undefined));
  const userId = useAuth((s) => s.session?.user.id);
  const rows = useRows('moods');
  return useMemo(() => {
    if (local) return local;
    const row = rows.find((m) => m.user_id === userId && m.mood_date === date);
    return row ? { id: row.id, mood: row.mood, note: row.note, visibility: 'all' } : null;
  }, [local, rows, userId, date]);
}

export function usePartnerMood(date = todayIso()): Mood | null {
  const userId = useAuth((s) => s.session?.user.id);
  const rows = useRows('moods');
  return useMemo(
    () => rows.find((m) => m.user_id !== userId && m.mood_date === date) ?? null,
    [rows, userId, date],
  );
}

export function saveMood(
  input: { mood: MoodKind; note: string; visibility: MoodVisibility },
  date = todayIso(),
): void {
  const { coupleId } = useSync.getState();
  if (!coupleId) return;
  const userId = useAuth.getState().session?.user.id;
  const state = useMyMoods.getState();
  const entries = state.coupleId === coupleId ? state.entries : {};
  const serverRow = Object.values(useSync.getState().rows.moods).find(
    (m) => m.user_id === userId && m.mood_date === date,
  );
  // Той самий id для дня, щоб повторне «поділитися» відновило запис, а не дублювало
  const id = entries[date]?.id ?? serverRow?.id ?? randomUUID();
  const note = input.note.trim() || null;

  useMyMoods.setState({
    coupleId,
    entries: { ...entries, [date]: { id, mood: input.mood, note, visibility: input.visibility } },
    defaultVisibility: input.visibility,
  });

  if (input.visibility === 'private') {
    // Якщо раніше настроєм ділилися, прибираємо його в партнера
    if (serverRow) deleteRow('moods', id);
    return;
  }
  saveRow(
    'moods',
    {
      id,
      mood_date: date,
      mood: input.mood,
      note: input.visibility === 'all' ? note : null,
    },
    { restore: true },
  );
}
