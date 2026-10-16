import { Image } from 'expo-image';
import { ImageSquareIcon } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Icon } from './Icon';
import { Text } from './Text';

type PhotoSlotProps = {
  // Обране, але ще не збережене фото
  uri: string | null;
  aspectRatio?: number;
  onPress: () => void;
  // Що показати, коли нового фото немає (наприклад, уже збережене)
  fallback?: ReactNode;
};

// Велика область «додати фото»: по натисканню відкривається галерея
export function PhotoSlot({ uri, aspectRatio = 4 / 3, onPress, fallback }: PhotoSlotProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={uri || fallback ? 'Змінити фото' : 'Додати фото'}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.slot,
        {
          aspectRatio,
          borderRadius: radius.lg,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : fallback ? (
        <View style={StyleSheet.absoluteFill}>{fallback}</View>
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Icon icon={ImageSquareIcon} size={40} color="primary" weight="duotone" />
          <Text color="textMuted">Додати фото</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
