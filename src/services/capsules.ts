import { randomUUID } from 'expo-crypto';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addDays, parseIsoDate, todayIso, toIsoDate } from '@/utils/dates';
import { StorageKeys, zustandStorage } from './storage';
import { supabase } from './supabase';
import { useSync } from './sync';

// Капсула часу: лист, який відкриється в обраний день. Правило «закрито до дати» тримає
// сервер (міграція 20261016120000_couples.sql): до дня відкриття вміст не бачить ніхто,
// навіть автор, а змінити чи видалити запечатану капсулу не можна.
// Тому капсули не йдуть через загальну синхронізацію: список бере RPC list_time_capsules.

export type Capsule = {
  id: string;
  created_by: string | null;
  opens_on: string; // YYYY-MM-DD
  created_at: string;
  // null, доки капсула закрита
  message: string | null;
};

export const MAX_CAPSULE = 5000;

export const CAPSULE_PERIODS: { label: string; months: number }[] = [
  { label: 'Через пів року', months: 6 },
  { label: 'Через рік', months: 12 },
  { label: 'Через 2 роки', months: 24 },
  { label: 'Через 5 років', months: 60 },
];

export function opensAfterMonths(months: number, from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth() + months, from.getDate());
  // 31 число в коротшому місяці переходить на наступний; беремо останній день
  if (date.getDate() !== from.getDate()) date.setDate(0);
  return toIsoDate(date);
}

// Найраніша дата відкриття: завтра (сервер приймає лише майбутні дати)
export const minOpenDate = () => toIsoDate(addDays(parseIsoDate(todayIso()), 1));

type CapsulesState = { coupleId: string | null; items: Capsule[] };

export const useCapsules = create<CapsulesState>()(
  persist(() => ({ coupleId: null, items: [] }) as CapsulesState, {
    name: StorageKeys.capsules,
    storage: createJSONStorage(() => zustandStorage),
  }),
);

export async function refreshCapsules(): Promise<void> {
  const coupleId = useSync.getState().coupleId;
  if (!coupleId) {
    useCapsules.setState({ coupleId: null, items: [] });
    return;
  }
  const { data, error } = await supabase.rpc('list_time_capsules');
  if (error || !data || useSync.getState().coupleId !== coupleId) return;
  useCapsules.setState({ coupleId, items: data as Capsule[] });
}

export function useCapsuleList(): { closed: Capsule[]; opened: Capsule[] } {
  const coupleId = useSync((s) => s.coupleId);
  const state = useCapsules();
  useEffect(() => {
    void refreshCapsules();
  }, [coupleId]);
  return useMemo(() => {
    // Кеш іншої пари не показуємо
    const items = state.coupleId === coupleId ? state.items : [];
    const today = todayIso();
    return {
      // Найближчі до відкриття вгорі
      closed: items
        .filter((c) => c.opens_on > today)
        .sort((a, b) => a.opens_on.localeCompare(b.opens_on)),
      // Щойно відкриті вгорі
      opened: items
        .filter((c) => c.opens_on <= today)
        .sort((a, b) => b.opens_on.localeCompare(a.opens_on)),
    };
  }, [state, coupleId]);
}

// Запечатати можна лише з мережею: після відправки лист уже не прочитати
export async function sealCapsule(
  message: string,
  opensOn: string,
): Promise<{ error: string | null }> {
  const coupleId = useSync.getState().coupleId;
  if (!coupleId) return { error: 'Спершу з’єднайтеся в пару.' };
  if (opensOn < minOpenDate()) return { error: 'Обери дату в майбутньому.' };
  try {
    const { error, status } = await supabase.from('time_capsules').insert({
      id: randomUUID(),
      couple_id: coupleId,
      opens_on: opensOn,
      message: message.trim(),
    });
    if (error) {
      return {
        error:
          status === 0
            ? 'Немає з’єднання. Перевір інтернет і спробуй ще раз.'
            : 'Не вдалося запечатати. Спробуй ще раз.',
      };
    }
  } catch {
    return { error: 'Немає з’єднання. Перевір інтернет і спробуй ще раз.' };
  }
  await refreshCapsules();
  return { error: null };
}
