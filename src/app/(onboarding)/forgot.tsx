import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  isValidEmail,
  MIN_CODE_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeCode,
  requestPasswordReset,
  resetPassword,
} from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';

// Два кроки на одному екрані: спершу пошта, потім код із листа й новий пароль
export default function Forgot() {
  const { spacing } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!isValidEmail(email) || busy) return;
    setBusy(true);
    setError(null);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (result.error) setError(result.error);
    else setStep('code');
  };

  const canReset = code.length >= MIN_CODE_LENGTH && password.length >= MIN_PASSWORD_LENGTH;

  // Після збереження пароля сесія вже є, тож захист маршрутів сам поведе далі
  const submit = async () => {
    if (!canReset || busy) return;
    setBusy(true);
    setError(null);
    const result = await resetPassword(email, code, password);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  if (step === 'email') {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="title">Новий пароль</Text>
          <Text color="textMuted">Вкажи пошту акаунта, і ми надішлемо код для зміни пароля.</Text>
        </View>
        <TextField
          label="Пошта"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={sendCode}
          error={error}
        />
        <View style={{ flex: 1 }} />
        <View style={{ gap: spacing.sm }}>
          <Button
            title={busy ? 'Надсилаємо…' : 'Надіслати код'}
            onPress={sendCode}
            disabled={!isValidEmail(email) || busy}
          />
          <Button title="Назад" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">Перевір пошту</Text>
        <Text color="textMuted">
          Ми надіслали код на {email}. Введи його й придумай новий пароль.
        </Text>
      </View>
      <View style={{ gap: spacing.md }}>
        <TextField
          label="Код із листа"
          placeholder="123456"
          value={code}
          onChangeText={(text) => setCode(normalizeCode(text))}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={{ letterSpacing: 4 }}
        />
        <TextField
          label={`Новий пароль, щонайменше ${MIN_PASSWORD_LENGTH} символів`}
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
          title={busy ? 'Зберігаємо…' : 'Зберегти пароль'}
          onPress={submit}
          disabled={!canReset || busy}
        />
        <Button title="Надіслати код ще раз" variant="ghost" onPress={sendCode} />
      </View>
    </Screen>
  );
}
