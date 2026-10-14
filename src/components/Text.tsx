import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Colors, TypographyVariant } from '@/theme/tokens';

type TextColor = Exclude<keyof Colors, 'gradient'>;

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  return (
    <RNText
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
