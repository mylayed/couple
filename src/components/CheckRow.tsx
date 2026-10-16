import { CheckIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

type CheckRowProps = {
  title: string;
  subtitle?: string | null;
  done: boolean;
  onToggle: (done: boolean) => void;
  onPress?: () => void;
  right?: ReactNode;
};

// Пункт списку з відміткою «зроблено» ліворуч; зроблене перекреслене й приглушене
export function CheckRow({ title, subtitle, done, onToggle, onPress, right }: CheckRowProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={title}
        hitSlop={8}
        onPress={() => {
          if (done) haptics.select();
          else haptics.success();
          onToggle(!done);
        }}
        style={[
          styles.box,
          {
            borderRadius: radius.sm - 4,
            borderColor: done ? colors.success : colors.border,
            backgroundColor: done ? colors.success : colors.surface,
          },
        ]}
      >
        {done ? <Icon icon={CheckIcon} size={18} color="onPrimary" weight="bold" /> : null}
      </Pressable>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [styles.text, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text
          color={done ? 'textMuted' : 'text'}
          style={done ? styles.strike : undefined}
          numberOfLines={3}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </Pressable>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: { width: 28, height: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
});
