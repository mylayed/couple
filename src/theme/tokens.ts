export type ThemeMode = 'light' | 'dark' | 'system';

export type Colors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  border: string;
  success: string;
  onPrimary: string;
  gradient: [string, string];
};

export const lightColors: Colors = {
  background: '#FFF7F5',
  surface: '#FFFFFF',
  text: '#2A1F2D',
  textMuted: '#8A7A8C',
  primary: '#FF5D73',
  secondary: '#7C5CFF',
  border: '#F0E4E4',
  success: '#3DDC97',
  onPrimary: '#FFFFFF',
  gradient: ['#FF5D73', '#7C5CFF'],
};

export const darkColors: Colors = {
  background: '#14111A',
  surface: '#1E1A27',
  text: '#F5EEF7',
  textMuted: '#A094A8',
  primary: '#FF7A8C',
  secondary: '#9B85FF',
  border: '#2C2638',
  success: '#4EE3A5',
  onPrimary: '#FFFFFF',
  gradient: ['#FF7A8C', '#9B85FF'],
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 12, md: 16, lg: 24, pill: 999 } as const;

// Імена шрифтів з @expo-google-fonts (усі підтримують кирилицю)
export const fonts = {
  heading: 'Unbounded_700Bold',
  headingMedium: 'Unbounded_500Medium',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.heading, fontSize: 56, lineHeight: 64 },
  title: { fontFamily: fonts.headingMedium, fontSize: 24, lineHeight: 32 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
} as const;

export type TypographyVariant = keyof typeof typography;

// Тривалості анімацій: коротко й пружно
export const motion = {
  fast: 200,
  normal: 300,
  slow: 400,
  pressScale: 0.96,
} as const;
