import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

type EmptyStateProps = {
  icon: PhosphorIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.container, { gap: spacing.md, padding: spacing.xl }]}>
      <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon icon={icon} size={40} color="primary" weight="duotone" />
      </View>
      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text color="textMuted" align="center">
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
