import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text as RNText } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type CounterProps = {
  value: number;
  label: string;
  caption?: string;
};

// Головний лічильник: градієнт primary → secondary і велике число Unbounded
export function Counter({ value, label, caption }: CounterProps) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.xs }]}
    >
      <RNText style={[typography.display, { color: colors.onPrimary }]}>{value}</RNText>
      <Text variant="subtitle" color="onPrimary">
        {label}
      </Text>
      {caption ? (
        <Text variant="caption" color="onPrimary" style={styles.caption}>
          {caption}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  caption: { opacity: 0.85 },
});
