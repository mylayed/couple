import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

type ListItemProps = {
  icon?: PhosphorIcon;
  title: string;
  subtitle?: string;
  // Підсвітити підзаголовок, наприклад «давно не було»
  accent?: boolean;
  right?: ReactNode;
  onPress?: () => void;
};

// Рядок списку всередині Card: іконка, назва, підпис і дія праворуч
export function ListItem({ icon, title, subtitle, accent, right, onPress }: ListItemProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, { gap: spacing.md, opacity: pressed ? 0.6 : 1 }]}
    >
      {icon ? (
        <View
          style={[
            styles.badge,
            {
              borderRadius: radius.md,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Icon icon={icon} size={24} color="primary" weight="duotone" />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="subtitle" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={accent ? 'primary' : 'textMuted'}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon icon={CaretRightIcon} size={18} color="textMuted" /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
