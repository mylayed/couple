import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Unbounded_500Medium, Unbounded_700Bold, useFonts } from '@expo-google-fonts/unbounded';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { startCoupleListener } from '@/services/couple';
import { startNotifications } from '@/services/notifications';
import { selectIsPaired, useCouple } from '@/store/couple';
import { selectSignedIn, startAuthListener, useAuth } from '@/store/auth';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { startWidgetUpdates } from '@/widget';
import { fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

function Shell() {
  const { isDark, colors } = useTheme();
  // Без сесії або без пари — онбординг; куди саме всередині, вирішує (onboarding)/_layout
  const signedIn = useAuth(selectSignedIn);
  const hasPartner = useCouple(selectIsPaired);
  const isPaired = signedIn && hasPartner;

  const detailHeader = {
    headerShown: true,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: fonts.headingMedium, color: colors.text },
  };

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
          {/* Екрани поверх вкладок мають заголовок і кнопку «Назад»; назву для [id] задає сам екран */}
          <Stack.Screen name="question" options={{ ...detailHeader, title: 'Питання дня' }} />
          <Stack.Screen name="dates/index" options={{ ...detailHeader, title: 'Важливі дати' }} />
          <Stack.Screen name="dates/[id]" options={detailHeader} />
          <Stack.Screen name="moment/new" options={{ ...detailHeader, title: 'Новий момент' }} />
          <Stack.Screen name="moment/[id]" options={detailHeader} />
          <Stack.Screen name="notes/index" options={{ ...detailHeader, title: 'Листівки' }} />
          <Stack.Screen name="notes/new" options={{ ...detailHeader, title: 'Нова листівка' }} />
          <Stack.Screen name="notes/[id]" options={detailHeader} />
          <Stack.Screen name="mood" options={{ ...detailHeader, title: 'Настрій дня' }} />
          <Stack.Screen name="bucket/index" options={{ ...detailHeader, title: 'Бакет-ліст' }} />
          <Stack.Screen name="bucket/[id]" options={detailHeader} />
          <Stack.Screen name="lists/new" options={{ ...detailHeader, title: 'Новий список' }} />
          <Stack.Screen name="lists/[id]" options={detailHeader} />
          <Stack.Screen name="idea" options={{ ...detailHeader, title: 'Ідея побачення' }} />
          <Stack.Screen name="roulette" options={{ ...detailHeader, title: 'Рулетка рішень' }} />
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
    startCoupleListener();
    startNotifications();
    startWidgetUpdates();
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
