import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { usePhotoSource } from '@/services/photos';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type AvatarProps = {
  name: string;
  // Шлях у бакеті avatars або готове посилання
  path: string | null;
  size?: number;
};

// Кругле фото профілю; без фото — перша літера імені
export function Avatar({ name, path, size = 48 }: AvatarProps) {
  const { colors } = useTheme();
  const source = usePhotoSource('avatars', path);
  const initial = name.trim().charAt(0).toUpperCase() || '♥';

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          accessibilityLabel={`Фото: ${name}`}
        />
      ) : (
        <Text
          color="primary"
          style={{ fontSize: size * 0.42, lineHeight: size * 0.56 }}
          accessibilityLabel={name}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
