import { Platform } from 'react-native';

import 'expo-router/entry';

// Фонова задача віджета Android має бути зареєстрована в точці входу: Android запускає її
// без інтерфейсу, коли застосунок закрито
if (Platform.OS === 'android') {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { registerWidgetTaskHandler } =
    require('react-native-android-widget') as typeof import('react-native-android-widget');
  const { widgetTaskHandler } =
    require('./src/widget/task-handler') as typeof import('./src/widget/task-handler');
  /* eslint-enable @typescript-eslint/no-require-imports */
  registerWidgetTaskHandler(widgetTaskHandler);
}
