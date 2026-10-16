import { View } from 'react-native';

import type { Points } from '@/services/points';
import { useTheme } from '@/theme/ThemeProvider';
import { pluralUk } from '@/utils/dates';
import { Card } from './Card';
import { Text } from './Text';
import { Tree } from './Tree';

type TreeCardProps = {
  points: Points;
  compact?: boolean;
  children?: React.ReactNode;
};

// Дерево стосунків із рівнем і поступом до наступного
export function TreeCard({ points, compact = false, children }: TreeCardProps) {
  const { colors, radius, spacing } = useTheme();
  const { total, level } = points;
  const progress = Math.min(1, (total - level.min) / (level.next - level.min));
  const left = level.next - total;

  return (
    <Card style={{ gap: spacing.md }}>
      <View
        style={{
          flexDirection: compact ? 'row' : 'column',
          alignItems: 'center',
          gap: compact ? spacing.md : spacing.sm,
        }}
      >
        <Tree stage={level.stage} size={compact ? 96 : 200} />
        <View
          style={{
            flex: compact ? 1 : undefined,
            gap: spacing.xs,
            alignItems: compact ? 'flex-start' : 'center',
          }}
        >
          <Text variant="caption" color="textMuted">
            Дерево стосунків · рівень {level.level}
          </Text>
          <Text variant={compact ? 'subtitle' : 'title'}>{level.title}</Text>
          <Text color="primary">
            {total} {pluralUk(total, ['бал', 'бали', 'балів'])}
          </Text>
        </View>
      </View>
      <View style={{ gap: spacing.xs }}>
        <View
          style={{
            height: 8,
            borderRadius: radius.pill,
            backgroundColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: '100%',
              borderRadius: radius.pill,
              backgroundColor: colors.success,
            }}
          />
        </View>
        <Text variant="caption" color="textMuted">
          Ще {left} {pluralUk(left, ['бал', 'бали', 'балів'])} до рівня {level.level + 1}
        </Text>
      </View>
      {children}
    </Card>
  );
}
