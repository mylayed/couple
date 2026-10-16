import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { GameQuiz } from '@/components/GameQuiz';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { GAMES, pickQuestions, startRound, useRounds } from '@/services/games';
import type { GameKind } from '@/services/sync';
import { useCouple } from '@/store/couple';
import { haptics } from '@/utils/haptics';

export default function NewGame() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind: GameKind = params.kind === 'guess' ? 'guess' : 'pair';
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const rounds = useRounds();
  // Питання обираються один раз на відкриття екрана
  const [questions] = useState(() => pickQuestions(kind, rounds));

  const submit = (choices: number[]) => {
    const id = startRound(kind, questions, choices);
    if (!id) return;
    haptics.success();
    router.replace(`/games/${id}`);
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: GAMES[kind].title }} />
      <Text color="textMuted">
        {kind === 'guess'
          ? `Обирай чесно про себе, а ${partnerName} спробує вгадати.`
          : `Обирай таємно: ${partnerName} побачить твій вибір лише після свого.`}
      </Text>
      <GameQuiz
        questions={questions}
        prompt={kind === 'guess' ? 'Що обираєш ти?' : 'Що тобі ближче?'}
        onSubmit={submit}
      />
    </Screen>
  );
}
