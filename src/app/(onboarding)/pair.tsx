import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { KeyIcon, ShareNetworkIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { signOut } from '@/services/auth';
import { requestInviteCode } from '@/services/couple';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';

export default function Pair() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const name = useAuth((s) => s.profile?.name);
  const code = useCouple((s) => s.couple?.invite_code ?? null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Код створює сервер. Коли партнер його введе, Realtime оновить пару і захист маршрутів відкриє вкладки.
  useEffect(() => {
    if (code) return;
    let active = true;
    requestInviteCode().then((result) => {
      if (active) setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [code, attempt]);

  const share = async () => {
    if (!code) return;
    Haptics.selectionAsync();
    await Share.share({
      message: `Приєднуйся до мене в Dotyk! Мій код: ${code}`,
    });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="title">{name ? `${name}, запроси` : 'Запроси'} свою людину</Text>
        <Text color="textMuted">
          Надішли партнеру код. Коли він або вона введе його у себе, ви побачите одне одного.
        </Text>
      </View>

      <Card style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Твій код запрошення
        </Text>
        {code ? (
          <Text variant="title" selectable style={{ letterSpacing: 6 }}>
            {code}
          </Text>
        ) : error ? (
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text color="textMuted">{error}</Text>
            <Button
              title="Спробувати ще раз"
              variant="ghost"
              onPress={() => {
                setError(null);
                setAttempt((n) => n + 1);
              }}
            />
          </View>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </Card>

      <Button title="Надіслати код" icon={ShareNetworkIcon} onPress={share} disabled={!code} />

      <View style={{ flex: 1 }} />

      <View style={{ gap: spacing.sm }}>
        <Button
          title="У мене є код партнера"
          icon={KeyIcon}
          variant="secondary"
          onPress={() => router.push('/join')}
        />
        <Button title="Вийти з акаунта" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}
