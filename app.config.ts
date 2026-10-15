import type { ConfigContext, ExpoConfig } from 'expo/config';

// Статичний конфіг лежить в app.json; тут лише те, що залежить від значень у .env
export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  // Плагін Google Sign-In потребує схему повернення для iOS — «перевернутий» iOS client ID.
  // Поки iOS-клієнта немає, плагін не підключаємо: на Android він не потрібен.
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (iosClientId) {
    const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`;
    plugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme }]);
  }

  return { ...config, name: config.name ?? 'Dotyk', slug: config.slug ?? 'dotyk', plugins };
};
