import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Unbounded_500Medium, Unbounded_700Bold, useFonts } from '@expo-google-fonts/unbounded';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useCouple } from '@/store/couple';
import { selectSignedIn, startAuthListener, useAuth } from '@/store/auth';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function Shell() {
  const { isDark, colors } = useTheme();
  // Без сесії або без пари — онбординг; куди саме всередині, вирішує (onboarding)/_layout
  const signedIn = useAuth(selectSignedIn);
  const hasCouple = useCouple((s) => s.couple !== null);
  const isPaired = signedIn && hasCouple;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Групи не мають власного URL, тому куди переходити, вказуємо явно */}
        <Stack.Protected guard={!isPaired} redirectTo="/">
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={isPaired} redirectTo={signedIn ? '/pair' : '/welcome'}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Unbounded_500Medium,
    Unbounded_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  const authReady = useAuth((s) => s.initialized);

  useEffect(() => {
    startAuthListener();
  }, []);

  const fontsReady = loaded || Boolean(error);

  useEffect(() => {
    if (fontsReady && authReady) SplashScreen.hideAsync();
  }, [fontsReady, authReady]);

  // Сплеш тримається, доки не завантажаться шрифти й не відновиться сесія
  if (!fontsReady || !authReady) return null;

  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
