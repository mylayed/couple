import { useMemo } from 'react';

import { QUESTIONS, questionById, type Question } from '@/data/questions';
import { useAuth } from '@/store/auth';
import { parseIsoDate, todayIso } from '@/utils/dates';
import { deleteRow, saveRow, useRows, type AnswerComment, type DailyAnswer } from './sync';

// Питання дня однакове для обох: його номер залежить лише від календарної дати
export function questionForDate(iso: string): Question {
  const date = parseIsoDate(iso);
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return QUESTIONS[day % QUESTIONS.length];
}

export type QuestionDay = {
  date: string; // YYYY-MM-DD
  question: Question;
  mine: DailyAnswer | null;
  // Сервер віддає відповідь партнера лише після нашої, тож до того тут null
  partner: DailyAnswer | null;
  // Обговорення обох відповідей одним потоком; сервер віддає його лише після відповіді обох
  comments: AnswerComment[];
};

// Усі дні з відповідями плюс сьогодні, від нових до старих
export function useQuestionDays(): QuestionDay[] {
  const answers = useRows('daily_answers');
  const comments = useRows('answer_comments');
  const userId = useAuth((s) => s.session?.user.id);

  return useMemo(() => {
    const today = todayIso();
    const days = new Map<string, QuestionDay>();
    const dayFor = (date: string, questionId?: string) => {
      let day = days.get(date);
      if (!day) {
        const question = (questionId && questionById(questionId)) || questionForDate(date);
        day = { date, question, mine: null, partner: null, comments: [] };
        days.set(date, day);
      }
      return day;
    };
    dayFor(today);
    for (const answer of answers) {
      const day = dayFor(answer.question_date, answer.question_id);
      if (answer.user_id === userId) day.mine = answer;
      else day.partner = answer;
    }
    const dayOfAnswer = new Map(answers.map((a) => [a.id, a.question_date]));
    for (const comment of comments) {
      const date = dayOfAnswer.get(comment.answer_id);
      if (date) days.get(date)?.comments.push(comment);
    }
    for (const day of days.values()) {
      day.comments.sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [answers, comments, userId]);
}

export function useTodayQuestion(): QuestionDay {
  const days = useQuestionDays();
  const today = todayIso();
  return days.find((d) => d.date === today) ?? days[0];
}

export function saveAnswer(day: QuestionDay, text: string): void {
  saveRow('daily_answers', {
    ...(day.mine ? { id: day.mine.id } : {}),
    question_date: day.date,
    question_id: day.question.id,
    answer: text.trim(),
  });
}

export const MAX_COMMENT = 500;

// Коментар чіпляємо до відповіді партнера: саме на неї зазвичай відгукуються
export function addComment(day: QuestionDay, text: string): void {
  if (!day.mine || !day.partner) return;
  saveRow('answer_comments', { answer_id: day.partner.id, body: text.trim() });
}

export function deleteComment(id: string): void {
  deleteRow('answer_comments', id);
}
