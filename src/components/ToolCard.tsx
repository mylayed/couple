import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './Text';

type ToolCardProps = {
  icon: PhosphorIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
};

// Плитка-вхід до окремого екрана; дві таких стоять у ряд
export function ToolCard({ icon, title, subtitle, onPress }: ToolCardProps) {
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
