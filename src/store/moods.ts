import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from '@/services/storage';
import type { MoodKind } from '@/services/sync';

// Що бачить партнер:
// • all — настрій і коментар
// • mood — лише настрій, коментар лишається на телефоні
// • private — нічого, настрій не потрапляє на сервер
export type MoodVisibility = 'all' | 'mood' | 'private';

export type MyMood = {
  id: string;
  mood: MoodKind;
  note: string | null;
  visibility: MoodVisibility;
};

type MoodsState = {
  // Чия це історія: після зміни пари вона не потрібна
  coupleId: string | null;
  // Власні настрої за датою YYYY-MM-DD, разом із тим, що партнер не бачить
  entries: Record<string, MyMood>;
  // Останній вибір приватності стає типовим для наступного дня
  defaultVisibility: MoodVisibility;
};

export const useMyMoods = create<MoodsState>()(
  persist((): MoodsState => ({ coupleId: null, entries: {}, defaultVisibility: 'all' }), {
    name: StorageKeys.moods,
    storage: createJSONStorage(() => zustandStorage),
  }),
);
