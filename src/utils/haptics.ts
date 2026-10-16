import * as Haptics from 'expo-haptics';

// Вібровідгук — приємна дрібниця, тож його збій (немає модуля, стара збірка, веб)
// не має сипати помилками чи ламати натискання
const quietly = (call: () => Promise<void>) => {
  try {
    call().catch(() => {});
  } catch {
    // Модуль недоступний на цій платформі
  }
};

export const haptics = {
  tap: () => quietly(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => quietly(() => Haptics.selectionAsync()),
  success: () => quietly(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
