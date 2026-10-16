import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Configuration } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Expo Go не містить нативного MMKV. Там дані живуть лише в пам'яті до перезапуску:
// цього вистачає, щоб переглянути інтерфейс без dev-build.
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type KeyValueStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

function createMemoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getString: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
    },
    remove: (key) => {
      values.delete(key);
    },
  };
}

export function createStorage(configuration: Configuration): KeyValueStorage {
  if (isExpoGo) return createMemoryStorage();
  // Підключаємо лише поза Expo Go: там модуль падає ще під час імпорту
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  return createMMKV(configuration);
}

// Локальне сховище для налаштувань цього пристрою (тема, сповіщення, чернетки).
// Дані, які бачить партнер, живуть у Supabase, а тут лише кеш.
export const storage = createStorage({ id: 'dotyk' });

export const StorageKeys = {
  themeMode: 'theme-mode',
  couple: 'couple',
} as const;

// Адаптер для persist-мідлвара Zustand: MMKV синхронний, тому стан доступний одразу при запуску
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
