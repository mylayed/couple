import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from '@/services/storage';
import type { Profile } from './auth';

// Пара з Supabase (таблиці couples і couple_members). Кеш у MMKV, щоб застосунок
// відкривався одразу й без мережі; оновлює його src/services/couple.ts.

export type Couple = {
  id: string;
  invite_code: string | null;
  started_on: string | null; // YYYY-MM-DD
  plus_until: string | null;
  created_at: string;
};

export type Partner = Pick<Profile, 'id' | 'name' | 'avatar_url' | 'birth_date' | 'ai_enabled'>;

type CoupleState = {
  // Чий це кеш: після входу під іншим акаунтом його треба скинути
  userId: string | null;
  // true після першої успішної відповіді сервера для цього користувача
  loaded: boolean;
  couple: Couple | null;
  partner: Partner | null;
  // Коли приєднався другий учасник; запасний відлік, поки не задано дату початку
  pairedAt: string | null;
};

const initialState: CoupleState = {
  userId: null,
  loaded: false,
  couple: null,
  partner: null,
  pairedAt: null,
};

export const useCouple = create<CoupleState>()(
  persist(() => initialState, {
    name: StorageKeys.couple,
    storage: createJSONStorage(() => zustandStorage),
    // Стара локальна пара з Етапу 2 має інший формат, її просто відкидаємо
    version: 1,
    migrate: () => initialState,
  }),
);

export function resetCoupleState(): void {
  useCouple.setState(initialState);
}

export const selectIsPaired = (s: CoupleState) => s.couple !== null && s.partner !== null;

// Без схожих символів (0/O, 1/I/L), щоб код було легко продиктувати
export const INVITE_CODE_LENGTH = 6;

export function normalizeInviteCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
