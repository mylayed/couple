import {
  AirplaneIcon,
  CakeIcon,
  HeartIcon,
  SparkleIcon,
  StarIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';

import type { DateKind } from '@/services/calendar';

export const DATE_KIND_ICONS: Record<DateKind, PhosphorIcon> = {
  anniversary: HeartIcon,
  birthday: CakeIcon,
  first: SparkleIcon,
  trip: AirplaneIcon,
  other: StarIcon,
};
