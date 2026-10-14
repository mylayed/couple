import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

// Світла тема: м'яка тінь. Темна: тонка рамка замість тіні.
export function Card({ style, ...rest }: ViewProps) {
  const { colors, radius, spacing, isDark } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        isDark
          ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }
          : styles.shadow,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  shadow: {
    boxShadow: '0 8px 24px rgba(42, 31, 45, 0.08)',
  },
});
