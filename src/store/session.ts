import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from '@/services/storage';

// Тимчасова локальна сесія для навігації та онбордингу.
// На Етапі 3 користувача дасть Supabase Auth, на Етапі 4 пару — сервер.

export type User = {
  name: string;
};

export type Couple = {
  partnerName: string | null;
  pairedAt: string; // ISO-дата
};

type SessionState = {
  user: User | null;
  couple: Couple | null;
  inviteCode: string | null;
  signIn: (name: string) => void;
  signOut: () => void;
  joinCouple: (code: string) => boolean;
  leaveCouple: () => void;
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

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      couple: null,
      inviteCode: null,

      // Код запрошення створюється разом із сесією і живе, доки користувач не вийде
      signIn: (name) =>
        set({ user: { name: name.trim() }, inviteCode: get().inviteCode ?? generateInviteCode() }),

      signOut: () => set({ user: null, couple: null, inviteCode: null }),

      // Поки що приймаємо будь-який код правильної довжини; перевірку зробить сервер
      joinCouple: (raw) => {
        const code = normalizeInviteCode(raw);
        if (code.length !== INVITE_CODE_LENGTH || code === get().inviteCode) return false;
        set({ couple: { partnerName: null, pairedAt: new Date().toISOString() } });
        return true;
      },

      leaveCouple: () => set({ couple: null }),
    }),
    {
      name: StorageKeys.session,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ user, couple, inviteCode }) => ({ user, couple, inviteCode }),
    },
  ),
);
