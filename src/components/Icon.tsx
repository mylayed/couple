import type { Icon as PhosphorIcon, IconWeight } from 'phosphor-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Colors } from '@/theme/tokens';

type IconColor = Exclude<keyof Colors, 'gradient'>;

type IconProps = {
  icon: PhosphorIcon;
  size?: number;
  color?: IconColor;
  weight?: IconWeight;
};

// duotone у кольорах теми дає м'який, «в міру милий» вигляд
export function Icon({ icon: Glyph, size = 24, color = 'text', weight = 'regular' }: IconProps) {
  const { colors } = useTheme();
  return (
    <Glyph
      size={size}
      color={colors[color]}
      weight={weight}
      duotoneColor={colors[color]}
      duotoneOpacity={0.25}
    />
  );
}
