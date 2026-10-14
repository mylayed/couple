import { createMMKV } from 'react-native-mmkv';

// Локальне сховище для налаштувань цього пристрою (тема, сповіщення, чернетки).
// Дані, які бачить партнер, живуть у Supabase, а тут лише кеш.
export const storage = createMMKV({ id: 'dotyk' });

export const StorageKeys = {
  themeMode: 'theme-mode',
} as const;
