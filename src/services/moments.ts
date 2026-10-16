import { useMemo } from 'react';

import { daysBetween, parseIsoDate, todayIso } from '@/utils/dates';
import { deleteRow, saveRow, useRows, type Moment, type MomentLog } from './sync';

// «Коли ми востаннє…»: дії пари та відмітки «це було»

export const MOMENT_ICONS = [
  'heart',
  'airplane',
  'fork-knife',
  'film',
  'tree',
  'gift',
  'coffee',
  'music',
  'star',
] as const;

export type MomentIconName = (typeof MOMENT_ICONS)[number];

// Готові варіанти для порожнього екрана
export const MOMENT_PRESETS: { title: string; icon: MomentIconName; remindAfterDays: number }[] = [
  { title: 'Побачення', icon: 'heart', remindAfterDays: 14 },
  { title: 'Подорож', icon: 'airplane', remindAfterDays: 90 },
  { title: 'Вечеря вдвох', icon: 'fork-knife', remindAfterDays: 14 },
  { title: 'Кіно', icon: 'film', remindAfterDays: 30 },
  { title: 'Прогулянка', icon: 'tree', remindAfterDays: 7 },
  { title: 'Сюрприз', icon: 'gift', remindAfterDays: 30 },
];

export type MomentSummary = Moment & {
  lastOn: string | null; // YYYY-MM-DD
  daysSince: number | null;
  // Від останнього разу минуло більше, ніж задано в нагадуванні
  overdue: boolean;
  logCount: number;
};

export function summarize(
  moments: Moment[],
  logs: MomentLog[],
  today = todayIso(),
): MomentSummary[] {
  const last = new Map<string, string>();
  const count = new Map<string, number>();
  for (const log of logs) {
    count.set(log.moment_id, (count.get(log.moment_id) ?? 0) + 1);
    const prev = last.get(log.moment_id);
    if (!prev || log.happened_on > prev) last.set(log.moment_id, log.happened_on);
  }
  const now = parseIsoDate(today);
  return moments
    .map((m) => {
      const lastOn = last.get(m.id) ?? null;
      const daysSince = lastOn ? daysBetween(parseIsoDate(lastOn), now) : null;
      const overdue =
        m.remind_after_days !== null && daysSince !== null && daysSince >= m.remind_after_days;
      return { ...m, lastOn, daysSince, overdue, logCount: count.get(m.id) ?? 0 };
    })
    .sort((a, b) => {
      // Спершу ті, що «давно не було», далі за давністю; нові без відміток у кінці
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      if (a.daysSince === null || b.daysSince === null) {
        return a.daysSince === null ? (b.daysSince === null ? 0 : 1) : -1;
      }
      return b.daysSince - a.daysSince;
    });
}

export function useMomentSummaries(): MomentSummary[] {
  const moments = useRows('moments');
  const logs = useRows('moment_logs');
  return useMemo(() => summarize(moments, logs), [moments, logs]);
}

export function useMomentLogs(momentId: string): MomentLog[] {
  const logs = useRows('moment_logs');
  return useMemo(
    () =>
      logs
        .filter((l) => l.moment_id === momentId)
        .sort(
          (a, b) =>
            b.happened_on.localeCompare(a.happened_on) || b.created_at.localeCompare(a.created_at),
        ),
    [logs, momentId],
  );
}

export type MomentInput = {
  title: string;
  icon: MomentIconName;
  remindAfterDays: number | null;
};

export function saveMoment(input: MomentInput, id?: string): string | null {
  return saveRow('moments', {
    ...(id ? { id } : {}),
    title: input.title.trim(),
    icon: input.icon,
    remind_after_days: input.remindAfterDays,
  });
}

export function deleteMoment(id: string): void {
  deleteRow('moments', id);
}

export function logMoment(
  momentId: string,
  happenedOn = todayIso(),
  note: string | null = null,
): void {
  saveRow('moment_logs', { moment_id: momentId, happened_on: happenedOn, note });
}

export function deleteMomentLog(id: string): void {
  deleteRow('moment_logs', id);
}
