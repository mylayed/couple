import { Stack } from 'expo-router';

import { selectSignedIn, useAuth } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';

// Без сесії: вітання, реєстрація, вхід і відновлення пароля. Із сесією, але без пари: запрошення та код партнера.
export default function OnboardingLayout() {
  const { colors } = useTheme();
  const signedIn = useAuth(selectSignedIn);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!signedIn} redirectTo="/pair">
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="forgot" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn} redirectTo="/welcome">
        <Stack.Screen name="pair" />
        <Stack.Screen name="join" />
      </Stack.Protected>
    </Stack>
  );
}
