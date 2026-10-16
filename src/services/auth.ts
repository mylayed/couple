import { AuthError, isAuthError } from '@supabase/supabase-js';

import { loadProfile, useAuth, type Profile } from '@/store/auth';
import { clearCoupleOnSignOut } from './couple';
import { signOutGoogle } from './google';
import { supabase } from './supabase';

// Усі дії повертають текст помилки українською або null, якщо все вдалося

export const MIN_PASSWORD_LENGTH = 8;

// Довжина коду з листа налаштовується в Supabase (Auth → Email OTP length), тому приймаємо 6–10 цифр
export const MIN_CODE_LENGTH = 6;
export const MAX_CODE_LENGTH = 10;

export function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, MAX_CODE_LENGTH);
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Неправильна пошта або пароль.',
  user_already_exists: 'Акаунт із цією поштою вже є. Спробуй увійти.',
  email_exists: 'Акаунт із цією поштою вже є. Спробуй увійти.',
  email_address_invalid: 'Перевір адресу пошти.',
  weak_password: `Пароль закороткий або надто простий. Потрібно щонайменше ${MIN_PASSWORD_LENGTH} символів.`,
  same_password: 'Новий пароль має відрізнятися від старого.',
  otp_expired: 'Код не підходить або вже застарів. Попроси новий.',
  over_email_send_rate_limit: 'Забагато листів. Зачекай кілька хвилин і спробуй ще раз.',
  over_request_rate_limit: 'Забагато спроб. Зачекай хвилинку.',
  email_not_confirmed: 'Пошту ще не підтверджено.',
  signup_disabled: 'Реєстрацію тимчасово вимкнено.',
};

function toMessage(error: unknown): string {
  if (isAuthError(error) && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error instanceof Error && /network|fetch/i.test(error.message)) {
    return 'Немає з’єднання. Перевір інтернет і спробуй ще раз.';
  }
  return 'Щось пішло не так. Спробуй ще раз.';
}

export function isEmailNotConfirmed(error: unknown): boolean {
  return error instanceof AuthError && error.code === 'email_not_confirmed';
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(raw));
}

type Result = { error: string | null };

// needsConfirmation: якщо в проєкті ввімкнено підтвердження пошти, сесії ще немає і чекаємо код
export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<Result & { needsConfirmation: boolean }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { error: toMessage(error), needsConfirmation: false };
    return { error: null, needsConfirmation: data.session === null };
  } catch (e) {
    return { error: toMessage(e), needsConfirmation: false };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<Result & { notConfirmed: boolean }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { error: toMessage(error), notConfirmed: isEmailNotConfirmed(error) };
    return { error: null, notConfirmed: false };
  } catch (e) {
    return { error: toMessage(e), notConfirmed: false };
  }
}

export async function verifySignUp(email: string, code: string): Promise<Result> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: code,
      type: 'email',
    });
    return { error: error ? toMessage(error) : null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}

export async function resendSignUpCode(email: string): Promise<Result> {
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email: normalizeEmail(email) });
    return { error: error ? toMessage(error) : null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}

export async function requestPasswordReset(email: string): Promise<Result> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email));
    return { error: error ? toMessage(error) : null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}

// Код із листа дає сесію; прапорець passwordRecovery не пускає далі, доки не збережемо новий пароль
export async function resetPassword(
  email: string,
  code: string,
  password: string,
): Promise<Result> {
  useAuth.setState({ passwordRecovery: true });
  try {
    const verified = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: code,
      type: 'recovery',
    });
    if (verified.error) return { error: toMessage(verified.error) };
    const updated = await supabase.auth.updateUser({ password });
    if (updated.error) {
      // Код уже використано, тому виходимо, щоб користувач почав спочатку
      await supabase.auth.signOut();
      return { error: toMessage(updated.error) };
    }
    return { error: null };
  } catch (e) {
    return { error: toMessage(e) };
  } finally {
    useAuth.setState({ passwordRecovery: false });
  }
}

export async function signOut(): Promise<Result> {
  try {
    // scope local: виходимо лише на цьому телефоні, навіть без мережі
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) return { error: toMessage(error) };
    await signOutGoogle();
    clearCoupleOnSignOut();
    return { error: null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}

export async function deleteAccount(): Promise<Result> {
  try {
    const { error } = await supabase.rpc('delete_account');
    if (error) return { error: 'Не вдалося видалити акаунт. Спробуй ще раз.' };
    await supabase.auth.signOut({ scope: 'local' });
    await signOutGoogle();
    clearCoupleOnSignOut();
    return { error: null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}

export async function updateProfile(
  changes: Partial<Pick<Profile, 'name' | 'birth_date' | 'avatar_url'>>,
): Promise<Result> {
  const userId = useAuth.getState().session?.user.id;
  if (!userId) return { error: 'Спершу увійди в акаунт.' };
  try {
    const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
    if (error) return { error: 'Не вдалося зберегти. Спробуй ще раз.' };
    await loadProfile();
    return { error: null };
  } catch (e) {
    return { error: toMessage(e) };
  }
}
