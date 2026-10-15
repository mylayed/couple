import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme/ThemeProvider';

// Тимчасовий вхід лише з іменем. Apple, Google та пошта з'являться на Етапі 3.
export default function SignIn() {
  const { spacing } = useTheme();
  const signIn = useSession((s) => s.signIn);
  const [name, setName] = useState('');
  const canSubmit = name.trim().length > 0;

  // Після входу захист маршрутів сам перенаправить на екран запрошення
  const submit = () => {
    if (canSubmit) signIn(name);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">Привіт!</Text>
        <Text color="textMuted">Як тебе звати? Так тебе бачитиме партнер.</Text>
      </View>

      <TextField
        label="Ім'я"
        placeholder="Наприклад, Олена"
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        returnKeyType="done"
        onSubmitEditing={submit}
        maxLength={40}
      />

      <View style={{ flex: 1 }} />
      <Button title="Продовжити" onPress={submit} disabled={!canSubmit} />
    </Screen>
  );
}
