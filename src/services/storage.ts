import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Локальне сховище для налаштувань цього пристрою (тема, сповіщення, чернетки).
// Дані, які бачить партнер, живуть у Supabase, а тут лише кеш.
export const storage = createMMKV({ id: 'dotyk' });

export const StorageKeys = {
  themeMode: 'theme-mode',
  session: 'session',
} as const;

// Адаптер для persist-мідлвара Zustand: MMKV синхронний, тому стан доступний одразу при запуску
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
