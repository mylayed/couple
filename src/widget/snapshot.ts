import { storage, StorageKeys } from '@/services/storage';

// Готові значення для віджета. Застосунок оновлює їх після синхронізації, а віджет
// читає у фоновій задачі, коли застосунок закрито. Дні рахуються вже під час малювання,
// тож лічильник не застаріває, навіть якщо застосунок давно не відкривали.
export type WidgetSnapshot = {
  since: string | null; // YYYY-MM-DD або ISO-час з'єднання пари
  partnerName: string | null;
  lastMoment: { title: string; on: string } | null;
};

export function readWidgetSnapshot(): WidgetSnapshot | null {
  const raw = storage.getString(StorageKeys.widget);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetSnapshot;
  } catch {
    return null;
  }
}

export function writeWidgetSnapshot(snapshot: WidgetSnapshot | null): void {
  if (snapshot) storage.set(StorageKeys.widget, JSON.stringify(snapshot));
  else storage.remove(StorageKeys.widget);
}
