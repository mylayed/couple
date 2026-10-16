import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Counter } from '@/components/Counter';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { daysBetween, parseIsoDate, pluralUk } from '@/utils/dates';

// Заглушка головної. Справжній лічильник від дати початку стосунків — Етап 5.
export default function Home() {
  const { spacing } = useTheme();
  const name = useAuth((s) => s.profile?.name);
  const partnerName = useCouple((s) => s.partner?.name);
  // Поки дату початку не задано, рахуємо від з'єднання в Dotyk
  const since = useCouple((s) => s.couple?.started_on ?? s.pairedAt);
  const days = since ? daysBetween(parseIsoDate(since)) : 0;

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text color="textMuted">{name ? `Привіт, ${name}` : 'Привіт'}</Text>
        <Text variant="title">{partnerName ? `Ти і ${partnerName}` : 'Ви разом у Dotyk'}</Text>
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
