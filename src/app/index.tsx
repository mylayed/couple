import {
  CalendarHeartIcon,
  HandHeartIcon,
  HeartIcon,
  MapTrifoldIcon,
  MoonIcon,
  SparkleIcon,
  SunIcon,
} from 'phosphor-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Counter } from '@/components/Counter';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode } from '@/theme/tokens';
import { daysBetween, pluralUk } from '@/utils/dates';

// Тимчасовий екран-вітрина дизайн-системи. На Етапі 2 його замінять вкладки.
const DEMO_START = new Date(2024, 1, 14);

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: 'light', title: 'Світла' },
  { mode: 'dark', title: 'Темна' },
  { mode: 'system', title: 'Системна' },
];

export default function DesignShowcase() {
  const { spacing, mode, setMode, isDark } = useTheme();
  const days = daysBetween(DEMO_START);

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text variant="title">Dotyk</Text>

        <Counter
          value={days}
          label={`${pluralUk(days, ['день', 'дні', 'днів'])} разом`}
          caption="з 14 лютого 2024"
        />

        <Card style={{ gap: spacing.sm }}>
          <Text variant="subtitle">Коли ми востаннє…</Text>
          <Text color="textMuted">Ходили на побачення — 6 днів тому</Text>
          <Text variant="caption" color="textMuted">
            Перевірка гліфів: і ї є ґ І Ї Є Ґ — «Ґанок, їжак, єнот, ірис»
          </Text>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Іконки</Text>
          <View style={[styles.row, { gap: spacing.lg }]}>
            <Icon icon={HeartIcon} size={32} color="primary" weight="duotone" />
            <Icon icon={CalendarHeartIcon} size={32} color="secondary" weight="duotone" />
            <Icon icon={MapTrifoldIcon} size={32} color="primary" weight="duotone" />
            <Icon icon={SparkleIcon} size={32} color="secondary" weight="fill" />
            <Icon icon={isDark ? MoonIcon : SunIcon} size={32} color="textMuted" />
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Тема</Text>
          <View style={[styles.row, { gap: spacing.sm }]}>
            {MODES.map((m) => (
              <Button
                key={m.mode}
                title={m.title}
                variant={mode === m.mode ? 'primary' : 'secondary'}
                onPress={() => setMode(m.mode)}
              />
            ))}
          </View>
        </Card>

        <Button title="Надіслати «тик»" icon={HandHeartIcon} />
        <Button title="Додати момент" variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
