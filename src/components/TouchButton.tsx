import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

type TouchButtonProps = { icon: PhosphorIcon; label: string; onPress: () => void };

// Кругла кнопка дотику: на натискання іконка «б'ється», як серце
export function TouchButton({ icon, label, onPress }: TouchButtonProps) {
  const { colors, spacing } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.success();
        scale.set(
          withSequence(
            withTiming(1.25, { duration: 120 }),
            withTiming(0.95, { duration: 100 }),
            withSpring(1, { damping: 8, stiffness: 220 }),
          ),
        );
        onPress();
      }}
      style={[styles.item, { gap: spacing.xs }]}
    >
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: colors.background, borderColor: colors.border },
          animatedStyle,
        ]}
      >
        <Icon icon={icon} size={30} color="primary" weight="duotone" />
      </Animated.View>
      <View>
        <Text variant="caption" align="center" numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
