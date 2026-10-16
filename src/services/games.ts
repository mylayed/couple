import { randomUUID } from 'expo-crypto';
import { useMemo } from 'react';

import { CHALLENGES, challengeById, type ChallengeInfo } from '@/data/challenges';
import {
  GUESS_QUESTIONS,
  PAIR_QUESTIONS,
  ROUND_SIZE,
  gameQuestionById,
  type GameQuestion,
} from '@/data/games';
import { useAuth } from '@/store/auth';
import {
  deleteRow,
  saveRow,
  useRows,
  type Challenge,
  type GameAnswer,
  type GameKind,
  type GameRound,
} from './sync';

// Ігри пари: «Що обрав(ла) б партнер» (guess) і «Щось одне з двох» (pair).
// Раунд — кілька питань; кожен гравець обирає по варіанту на питання. Вибір партнера сервер
// віддає лише після власного, тому результат обидва бачать одночасно й однаковим.

export const GAMES: Record<GameKind, { title: string; subtitle: string; rules: string }> = {
  guess: {
    title: 'Що обрав(ла) б партнер',
    subtitle: 'Один обирає, другий вгадує',
    rules: 'Ти обираєш про себе, партнер вгадує твої відповіді. Бали за кожне влучання.',
  },
  pair: {
    title: 'Щось одне з двох',
    subtitle: 'Обоє обирають таємно',
    rules: 'Ви обоє обираєте таємно, а потім дивитесь, де збіглися. Бали за кожен збіг.',
  },
};

export const ROUND_POINTS = 10;
export const MATCH_POINTS: Record<GameKind, number> = { guess: 3, pair: 2 };

export type RoundStatus = 'yourTurn' | 'waiting' | 'done';

export type RoundSummary = {
  round: GameRound;
  questions: GameQuestion[];
  mine: GameAnswer | null;
  partner: GameAnswer | null;
  status: RoundStatus;
  // Збіги (pair) або влучання (guess); у обох іграх це однакові номери варіантів
  matches: number;
  points: number;
};

export function roundPoints(kind: GameKind, matches: number): number {
  return ROUND_POINTS + MATCH_POINTS[kind] * matches;
}

export function countMatches(a: number[], b: number[]): number {
  return a.reduce((sum, choice, i) => sum + (choice === b[i] ? 1 : 0), 0);
}

function summarize(
  round: GameRound,
  answers: GameAnswer[],
  userId: string | undefined,
): RoundSummary {
  const questions = round.question_ids
    .map((id) => gameQuestionById(id))
    .filter((q): q is GameQuestion => Boolean(q));
  const mine = answers.find((a) => a.user_id === userId) ?? null;
  const partner = answers.find((a) => a.user_id !== userId) ?? null;
  const status: RoundStatus = !mine ? 'yourTurn' : partner ? 'done' : 'waiting';
  const matches = mine && partner ? countMatches(mine.choices, partner.choices) : 0;
  return {
    round,
    questions,
    mine,
    partner,
    status,
    matches,
    points: status === 'done' ? roundPoints(round.kind, matches) : 0,
  };
}

// Усі раунди від нових до старих
export function useRounds(): RoundSummary[] {
  const rounds = useRows('game_rounds');
  const answers = useRows('game_answers');
  const userId = useAuth((s) => s.session?.user.id);
  return useMemo(() => {
    const byRound = new Map<string, GameAnswer[]>();
    for (const a of answers) byRound.set(a.round_id, [...(byRound.get(a.round_id) ?? []), a]);
    return rounds
      .map((r) => summarize(r, byRound.get(r.id) ?? [], userId))
      .sort((a, b) => b.round.created_at.localeCompare(a.round.created_at));
  }, [rounds, answers, userId]);
}

export function useRound(id: string): RoundSummary | null {
  const rounds = useRounds();
  return rounds.find((r) => r.round.id === id) ?? null;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Нові питання для раунду: спершу ті, яких ще не було, потім уже зіграні
export function pickQuestions(kind: GameKind, played: RoundSummary[]): GameQuestion[] {
  const catalog = kind === 'guess' ? GUESS_QUESTIONS : PAIR_QUESTIONS;
  const used = new Set(
    played.filter((r) => r.round.kind === kind).flatMap((r) => r.round.question_ids),
  );
  const fresh = shuffle(catalog.filter((q) => !used.has(q.id)));
  const rest = shuffle(catalog.filter((q) => used.has(q.id)));
  return [...fresh, ...rest].slice(0, ROUND_SIZE);
}

// Новий раунд разом із власним вибором автора. Повертає id раунду.
export function startRound(
  kind: GameKind,
  questions: GameQuestion[],
  choices: number[],
): string | null {
  const id = randomUUID();
  if (!saveRow('game_rounds', { id, kind, question_ids: questions.map((q) => q.id) })) return null;
  saveRow('game_answers', { round_id: id, choices });
  return id;
}

export function playRound(roundId: string, choices: number[]): void {
  saveRow('game_answers', { round_id: roundId, choices });
}

export function deleteRound(id: string): void {
  deleteRow('game_rounds', id);
}

// ─── Челенджі ────────────────────────────────────────────────────────────────

// Нещодавно виконаний челендж не пропонуємо знову
const REPEAT_AFTER_DAYS = 30;
const DEFAULT_CHALLENGE_POINTS = 15;

export type ChallengeEntry = Challenge & { info: ChallengeInfo | undefined; points: number };

export function challengePoints(challengeId: string): number {
  return challengeById(challengeId)?.points ?? DEFAULT_CHALLENGE_POINTS;
}

export function useChallenges(): { active: ChallengeEntry[]; done: ChallengeEntry[] } {
  const rows = useRows('challenges');
  return useMemo(() => {
    const entries = rows.map((c) => ({
      ...c,
      info: challengeById(c.challenge_id),
      points: challengePoints(c.challenge_id),
    }));
    const active = entries
      .filter((c) => !c.done_at)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const done = entries
      .filter((c) => c.done_at)
      .sort((a, b) => (b.done_at as string).localeCompare(a.done_at as string));
    return { active, done };
  }, [rows]);
}

// Випадкові челенджі, яких зараз немає серед взятих і які давно не виконували
export function pickChallenges(
  { active, done }: { active: ChallengeEntry[]; done: ChallengeEntry[] },
  count: number,
): ChallengeInfo[] {
  const since = Date.now() - REPEAT_AFTER_DAYS * 86_400_000;
  const taken = new Set(active.map((c) => c.challenge_id));
  const recent = new Set(
    done.filter((c) => Date.parse(c.done_at as string) > since).map((c) => c.challenge_id),
  );
  const notTaken = CHALLENGES.filter((c) => !taken.has(c.id));
  const fresh = notTaken.filter((c) => !recent.has(c.id));
  // Коли все нещодавно виконано, пропонуємо й повтори
  return shuffle(fresh.length >= count ? fresh : notTaken).slice(0, count);
}

export function takeChallenge(info: ChallengeInfo): string | null {
  return saveRow('challenges', { challenge_id: info.id, title: info.title, done_at: null });
}

export function setChallengeDone(id: string, done: boolean): void {
  saveRow('challenges', { id, done_at: done ? new Date().toISOString() : null });
}

export function dropChallenge(id: string): void {
  deleteRow('challenges', id);
}
