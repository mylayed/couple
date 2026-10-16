import { useMemo } from 'react';

import { useAuth } from '@/store/auth';
import { useRounds } from './games';
import { useRows, type BucketItem, type Memory } from './sync';

// Річний підсумок рахується на телефоні зі спільних даних пари, окремої таблиці немає.
// Побачення й подорожі беремо з відміток «Коли ми востаннє…» за іконкою дії
// (назви пара пише сама) і з важливих дат типу «подорож».

const DATE_ICONS = new Set(['heart', 'fork-knife', 'film', 'coffee', 'music']);
const TRIP_ICONS = new Set(['airplane']);

export type TopMoment = { id: string; title: string; icon: string | null; count: number };

export type YearSummary = {
  year: number;
  dates: number;
  trips: number;
  momentLogs: number;
  topMoments: TopMoment[];
  memories: Memory[];
  photos: number;
  dreams: BucketItem[];
  challenges: number;
  games: number;
  questions: number;
  notes: number;
  touches: number;
  // Місяць (0–11), коли спільних подій було найбільше
  busiestMonth: number | null;
  isEmpty: boolean;
};

const inYear = (iso: string | null | undefined, year: number) =>
  !!iso && iso.startsWith(String(year));

// Роки, за які є хоч якісь дані, від нового до старого; поточний є завжди
export function useSummaryYears(): number[] {
  const memories = useRows('memories');
  const logs = useRows('moment_logs');
  const answers = useRows('daily_answers');
  return useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    for (const m of memories) years.add(Number(m.happened_on.slice(0, 4)));
    for (const l of logs) years.add(Number(l.happened_on.slice(0, 4)));
    for (const a of answers) years.add(Number(a.question_date.slice(0, 4)));
    return [...years].sort((a, b) => b - a);
  }, [memories, logs, answers]);
}

export function useYearSummary(year: number): YearSummary {
  const memoryRows = useRows('memories');
  const moments = useRows('moments');
  const logs = useRows('moment_logs');
  const importantDates = useRows('important_dates');
  const bucket = useRows('bucket_items');
  const challengeRows = useRows('challenges');
  const answers = useRows('daily_answers');
  const noteRows = useRows('notes');
  const touchRows = useRows('touches');
  const rounds = useRounds();
  const userId = useAuth((s) => s.session?.user.id);

  return useMemo(() => {
    const monthly = Array<number>(12).fill(0);
    const bump = (iso: string) => monthly[Number(iso.slice(5, 7)) - 1]++;

    const momentById = new Map(moments.map((m) => [m.id, m]));
    const yearLogs = logs.filter((l) => inYear(l.happened_on, year));
    let dates = 0;
    let trips = 0;
    const counts = new Map<string, number>();
    for (const log of yearLogs) {
      const icon = momentById.get(log.moment_id)?.icon ?? '';
      if (DATE_ICONS.has(icon)) dates++;
      if (TRIP_ICONS.has(icon)) trips++;
      counts.set(log.moment_id, (counts.get(log.moment_id) ?? 0) + 1);
      bump(log.happened_on);
    }
    // Поїздка в календарі важливих дат, якщо такого дня ще немає у відмітках
    const tripDays = new Set(
      yearLogs
        .filter((l) => TRIP_ICONS.has(momentById.get(l.moment_id)?.icon ?? ''))
        .map((l) => l.happened_on),
    );
    for (const d of importantDates) {
      if (d.kind === 'trip' && inYear(d.date, year) && !tripDays.has(d.date)) trips++;
    }

    const topMoments = [...counts.entries()]
      .map(([id, count]) => {
        const moment = momentById.get(id);
        return { id, title: moment?.title ?? 'Момент', icon: moment?.icon ?? null, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const memories = memoryRows
      .filter((m) => inYear(m.happened_on, year))
      .sort((a, b) => a.happened_on.localeCompare(b.happened_on));
    for (const m of memories) bump(m.happened_on);

    const dreams = bucket
      .filter((b) => inYear(b.done_at, year))
      .sort((a, b) => (a.done_at as string).localeCompare(b.done_at as string));

    const challenges = challengeRows.filter((c) => inYear(c.done_at, year)).length;
    const games = rounds.filter(
      (r) => r.status === 'done' && inYear(r.round.created_at, year),
    ).length;

    // Дні, коли відповіли обоє
    const mine = new Set(
      answers
        .filter((a) => a.user_id === userId && inYear(a.question_date, year))
        .map((a) => a.question_date),
    );
    const questions = new Set(
      answers
        .filter((a) => a.user_id !== userId && mine.has(a.question_date))
        .map((a) => a.question_date),
    ).size;

    const notes = noteRows.filter((n) => inYear(n.created_at, year)).length;
    const touches = touchRows.filter((t) => inYear(t.created_at, year)).length;

    const peak = Math.max(...monthly);
    const summary: YearSummary = {
      year,
      dates,
      trips,
      momentLogs: yearLogs.length,
      topMoments,
      memories,
      photos: memories.filter((m) => m.thumb_path).length,
      dreams,
      challenges,
      games,
      questions,
      notes,
      touches,
      busiestMonth: peak > 0 ? monthly.indexOf(peak) : null,
      isEmpty: false,
    };
    summary.isEmpty =
      yearLogs.length + memories.length + dreams.length + challenges + games + questions + notes ===
      0;
    return summary;
  }, [
    year,
    memoryRows,
    moments,
    logs,
    importantDates,
    bucket,
    challengeRows,
    answers,
    noteRows,
    touchRows,
    rounds,
    userId,
  ]);
}
