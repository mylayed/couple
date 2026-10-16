import {
  FilmSlateIcon,
  ForkKnifeIcon,
  GiftIcon,
  ListBulletsIcon,
  ShoppingCartIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';

import type { ListKind } from '@/services/sync';

export const LIST_KIND_ICONS: Record<ListKind, PhosphorIcon> = {
  movies: FilmSlateIcon,
  restaurants: ForkKnifeIcon,
  gifts: GiftIcon,
  shopping: ShoppingCartIcon,
  other: ListBulletsIcon,
};

// Вид приходить із бази, тож невідомий показуємо звичайним списком
export const listKindGlyph = (kind: string): PhosphorIcon =>
  LIST_KIND_ICONS[kind as ListKind] ?? ListBulletsIcon;
