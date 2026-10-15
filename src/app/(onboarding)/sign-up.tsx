import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { isValidEmail, MIN_PASSWORD_LENGTH, signUp } from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignUp() {
  const { spacing } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit =
    name.trim().length > 0 && isValidEmail(email) && password.length >= MIN_PASSWORD_LENGTH;

  // Якщо підтвердження пошти вимкнене, сесія з'явиться одразу і захист маршрутів сам поведе далі
  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    const result = await signUp(name, email, password);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.needsConfirmation) router.replace({ pathname: '/verify', params: { email } });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">Привіт!</Text>
        <Text color="textMuted">Створи акаунт, щоб ваші дані були на обох телефонах.</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <TextField
          label="Ім'я"
          placeholder="Так тебе бачитиме партнер"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="given-name"
          maxLength={40}
        />
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
          label={`Пароль, щонайменше ${MIN_PASSWORD_LENGTH} символів`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
          error={error}
        />
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ gap: spacing.sm }}>
        <Button
          title={busy ? 'Створюємо…' : 'Створити акаунт'}
          onPress={submit}
          disabled={!canSubmit || busy}
        />
        <Button title="Назад" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
