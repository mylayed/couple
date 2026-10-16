import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { isValidEmail, resendSignUpCode, signIn } from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignIn() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = isValidEmail(email) && password.length > 0;

  // Після входу захист маршрутів сам перенаправить далі
  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.notConfirmed) {
      // Пошту не підтвердили: надсилаємо свіжий код і ведемо на його введення
      await resendSignUpCode(email);
      setBusy(false);
      router.push({ pathname: '/verify', params: { email } });
      return;
    }
    setBusy(false);
    if (result.error) setError(result.error);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">З поверненням</Text>
        <Text color="textMuted">Увійди в свій акаунт Dotyk.</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <TextField
          label="Пошта"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={error}
        />
        <Button
          title="Забули пароль?"
          variant="ghost"
          onPress={() => router.push({ pathname: '/forgot', params: { email } })}
        />
      </View>

      <GoogleButton />

      <View style={{ flex: 1 }} />
      <View style={{ gap: spacing.sm }}>
        <Button
          title={busy ? 'Входимо…' : 'Увійти'}
          onPress={submit}
          disabled={!canSubmit || busy}
        />
        <Button title="Назад" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
