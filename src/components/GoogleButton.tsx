import { GoogleLogoIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { isGoogleSignInAvailable, signInWithGoogle } from '@/services/google';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

// Після успішного входу захист маршрутів сам поведе далі
export function GoogleButton() {
  const { spacing } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isGoogleSignInAvailable) return null;

  const press = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.error) setError(result.error);
  };

  return (
    <View style={{ gap: spacing.xs }}>
      <Button
        title={busy ? 'Входимо…' : 'Продовжити з Google'}
        icon={GoogleLogoIcon}
        variant="secondary"
        onPress={press}
        disabled={busy}
      />
      {error ? (
        <Text variant="caption" color="primary" align="center">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
