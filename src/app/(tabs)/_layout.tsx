import { Tabs } from 'expo-router/js-tabs';
import {
  ClockCounterClockwiseIcon,
  GearSixIcon,
  HouseIcon,
  ImagesIcon,
  MapTrifoldIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotificationNavigation } from '@/services/notifications';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const TAB_BAR_HEIGHT = 58;

// Активна вкладка: duotone-іконка в кольорі primary, неактивні — regular
function tabIcon(Glyph: PhosphorIcon) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    // Навігатор передає кольори з теми, тобто звичайні рядки
    const tint = color as string;
    return (
      <Glyph
        size={24}
        color={tint}
        weight={focused ? 'duotone' : 'regular'}
        duotoneColor={tint}
        duotoneOpacity={0.25}
      />
    );
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  useNotificationNavigation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // Стандартні 49 pt замалі для підпису Manrope: кирилиця з виносними елементами обрізається
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Головна', tabBarIcon: tabIcon(HouseIcon) }} />
      <Tabs.Screen
        name="moments"
        options={{ title: 'Моменти', tabBarIcon: tabIcon(ClockCounterClockwiseIcon) }}
      />
      <Tabs.Screen name="plans" options={{ title: 'Плани', tabBarIcon: tabIcon(MapTrifoldIcon) }} />
      <Tabs.Screen
        name="memories"
        options={{ title: 'Спогади', tabBarIcon: tabIcon(ImagesIcon) }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Профіль', tabBarIcon: tabIcon(GearSixIcon) }}
      />
    </Tabs>
  );
}
