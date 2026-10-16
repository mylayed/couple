import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from '@/services/storage';

// Налаштування сповіщень цього телефона. Живуть лише в MMKV: на іншому пристрої вони свої.

export type NotificationPrefs = {
  // Чи вже питали дозвіл через картку на головній
  asked: boolean;
  enabled: boolean;
  questionReminder: boolean;
  questionHour: number; // 0–23
  momentReminders: boolean;
  dateReminders: boolean;
  // Push про дії партнера: листівки, дотики, відповіді, коментарі, відмітки, дати
  partnerActivity: boolean;
  // Токен, зареєстрований на сервері; потрібен, щоб прибрати його після виходу
  pushToken: string | null;
};

export const useNotificationPrefs = create<NotificationPrefs>()(
  persist(
    (): NotificationPrefs => ({
      asked: false,
      enabled: false,
      questionReminder: true,
      questionHour: 20,
      momentReminders: true,
      dateReminders: true,
      partnerActivity: true,
      pushToken: null,
    }),
    {
      name: StorageKeys.notifications,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
