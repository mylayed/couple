import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { MIN_CODE_LENGTH, normalizeCode, resendSignUpCode, verifySignUp } from '@/services/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function Verify() {
  const { spacing } = useTheme();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = code.length >= MIN_CODE_LENGTH && email.length > 0;

  // Після підтвердження з'явиться сесія і захист маршрутів поведе далі
  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    const result = await verifySignUp(email, code);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  const resend = async () => {
    setNotice(null);
    setError(null);
    const result = await resendSignUpCode(email);
    if (result.error) setError(result.error);
    else setNotice('Надіслали новий код.');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">Перевір пошту</Text>
        <Text color="textMuted">Ми надіслали код на {email}. Введи його тут.</Text>
      </View>

      <TextField
        label="Код із листа"
        placeholder="123456"
        value={code}
        onChangeText={(text) => {
          setCode(normalizeCode(text));
          setError(null);
        }}
        error={error}
        autoFocus
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        returnKeyType="done"
        onSubmitEditing={submit}
        style={{ letterSpacing: 4 }}
      />
      {notice ? <Text color="textMuted">{notice}</Text> : null}

      <View style={{ flex: 1 }} />
      <View style={{ gap: spacing.sm }}>
        <Button
          title={busy ? 'Перевіряємо…' : 'Підтвердити'}
          onPress={submit}
          disabled={!canSubmit || busy}
        />
        <Button title="Надіслати код ще раз" variant="ghost" onPress={resend} />
        <Button title="Назад" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
