import { router } from 'expo-router';
import { HeartIcon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';

export default function Welcome() {
  const { colors, spacing } = useTheme();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.hero, { gap: spacing.lg }]}>
        <View
          style={[styles.mark, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Icon icon={HeartIcon} size={56} color="primary" weight="duotone" />
        </View>
        <Text variant="display" align="center">
          Dotyk
        </Text>
        <Text variant="subtitle" color="textMuted" align="center">
          Місце для вас двох: ваші дні разом, плани й спогади
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Button title="Створити акаунт" onPress={() => router.push('/sign-up')} />
        <GoogleButton />
        <Button
          title="У мене вже є акаунт"
          variant="ghost"
          onPress={() => router.push('/sign-in')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
