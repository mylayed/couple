// У вебі нативного Google Sign-In немає; веб у нас лише для перевірки під час розробки

export const isGoogleSignInAvailable = false;

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  return { error: 'Вхід через Google доступний лише в застосунку на телефоні.' };
}

export async function signOutGoogle(): Promise<void> {}
