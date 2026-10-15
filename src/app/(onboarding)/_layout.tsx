import { Stack } from 'expo-router';

import { useSession } from '@/store/session';
import { useTheme } from '@/theme/ThemeProvider';

// Без сесії: вітання та вхід. Із сесією, але без пари: запрошення та код партнера.
export default function OnboardingLayout() {
  const { colors } = useTheme();
  const signedIn = useSession((s) => s.user !== null);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="pair" />
        <Stack.Screen name="join" />
      </Stack.Protected>
    </Stack>
  );
}
