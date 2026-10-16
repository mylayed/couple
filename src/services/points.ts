import { useMemo } from 'react';

import { useAuth } from '@/store/auth';
import { challengePoints, useRounds } from './games';
import { useRows } from './sync';

// Бали й «дерево стосунків». Окремої таблиці немає: бали рахуються зі спільних даних пари,
// тож обидва телефони показують однакове число, а дерево одразу враховує минулі дії.
// Рахуємо лише спільне: те, що бачать обоє (без настрою, який буває приватним).

export const POINTS = {
  question: 5, // обоє відповіли на питання дня
  moment: 5, // відмітка «Коли ми востаннє…» (одна на дію за день)
  dream: 15, // здійснена мрія з бакет-ліста
  memory: 5, // спогад у стрічці
} as const;

export type PointSource = 'games' | 'challenges' | 'questions' | 'moments' | 'dreams' | 'memories';

export const POINT_SOURCES: Record<PointSource, string> = {
  games: 'Ігри',
  challenges: 'Челенджі',
  questions: 'Питання дня',
  moments: 'Моменти',
  dreams: 'Мрії',
  memories: 'Спогади',
};

// Назва рівня й стадія малюнка дерева (0–7)
const LEVELS: { min: number; title: string }[] = [
  { min: 0, title: 'Насінина' },
  { min: 30, title: 'Паросток' },
  { min: 100, title: 'Саджанець' },
  { min: 250, title: 'Молоде деревце' },
  { min: 500, title: 'Розлоге дерево' },
  { min: 850, title: 'Квітуче дерево' },
  { min: 1300, title: 'Плодове дерево' },
  { min: 2000, title: 'Віковий дуб' },
];
// Після останньої стадії рівні йдуть далі кожні 1000 балів
const LEVEL_STEP_AFTER = 1000;

export const TREE_STAGES = LEVELS.length;

export type Level = {
  level: number; // з 1
  stage: number; // 0..TREE_STAGES-1
  title: string;
  min: number;
  next: number;
};

export function levelFor(points: number): Level {
  const last = LEVELS.length - 1;
  let stage = 0;
  while (stage < last && points >= LEVELS[stage + 1].min) stage++;
  if (stage < last) {
    return {
      level: stage + 1,
      stage,
      title: LEVELS[stage].title,
      min: LEVELS[stage].min,
      next: LEVELS[stage + 1].min,
    };
  }
  const extra = Math.floor((points - LEVELS[last].min) / LEVEL_STEP_AFTER);
  const min = LEVELS[last].min + extra * LEVEL_STEP_AFTER;
  return {
    level: last + 1 + extra,
    stage: last,
    title: LEVELS[last].title,
    min,
    next: min + LEVEL_STEP_AFTER,
  };
}

export type Points = {
  total: number;
  bySource: Record<PointSource, number>;
  level: Level;
};

export function usePoints(): Points {
  const rounds = useRounds();
  const challenges = useRows('challenges');
  const answers = useRows('daily_answers');
  const logs = useRows('moment_logs');
  const dreams = useRows('bucket_items');
  const memories = useRows('memories');
  const userId = useAuth((s) => s.session?.user.id);

  return useMemo(() => {
    const games = rounds.reduce((sum, r) => sum + r.points, 0);

    const challengeTotal = challenges
      .filter((c) => c.done_at)
      .reduce((sum, c) => sum + challengePoints(c.challenge_id), 0);

    // Відповідь партнера видно лише після власної, тож обидва телефони бачать ті самі дні
    const mineDays = new Set(
      answers.filter((a) => a.user_id === userId).map((a) => a.question_date),
    );
    const bothDays = new Set(
      answers
        .filter((a) => a.user_id !== userId && mineDays.has(a.question_date))
        .map((a) => a.question_date),
    );

    const momentDays = new Set(logs.map((l) => `${l.moment_id}:${l.happened_on}`));

    const bySource: Record<PointSource, number> = {
      games,
      challenges: challengeTotal,
      questions: bothDays.size * POINTS.question,
      moments: momentDays.size * POINTS.moment,
      dreams: dreams.filter((d) => d.done_at).length * POINTS.dream,
      memories: memories.length * POINTS.memory,
    };
    const total = Object.values(bySource).reduce((sum, n) => sum + n, 0);
    return { total, bySource, level: levelFor(total) };
  }, [rounds, challenges, answers, logs, dreams, memories, userId]);
}
