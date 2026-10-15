import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from '@/services/storage';

// Тимчасова локальна пара. На Етапі 4 її замінять таблиці couples і couple_members у Supabase.

export type Couple = {
  partnerName: string | null;
  pairedAt: string; // ISO-дата
};

type CoupleState = {
  couple: Couple | null;
  inviteCode: string;
  joinCouple: (code: string) => boolean;
  leaveCouple: () => void;
  reset: () => void;
};

// Без схожих символів (0/O, 1/I/L), щоб код було легко продиктувати
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_LENGTH = 6;

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeInviteCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const useCouple = create<CoupleState>()(
  persist(
    (set, get) => ({
      couple: null,
      // Збережений код перекриває цей під час відновлення стану, тож він стабільний між запусками
      inviteCode: generateInviteCode(),

      // Поки що приймаємо будь-який код правильної довжини; перевірку зробить сервер
      joinCouple: (raw) => {
        const code = normalizeInviteCode(raw);
        if (code.length !== INVITE_CODE_LENGTH || code === get().inviteCode) return false;
        set({ couple: { partnerName: null, pairedAt: new Date().toISOString() } });
        return true;
      },

      leaveCouple: () => set({ couple: null }),

      // Після виходу з акаунта пара цього телефона більше не актуальна
      reset: () => set({ couple: null, inviteCode: generateInviteCode() }),
    }),
    {
      name: StorageKeys.couple,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ couple, inviteCode }) => ({ couple, inviteCode }),
    },
  ),
);
