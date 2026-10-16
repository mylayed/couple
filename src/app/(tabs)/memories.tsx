import { useRouter } from 'expo-router';
import { ChartBarIcon, HourglassMediumIcon, ImagesIcon, PlusIcon } from 'phosphor-react-native';
import { useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { MemoryTile } from '@/components/MemoryTile';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { ToolCard } from '@/components/ToolCard';
import { useCapsuleList } from '@/services/capsules';
import { groupByMonth, useCommentCounts, useMemories } from '@/services/memories';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDaysLeft, formatMonthYear, daysBetween, parseIsoDate } from '@/utils/dates';

const COLUMNS = 2;

function capsuleSubtitle(closed: { opens_on: string }[], opened: number): string {
  if (closed.length > 0) {
    return `Наступна відкриється ${formatDaysLeft(daysBetween(new Date(), parseIsoDate(closed[0].opens_on)))}`;
  }
  return opened > 0 ? 'Прочитати відкриті листи' : 'Лист собі в майбутнє';
}

export default function Memories() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const memories = useMemories();
  const comments = useCommentCounts();
  const capsules = useCapsuleList();
  const months = groupByMonth(memories);
  const tileWidth = Math.floor((width - spacing.lg * 2 - spacing.md * (COLUMNS - 1)) / COLUMNS);

  return (
    <Screen>
      <Text variant="title">Спогади</Text>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <ToolCard
          icon={HourglassMediumIcon}
          title="Капсула часу"
          subtitle={capsuleSubtitle(capsules.closed, capsules.opened.length)}
          onPress={() => router.push('/capsule')}
        />
        <ToolCard
          icon={ChartBarIcon}
          title="Підсумок року"
          subtitle="Побачення, подорожі, головне"
          onPress={() => router.push('/year')}
        />
      </View>

      <Button title="Новий спогад" icon={PlusIcon} onPress={() => router.push('/memory/new')} />

      {months.length === 0 ? (
        <EmptyState
          icon={ImagesIcon}
          title="Перший спогад попереду"
          description="Фото й кілька слів до важливих днів, щоб нічого не загубилось."
        />
      ) : null}

      {months.map((group) => (
        <View key={group.key} style={{ gap: spacing.md }}>
          <Text variant="subtitle">{formatMonthYear(group.year, group.month)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            {group.items.map((memory) => (
              <MemoryTile
                key={memory.id}
                memory={memory}
                width={tileWidth}
                comments={comments.get(memory.id) ?? 0}
                onPress={() => router.push(`/memory/${memory.id}`)}
              />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}
