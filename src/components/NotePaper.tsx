import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { NoteStyle } from '@/services/notes';
import { useTheme } from '@/theme/ThemeProvider';

// Тло листівки: м'який відтінок одного з кольорів теми або фірмовий градієнт
export function useNoteTint(style: NoteStyle): [string, string] {
  const { colors } = useTheme();
  // Шістнадцяткові кольори теми + прозорість 0x26 (≈15%)
  const soft = (hex: string) => `${hex}26`;
  switch (style) {
    case 'violet':
      return [soft(colors.secondary), soft(colors.secondary)];
    case 'mint':
      return [soft(colors.success), soft(colors.success)];
    case 'dawn':
      return [soft(colors.gradient[0]), soft(colors.gradient[1])];
    default:
      return [soft(colors.primary), soft(colors.primary)];
  }
}

type NotePaperProps = { noteStyle: NoteStyle; children: ReactNode; minHeight?: number };

export function NotePaper({ noteStyle, children, minHeight = 160 }: NotePaperProps) {
  const { colors, radius, spacing } = useTheme();
  const tint = useNoteTint(noteStyle);
  return (
    <View
      style={[
        styles.paper,
        { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <LinearGradient
        colors={tint}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: spacing.lg, gap: spacing.md, minHeight }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { overflow: 'hidden', borderWidth: 1 },
});
