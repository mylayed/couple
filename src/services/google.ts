import { isExpoGo } from './storage';
import { supabase } from './supabase';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

// Нативний вхід через Google: бібліотека дає ID-токен, Supabase за ним створює сесію.
// Працює лише в dev-build або релізній збірці, не в Expo Go і не у вебі (див. google.web.ts).

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Кнопку показуємо лише тоді, коли в .env є Web client ID; в Expo Go нативного модуля немає
export const isGoogleSignInAvailable = Boolean(webClientId) && !isExpoGo;

let googleModule: GoogleSignInModule | null = null;

// Модуль підключаємо ліниво: в Expo Go він падає ще під час імпорту
function load(): GoogleSignInModule {
  if (!googleModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require('@react-native-google-signin/google-signin') as GoogleSignInModule;
    googleModule.GoogleSignin.configure({
      // ID-токен видається для Web-клієнта: саме його client ID перевіряє Supabase
      webClientId,
      iosClientId: iosClientId || undefined,
    });
  }
  return googleModule;
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isGoogleSignInAvailable) return { error: 'Вхід через Google ще не налаштовано.' };
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = load();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    // Користувач закрив вікно вибору акаунта — це не помилка
    if (!isSuccessResponse(response)) return { error: null };

    const idToken = response.data.idToken;
    if (!idToken) return { error: 'Google не повернув дані для входу. Спробуй ще раз.' };

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { error: 'Не вдалося увійти через Google. Спробуй ще раз.' };
    return { error: null };
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.IN_PROGRESS) return { error: null };
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { error: 'Онови сервіси Google Play, щоб увійти через Google.' };
      }
    }
    return { error: 'Не вдалося увійти через Google. Спробуй ще раз.' };
  }
}

// Щоб наступного разу Google знову запропонував вибрати акаунт
export async function signOutGoogle(): Promise<void> {
  if (!isGoogleSignInAvailable) return;
  try {
    await load().GoogleSignin.signOut();
  } catch {
    // Користувач міг і не входити через Google
  }
}
