import {
  ChatTeardropDotsIcon,
  HandHeartIcon,
  HeartIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { useMemo } from 'react';

import { useAuth } from '@/store/auth';
import { saveRow, useRows, type Touch, type TouchKind } from './sync';

// «Тик» одним дотиком. Серію дотиків поспіль сервер надсилає партнеру одним push.

export const TOUCHES: { kind: TouchKind; label: string; icon: PhosphorIcon }[] = [
  { kind: 'heart', label: 'Серце', icon: HeartIcon },
  { kind: 'hug', label: 'Обійми', icon: HandHeartIcon },
  { kind: 'thinking', label: 'Думаю про тебе', icon: ChatTeardropDotsIcon },
];

export const touchMeta = (kind: TouchKind) => TOUCHES.find((t) => t.kind === kind) ?? TOUCHES[0];

// Що бачить партнер у сповіщенні й на головній
export const TOUCH_PHRASES: Record<TouchKind, string> = {
  heart: 'надсилає серце',
  hug: 'обіймає тебе',
  thinking: 'думає про тебе',
};

export function sendTouch(kind: TouchKind): void {
  saveRow('touches', { kind });
}

// Останні дотики від партнера й від мене
export function useLastTouches(): { fromPartner: Touch | null; fromMe: Touch | null } {
  const touches = useRows('touches');
  const userId = useAuth((s) => s.session?.user.id);
  return useMemo(() => {
    let fromPartner: Touch | null = null;
    let fromMe: Touch | null = null;
    for (const t of touches) {
      if (t.created_by === userId) {
        if (!fromMe || t.created_at > fromMe.created_at) fromMe = t;
      } else if (!fromPartner || t.created_at > fromPartner.created_at) {
        fromPartner = t;
      }
    }
    return { fromPartner, fromMe };
  }, [touches, userId]);
}
