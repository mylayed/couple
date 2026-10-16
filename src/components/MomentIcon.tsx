import {
  AirplaneIcon,
  CoffeeIcon,
  FilmSlateIcon,
  ForkKnifeIcon,
  GiftIcon,
  HeartIcon,
  MusicNotesIcon,
  StarIcon,
  TreeIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';

import type { MomentIconName } from '@/services/moments';

export const MOMENT_ICON_GLYPHS: Record<MomentIconName, PhosphorIcon> = {
  heart: HeartIcon,
  airplane: AirplaneIcon,
  'fork-knife': ForkKnifeIcon,
  film: FilmSlateIcon,
  tree: TreeIcon,
  gift: GiftIcon,
  coffee: CoffeeIcon,
  music: MusicNotesIcon,
  star: StarIcon,
};

// Назва іконки приходить із бази, тож невідому показуємо зірочкою
export function momentGlyph(name: string | null): PhosphorIcon {
  return MOMENT_ICON_GLYPHS[name as MomentIconName] ?? StarIcon;
}
