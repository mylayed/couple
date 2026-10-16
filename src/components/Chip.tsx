import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

type ChipProps = {
  label?: string;
  icon?: PhosphorIcon;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

// Невелика кнопка-перемикач для вибору з кількох варіантів
export function Chip({ label, icon, selected = false, onPress, accessibilityLabel }: ChipProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[
        styles.base,
        {
          gap: spacing.xs,
          borderRadius: radius.pill,
          paddingHorizontal: label ? spacing.md : spacing.sm + 2,
          paddingVertical: spacing.sm,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      {icon ? (
        <Icon icon={icon} size={20} color={selected ? 'onPrimary' : 'primary'} weight="duotone" />
      ) : null}
      {label ? (
        <Text variant="caption" color={selected ? 'onPrimary' : 'text'}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});
