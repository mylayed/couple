import * as Haptics from 'expo-haptics';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  icon?: PhosphorIcon;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  variant = 'primary',
  icon,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radius, spacing, motion } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.surface
        : 'transparent';
  const textColor = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withSpring(motion.pressScale, { damping: 15, stiffness: 300 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 12, stiffness: 250 }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[
        styles.base,
        {
          backgroundColor: background,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md - 2,
          borderColor: colors.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      <View style={[styles.row, { gap: spacing.sm }]}>
        {icon ? <Icon icon={icon} size={20} color={textColor} weight="bold" /> : null}
        <Text variant="subtitle" color={textColor}>
          {title}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
