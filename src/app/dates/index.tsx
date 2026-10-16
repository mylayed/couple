import { useRouter } from 'expo-router';
import { CalendarHeartIcon, PlusIcon } from 'phosphor-react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DATE_KIND_ICONS } from '@/components/DateKindIcon';
import { EmptyState } from '@/components/EmptyState';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useCalendar, type CalendarEntry } from '@/services/calendar';
import { useTheme } from '@/theme/ThemeProvider';
import {
  formatDayMonth,
  formatDaysLeft,
  formatOrdinal,
  parseIsoDate,
  pluralUk,
} from '@/utils/dates';

function subtitle(e: CalendarEntry): string {
  if (!e.next || e.daysLeft === null) {
    return `${formatDayMonth(parseIsoDate(e.date), true)} · вже минуло`;
  }
  // Для дня народження — вік, для решти — котра річниця
  const years = !e.years
    ? ''
    : e.kind === 'birthday'
      ? ` · ${e.years} ${pluralUk(e.years, ['рік', 'роки', 'років'])}`
      : ` · ${formatOrdinal(e.years)} річниця`;
  return `${formatDayMonth(e.next)} · ${formatDaysLeft(e.daysLeft)}${years}`;
}

export default function Dates() {
  const router = useRouter();
  const { spacing } = useTheme();
  const entries = useCalendar();
  const upcoming = entries.filter((e) => e.next);
  const past = entries.filter((e) => !e.next);

  const open = (e: CalendarEntry) =>
    // Річницю й дні народження змінюють у налаштуваннях профілю та пари
    e.id ? router.push(`/dates/${e.id}`) : router.push('/settings');

  return (
    <Screen edges={['bottom']}>
      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarHeartIcon}
          title="Поки що жодної дати"
          description="Додайте річниці, перший поцілунок, першу подорож. Ми нагадаємо напередодні."
        />
      ) : null}

      {upcoming.length > 0 ? (
        <Card style={{ gap: spacing.lg }}>
          {upcoming.map((e) => (
            <ListItem
              key={e.key}
              icon={DATE_KIND_ICONS[e.kind]}
              title={e.title}
              subtitle={subtitle(e)}
              accent={e.daysLeft !== null && e.daysLeft <= 7}
              onPress={() => open(e)}
            />
          ))}
        </Card>
      ) : null}

      {past.length > 0 ? (
        <Card style={{ gap: spacing.lg }}>
          <Text variant="subtitle">Уже було</Text>
          {past.map((e) => (
            <ListItem
              key={e.key}
              icon={DATE_KIND_ICONS[e.kind]}
              title={e.title}
              subtitle={subtitle(e)}
              onPress={() => open(e)}
            />
          ))}
        </Card>
      ) : null}

      <Button title="Додати дату" icon={PlusIcon} onPress={() => router.push('/dates/new')} />
    </Screen>
  );
}
