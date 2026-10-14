import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Unbounded_500Medium, Unbounded_700Bold, useFonts } from '@expo-google-fonts/unbounded';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

function Shell() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
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

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Сплеш тримається, доки шрифти не завантажаться
  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
