import { ChatCircleIcon, QuotesIcon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { usePendingPhoto } from '@/services/memories';
import type { Memory } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, parseIsoDate } from '@/utils/dates';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { Text } from './Text';

type MemoryTileProps = {
  memory: Memory;
  width: number;
  comments: number;
  onPress: () => void;
};

// Плитка стрічки: мініатюра (або підпис, якщо фото немає), дата й кількість коментарів
export function MemoryTile({ memory, width, comments, onPress }: MemoryTileProps) {
  const { colors, radius, spacing } = useTheme();
  const pending = usePendingPhoto(memory.id);
  const hasPhoto = Boolean(pending || memory.thumb_path);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Спогад ${formatDayMonth(parseIsoDate(memory.happened_on), true)}`}
      onPress={onPress}
      style={({ pressed }) => ({ width, gap: spacing.xs, opacity: pressed ? 0.7 : 1 })}
    >
      {hasPhoto ? (
        <Photo
          bucket="memories"
          path={memory.thumb_path}
          localUri={pending?.thumb.uri}
          style={{ width, height: width, borderRadius: radius.md }}
        />
      ) : (
        <View
          style={{
            width,
            height: width,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.xs,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Icon icon={QuotesIcon} size={22} color="secondary" weight="fill" />
          <Text numberOfLines={5}>{memory.caption}</Text>
        </View>
      )}
      {hasPhoto && memory.caption ? (
        <Text variant="caption" numberOfLines={2}>
          {memory.caption}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
          {formatDayMonth(parseIsoDate(memory.happened_on))}
        </Text>
        {comments > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Icon icon={ChatCircleIcon} size={14} color="textMuted" />
            <Text variant="caption" color="textMuted">
              {comments}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
