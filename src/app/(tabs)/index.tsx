import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Counter } from '@/components/Counter';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme/ThemeProvider';
import { daysBetween, pluralUk } from '@/utils/dates';

// Заглушка головної. Справжній лічильник від дати початку стосунків — Етап 5.
export default function Home() {
  const { spacing } = useTheme();
  const name = useSession((s) => s.user?.name ?? '');
  const pairedAt = useSession((s) => s.couple?.pairedAt);
  const days = pairedAt ? daysBetween(new Date(pairedAt)) : 0;

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text color="textMuted">Привіт, {name}</Text>
        <Text variant="title">Ви разом у Dotyk</Text>
      </View>

      <Counter value={days} label={`${pluralUk(days, ['день', 'дні', 'днів'])} разом`} />

      <Card style={{ gap: spacing.sm }}>
        <Text variant="subtitle">Скоро тут</Text>
        <Text color="textMuted">
          Лічильник від дати, коли ви познайомились, найближча річниця і питання дня.
        </Text>
      </Card>
    </Screen>
  );
}
