import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Configuration } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Expo Go не містить нативного MMKV. Там дані лежать у key-value сховищі expo-sqlite
// (воно є в Expo Go), тож вхід і налаштування переживають перезапуск.
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type KeyValueStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

// Синхронні методи kv-store дають той самий інтерфейс, що й MMKV.
// Шифрування тут немає, але це лише для розробки в Expo Go.
function createExpoGoStorage(id: string): KeyValueStorage {
  // Підключаємо лише в Expo Go, щоб не тягнути SQLite у збірку без потреби
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: kv } = require('expo-sqlite/kv-store') as typeof import('expo-sqlite/kv-store');
  const prefixed = (key: string) => `${id}:${key}`;
  return {
    getString: (key) => kv.getItemSync(prefixed(key)) ?? undefined,
    set: (key, value) => kv.setItemSync(prefixed(key), value),
    remove: (key) => {
      kv.removeItemSync(prefixed(key));
    },
  };
}

export function createStorage(configuration: Configuration): KeyValueStorage {
  if (isExpoGo) return createExpoGoStorage(configuration.id ?? 'default');
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
  sync: 'sync',
  notifications: 'notifications',
  moods: 'moods',
  noteDraft: 'note-draft',
  widget: 'widget',
} as const;

// Адаптер для persist-мідлвара Zustand: MMKV синхронний, тому стан доступний одразу при запуску
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
