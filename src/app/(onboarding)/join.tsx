import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { joinCouple } from '@/services/couple';
import { INVITE_CODE_LENGTH, normalizeInviteCode } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';

export default function Join() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canSubmit = normalizeInviteCode(code).length === INVITE_CODE_LENGTH && !busy;

  // Після підключення захист маршрутів сам відкриє вкладки
  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const result = await joinCouple(code);
    setBusy(false);
    setError(result.error);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">Код партнера</Text>
        <Text color="textMuted">Введи код, який тобі надіслали.</Text>
      </View>

      <TextField
        label="Код запрошення"
        placeholder="ABC234"
        value={code}
        onChangeText={(text) => {
          // Обрізаємо після нормалізації, щоб вставлений код із пробілами чи дефісами не втрачав символи
          setCode(normalizeInviteCode(text).slice(0, INVITE_CODE_LENGTH));
          setError(null);
        }}
        error={error}
        autoFocus
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={submit}
        style={{ letterSpacing: 4 }}
      />

      <View style={{ flex: 1 }} />
      <View style={{ gap: spacing.sm }}>
        <Button
          title={busy ? 'Підключаємо…' : 'Підключитися'}
          onPress={submit}
          disabled={!canSubmit}
        />
        <Button title="Назад" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
