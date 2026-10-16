import { useMemo } from 'react';

import { useAuth, type Profile } from '@/store/auth';
import { useCouple, type Couple, type Partner } from '@/store/couple';
import { daysBetween, nextOccurrence, parseIsoDate, todayIso } from '@/utils/dates';
import { deleteRow, saveRow, useRows, type ImportantDate } from './sync';

// Календар важливих дат: власні дати пари плюс дні народження з профілів і річниця стосунків

export type DateKind = ImportantDate['kind'];

export const DATE_KINDS: { kind: DateKind; title: string }[] = [
  { kind: 'anniversary', title: 'Річниця' },
  { kind: 'birthday', title: 'День народження' },
  { kind: 'first', title: 'Перший раз' },
  { kind: 'trip', title: 'Подорож' },
  { kind: 'other', title: 'Інше' },
];

export type CalendarEntry = {
  key: string;
  // id запису important_dates; null для дат із профілів і пари, їх змінюють у налаштуваннях
  id: string | null;
  title: string;
  kind: DateKind;
  date: string; // YYYY-MM-DD, як задано
  repeatsYearly: boolean;
  // Найближчий день, коли дата настане; null для одноразової дати в минулому
  next: Date | null;
  daysLeft: number | null;
  // Котра це буде річниця, якщо дата повторюється щороку
  years: number | null;
};

type Sources = {
  rows: ImportantDate[];
  couple: Couple | null;
  profile: Profile | null;
  partner: Partner | null;
};

function entry(
  key: string,
  id: string | null,
  title: string,
  kind: DateKind,
  date: string,
  repeatsYearly: boolean,
  today: Date,
): CalendarEntry {
  const original = parseIsoDate(date);
  const next = repeatsYearly ? nextOccurrence(date, today) : original >= today ? original : null;
  const years = repeatsYearly && next ? next.getFullYear() - original.getFullYear() : null;
  return {
    key,
    id,
    title,
    kind,
    date,
    repeatsYearly,
    next,
    daysLeft: next ? daysBetween(today, next) : null,
    years,
  };
}

export function buildCalendar(
  { rows, couple, profile, partner }: Sources,
  todayIsoDate = todayIso(),
): CalendarEntry[] {
  const today = parseIsoDate(todayIsoDate);
  const entries: CalendarEntry[] = rows.map((r) =>
    entry(`date:${r.id}`, r.id, r.title, r.kind, r.date, r.repeats_yearly, today),
  );
  if (couple?.started_on) {
    entries.push(
      entry('couple', null, 'Наша річниця', 'anniversary', couple.started_on, true, today),
    );
  }
  if (profile?.birth_date) {
    entries.push(
      entry('me', null, 'Мій день народження', 'birthday', profile.birth_date, true, today),
    );
  }
  if (partner?.birth_date) {
    entries.push(
      entry(
        'partner',
        null,
        `День народження: ${partner.name}`,
        'birthday',
        partner.birth_date,
        true,
        today,
      ),
    );
  }
  // Найближчі спершу; минулі одноразові — у кінці, від нових до старих
  return entries.sort((a, b) => {
    if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
    if (a.daysLeft !== null || b.daysLeft !== null) return a.daysLeft === null ? 1 : -1;
    return b.date.localeCompare(a.date);
  });
}

export function useCalendar(): CalendarEntry[] {
  const rows = useRows('important_dates');
  const couple = useCouple((s) => s.couple);
  const partner = useCouple((s) => s.partner);
  const profile = useAuth((s) => s.profile);
  return useMemo(
    () => buildCalendar({ rows, couple, profile, partner }),
    [rows, couple, profile, partner],
  );
}

export type ImportantDateInput = {
  title: string;
  date: string; // YYYY-MM-DD
  kind: DateKind;
  repeatsYearly: boolean;
};

export function saveImportantDate(input: ImportantDateInput, id?: string): string | null {
  return saveRow('important_dates', {
    ...(id ? { id } : {}),
    title: input.title.trim(),
    date: input.date,
    kind: input.kind,
    repeats_yearly: input.repeatsYearly,
  });
}

export function deleteImportantDate(id: string): void {
  deleteRow('important_dates', id);
}
