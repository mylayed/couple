import { useRouter } from 'expo-router';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { PlusIcon, SparkleIcon, SpinnerIcon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AddField } from '@/components/AddField';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow } from '@/components/CheckRow';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { listKindGlyph } from '@/components/ListKindIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  addBucketItem,
  MAX_ITEM_TITLE,
  setBucketDone,
  useBucketList,
  useListSummaries,
  type ListSummary,
} from '@/services/plans';
import { useTheme } from '@/theme/ThemeProvider';
import { pluralUk } from '@/utils/dates';

const BUCKET_PREVIEW = 5;

function ToolCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: PhosphorIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
    >
      <Card style={{ flex: 1, gap: spacing.xs, padding: spacing.md }}>
        <Icon icon={icon} size={28} color="primary" weight="duotone" />
        <Text variant="subtitle">{title}</Text>
        <Text variant="caption" color="textMuted">
          {subtitle}
        </Text>
      </Card>
    </Pressable>
  );
}

function listSubtitle(l: ListSummary): string {
  if (l.openCount === 0 && l.doneCount === 0) return 'Порожній';
  const open = `${l.openCount} ${pluralUk(l.openCount, ['пункт', 'пункти', 'пунктів'])}`;
  return l.doneCount > 0 ? `${open} · зроблено ${l.doneCount}` : open;
}

export default function Plans() {
  const router = useRouter();
  const { spacing } = useTheme();
  const bucket = useBucketList();
  const lists = useListSummaries();
  const preview = bucket.open.slice(0, BUCKET_PREVIEW);
  const total = bucket.open.length + bucket.done.length;

  return (
    <Screen>
      <Text variant="title">Плани</Text>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <ToolCard
          icon={SparkleIcon}
          title="Ідея побачення"
          subtitle="За бюджетом і настроєм"
          onPress={() => router.push('/idea')}
        />
        <ToolCard
          icon={SpinnerIcon}
          title="Рулетка"
          subtitle="Що їсти, куди піти, що дивитись"
          onPress={() => router.push('/roulette')}
        />
      </View>

      <Card style={{ gap: spacing.md }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Text variant="subtitle">Бакет-ліст</Text>
          {total > 0 ? (
            <Text variant="caption" color="textMuted">
              Здійснено {bucket.done.length} з {total}
            </Text>
          ) : null}
        </View>
        {total === 0 ? (
          <Text color="textMuted">Запишіть, що мрієте зробити разом, і відмічайте здійснене.</Text>
        ) : null}
        {preview.map((item) => (
          <CheckRow
            key={item.id}
            title={item.title}
            done={false}
            onToggle={(value) => setBucketDone(item.id, value)}
            onPress={() => router.push(`/bucket/${item.id}`)}
          />
        ))}
        <AddField
          placeholder="Нова мрія"
          maxLength={MAX_ITEM_TITLE}
          onAdd={(title) => addBucketItem(title)}
        />
        {total > 0 ? (
          <Button
            title={
              bucket.open.length > BUCKET_PREVIEW
                ? `Усі мрії (${bucket.open.length})`
                : 'Відкрити бакет-ліст'
            }
            variant="ghost"
            onPress={() => router.push('/bucket')}
          />
        ) : null}
      </Card>

      <Card style={{ gap: spacing.lg }}>
        <Text variant="subtitle">Спільні списки</Text>
        {lists.length === 0 ? (
          <Text color="textMuted">Фільми на вечір, ресторани, ідеї подарунків, покупки.</Text>
        ) : null}
        {lists.map((l) => (
          <ListItem
            key={l.id}
            icon={listKindGlyph(l.kind)}
            title={l.title}
            subtitle={listSubtitle(l)}
            onPress={() => router.push(`/lists/${l.id}`)}
          />
        ))}
        <Button
          title="Новий список"
          icon={PlusIcon}
          variant="secondary"
          onPress={() => router.push('/lists/new')}
        />
      </Card>
    </Screen>
  );
}
