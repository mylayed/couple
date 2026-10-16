import { Image, type ImageStyle } from 'expo-image';
import { ImageIcon } from 'phosphor-react-native';
import type { StyleProp } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { usePhotoSource, type PhotoBucket } from '@/services/photos';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

type PhotoProps = {
  bucket: PhotoBucket;
  path: string | null;
  // Локальна копія, поки фото ще завантажується
  localUri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain';
  accessibilityLabel?: string;
};

// Фото з приватного бакета: підписане посилання, дисковий кеш і заглушка, поки його немає
export function Photo({
  bucket,
  path,
  localUri,
  style,
  contentFit = 'cover',
  accessibilityLabel,
}: PhotoProps) {
  const { colors } = useTheme();
  const remote = usePhotoSource(bucket, localUri ? null : path);
  const source = localUri ? { uri: localUri } : remote;

  return (
    <View style={[styles.frame, { backgroundColor: colors.border }, style]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={200}
          cachePolicy="disk"
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <Icon icon={ImageIcon} size={28} color="textMuted" weight="duotone" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
