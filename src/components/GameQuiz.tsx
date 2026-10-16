import { ArrowLeftIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { GameQuestion } from '@/data/games';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Button } from './Button';
import { Card } from './Card';
import { Text } from './Text';

type GameQuizProps = {
  questions: GameQuestion[];
  // Підказка над питанням: «Що обираєш ти?», «Що обере Оля?»
  prompt: string;
  onSubmit: (choices: number[]) => void;
};

// Питання раунду по одному: дотик до варіанта переходить до наступного,
// після останнього вибір можна переглянути й надіслати
export function GameQuiz({ questions, prompt, onSubmit }: GameQuizProps) {
  const { colors, radius, spacing } = useTheme();
  const [choices, setChoices] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const finished = index >= questions.length;
  const question = questions[Math.min(index, questions.length - 1)];

  const choose = (option: number) => {
    haptics.select();
    const next = [...choices];
    next[index] = option;
    setChoices(next);
    // Коли все вже обрано (змінюють одну відповідь), повертаємося до підсумку
    const complete = questions.every((_, i) => next[i] !== undefined);
    setIndex(complete ? questions.length : index + 1);
  };

  if (finished) {
    return (
      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Твій вибір</Text>
        {questions.map((q, i) => (
          <Pressable
            key={q.id}
            accessibilityRole="button"
            accessibilityLabel={`Змінити: ${q.text}`}
            onPress={() => setIndex(i)}
            style={({ pressed }) => ({ gap: 2, opacity: pressed ? 0.6 : 1 })}
          >
            <Text variant="caption" color="textMuted">
              {q.text}
            </Text>
            <Text>{q.options[choices[i]]}</Text>
          </Pressable>
        ))}
        <Text variant="caption" color="textMuted">
          Торкнись відповіді, щоб змінити. Після надсилання змінити не вийде.
        </Text>
        <Button title="Надіслати" onPress={() => onSubmit(choices)} />
      </Card>
    );
  }

  return (
    <Card style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {index > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Попереднє питання"
            hitSlop={8}
            onPress={() => setIndex((i) => i - 1)}
          >
            <ArrowLeftIcon size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
          {prompt}
        </Text>
        <Text variant="caption" color="textMuted">
          {index + 1} з {questions.length}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {questions.map((q, i) => (
          <View
            key={q.id}
            style={{
              flex: 1,
              height: 4,
              borderRadius: radius.pill,
              backgroundColor: i <= index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <Text variant="title">{question.text}</Text>

      <View style={{ gap: spacing.sm }}>
        {question.options.map((option, i) => {
          const selected = choices[index] === i;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => choose(i)}
              style={({ pressed }) => ({
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : colors.background,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text variant="subtitle" color={selected ? 'onPrimary' : 'text'} align="center">
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
