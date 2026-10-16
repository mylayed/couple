import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { createStorage, isExpoGo } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Немає EXPO_PUBLIC_SUPABASE_URL або EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY у .env');
}

const ENCRYPTION_KEY_NAME = 'dotyk-auth-key';

// SecureStore на iOS не тримає значення понад 2 КБ, а сесія Supabase більша.
// Тому сесія лежить у зашифрованому MMKV, а випадковий ключ шифрування — у SecureStore.
// У вебі SecureStore немає; веб у нас лише для перевірки під час розробки.
function readEncryptionKey(): string | undefined {
  // У вебі SecureStore немає, а в Expo Go сесія лежить у незашифрованому сховищі для розробки
  if (Platform.OS === 'web' || isExpoGo) return undefined;
  const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };
  let key = SecureStore.getItem(ENCRYPTION_KEY_NAME, options);
  if (!key) {
    key = Array.from(getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
    SecureStore.setItem(ENCRYPTION_KEY_NAME, key, options);
  }
  return key;
}

const encryptionKey = readEncryptionKey();
const authStorage = createStorage({
  id: 'dotyk-auth',
  ...(encryptionKey ? { encryptionKey, encryptionType: 'AES-256' as const } : {}),
});

// Вебверсія спершу рендериться на сервері, де сховища немає; там сесія не потрібна
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem: (key) => authStorage.getString(key) ?? null,
      setItem: (key, value) => authStorage.set(key, value),
      removeItem: (key) => {
        authStorage.remove(key);
      },
    },
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});

// Оновлюємо токен лише поки застосунок на екрані
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
