import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { KeyIcon, ShareNetworkIcon } from 'phosphor-react-native';
import { Share, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme/ThemeProvider';

export default function Pair() {
  const { spacing } = useTheme();
  const name = useSession((s) => s.user?.name ?? '');
  const signOut = useSession((s) => s.signOut);
  const code = useSession((s) => s.inviteCode);

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
        <Text variant="title">{name}, запроси свою людину</Text>
        <Text color="textMuted">
          Надішли партнеру код. Коли він або вона введе його у себе, ви побачите одне одного.
        </Text>
      </View>

      <Card style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Твій код запрошення
        </Text>
        <Text variant="title" selectable style={{ letterSpacing: 6 }}>
          {code ?? '······'}
        </Text>
      </Card>

      <Button title="Надіслати код" icon={ShareNetworkIcon} onPress={share} />

      <View style={{ flex: 1 }} />

      <View style={{ gap: spacing.sm }}>
        <Button
          title="У мене є код партнера"
          icon={KeyIcon}
          variant="secondary"
          onPress={() => router.push('/join')}
        />
        <Button title="Увійти під іншим ім'ям" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}
