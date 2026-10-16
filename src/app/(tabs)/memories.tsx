import { useRouter } from 'expo-router';
import { ChartBarIcon, HourglassMediumIcon, ImagesIcon, PlusIcon } from 'phosphor-react-native';
import { useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { MemoryTile } from '@/components/MemoryTile';
import { Text } from '@/components/Text';
import { ToolCard } from '@/components/ToolCard';
import { useCapsuleList } from '@/services/capsules';
import { groupByMonth, useCommentCounts, useMemories } from '@/services/memories';
import type { Memory } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';
import { daysBetween, formatDaysLeft, formatMonthYear, parseIsoDate } from '@/utils/dates';

const COLUMNS = 2;

// Стрічка віртуалізована: рядок — це або заголовок місяця, або ряд плиток
type Row =
  { type: 'month'; key: string; title: string } | { type: 'tiles'; key: string; items: Memory[] };

function toRows(memories: Memory[]): Row[] {
  const rows: Row[] = [];
  for (const group of groupByMonth(memories)) {
    rows.push({ type: 'month', key: group.key, title: formatMonthYear(group.year, group.month) });
    for (let i = 0; i < group.items.length; i += COLUMNS) {
      const items = group.items.slice(i, i + COLUMNS);
      rows.push({ type: 'tiles', key: items[0].id, items });
    }
  }
  return rows;
}

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
  const rows = useMemo(() => toRows(memories), [memories]);
  const tileWidth = Math.floor((width - spacing.lg * 2 - spacing.md * (COLUMNS - 1)) / COLUMNS);

  const header = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.sm }}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon={ImagesIcon}
            title="Перший спогад попереду"
            description="Фото й кілька слів до важливих днів, щоб нічого не загубилось."
          />
        }
        contentContainerStyle={{ flexGrow: 1, padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item: row }) =>
          row.type === 'month' ? (
            <Text variant="subtitle" style={{ paddingTop: spacing.sm }}>
              {row.title}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {row.items.map((memory) => (
                <MemoryTile
                  key={memory.id}
                  memory={memory}
                  width={tileWidth}
                  comments={comments.get(memory.id) ?? 0}
                  onPress={() => router.push(`/memory/${memory.id}`)}
                />
              ))}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
