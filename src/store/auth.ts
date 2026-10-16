import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/services/supabase';

export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_date: string | null; // YYYY-MM-DD
  // Згода на ШІ; у кеші з попередніх версій поля може не бути, тоді вважаємо true
  ai_enabled?: boolean;
};

type AuthState = {
  // false, доки Supabase не відновив сесію зі сховища; до того тримаємо сплеш
  initialized: boolean;
  session: Session | null;
  profile: Profile | null;
  // Під час відновлення пароля сесія вже є, але онбординг ще не завершено
  passwordRecovery: boolean;
};

export const useAuth = create<AuthState>()(() => ({
  initialized: false,
  session: null,
  profile: null,
  passwordRecovery: false,
}));

export const selectSignedIn = (s: AuthState) => s.session !== null && !s.passwordRecovery;

export async function loadProfile(): Promise<void> {
  const userId = useAuth.getState().session?.user.id;
  if (!userId) return;
  const { data } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, birth_date, ai_enabled')
    .eq('id', userId)
    .maybeSingle<Profile>();
  // Користувач міг вийти, поки йшов запит
  if (useAuth.getState().session?.user.id === userId) useAuth.setState({ profile: data });
}

let started = false;

// Підписка на зміни сесії; викликається один раз у кореневому layout
export function startAuthListener(): void {
  if (started) return;
  started = true;

  supabase.auth.onAuthStateChange((event, session) => {
    const previousUserId = useAuth.getState().session?.user.id;
    useAuth.setState({
      session,
      initialized: true,
      ...(session ? {} : { profile: null }),
    });
    // Не викликаємо Supabase прямо в колбеку: це може заблокувати клієнт
    if (session && (session.user.id !== previousUserId || event === 'USER_UPDATED')) {
      setTimeout(loadProfile, 0);
    }
  });
}
