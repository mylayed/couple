import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowsClockwiseIcon, HourglassIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GameQuiz } from '@/components/GameQuiz';
import { Icon } from '@/components/Icon';
import { RoundResults } from '@/components/RoundResults';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { deleteRound, GAMES, MATCH_POINTS, playRound, useRound } from '@/services/games';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { pluralUk } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

export default function GameRound() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const summary = useRound(id);
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!summary) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Гра' }} />
        <Text color="textMuted">Цієї гри вже немає. Можливо, її видалили на іншому телефоні.</Text>
      </Screen>
    );
  }

  const { round, questions, status, matches, points } = summary;
  const game = GAMES[round.kind];
  const iAmSubject = round.created_by === userId;
  const total = questions.length;

  // Раунд із питаннями, яких цей телефон ще не знає (новіша версія застосунку в партнера)
  if (total !== round.question_ids.length) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: game.title }} />
        <Text color="textMuted">Щоб зіграти цей раунд, онови застосунок.</Text>
      </Screen>
    );
  }

  if (status === 'yourTurn') {
    const guessing = round.kind === 'guess' && !iAmSubject;
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: game.title }} />
        <Text color="textMuted">
          {guessing
            ? `${partnerName} вже має свої відповіді. Вгадай, що там!`
            : `${partnerName} вже має свій вибір. Твоя черга — результат відкриється одразу після тебе.`}
        </Text>
        <GameQuiz
          questions={questions}
          prompt={guessing ? `Що обере ${partnerName}?` : 'Що тобі ближче?'}
          onSubmit={(choices) => {
            haptics.success();
            playRound(round.id, choices);
          }}
        />
      </Screen>
    );
  }

  const summaryLine =
    round.kind === 'pair'
      ? `${matches} ${pluralUk(matches, ['збіг', 'збіги', 'збігів'])} з ${total}`
      : `Вгадано ${matches} з ${total}`;
  // Наступний раунд «Що обрав(ла) б партнер» — навпаки: загадує той, хто вгадував
  const again = round.kind === 'guess' && !iAmSubject ? 'Тепер загадую я' : 'Ще раунд';

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: game.title }} />

      {status === 'waiting' ? (
        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <Icon icon={HourglassIcon} size={40} color="secondary" weight="duotone" />
          <Text variant="subtitle" align="center">
            Твій вибір збережено
          </Text>
          <Text color="textMuted" align="center">
            {round.kind === 'guess' && iAmSubject
              ? `Чекаємо, поки ${partnerName} вгадає. Результат відкриється вам обом одночасно.`
              : `Тепер черга: ${partnerName}. Результат відкриється вам обом одночасно.`}
          </Text>
        </Card>
      ) : (
        <>
          <Card style={{ gap: spacing.xs, alignItems: 'center' }}>
            <Text variant="title" align="center">
              {summaryLine}
            </Text>
            <Text color="primary">
              +{points} {pluralUk(points, ['бал', 'бали', 'балів'])} дереву
            </Text>
            <Text variant="caption" color="textMuted" align="center">
              {round.kind === 'pair' ? 'За кожен збіг' : 'За кожне влучання'} +
              {MATCH_POINTS[round.kind]}
            </Text>
          </Card>
          <RoundResults summary={summary} userId={userId} partnerName={partnerName} />
          <Button
            title={again}
            icon={ArrowsClockwiseIcon}
            onPress={() => router.replace(`/games/new?kind=${round.kind}`)}
          />
        </>
      )}

      <View style={{ flex: 1 }} />
      {confirmDelete ? (
        <View style={{ gap: spacing.sm }}>
          <Text align="center">Раунд зникне у вас обох разом із балами за нього.</Text>
          <Button
            title="Так, видалити"
            icon={TrashIcon}
            onPress={() => {
              deleteRound(round.id);
              router.back();
            }}
          />
          <Button title="Скасувати" variant="ghost" onPress={() => setConfirmDelete(false)} />
        </View>
      ) : (
        <Button
          title="Видалити раунд"
          icon={TrashIcon}
          variant="ghost"
          onPress={() => setConfirmDelete(true)}
        />
      )}
    </Screen>
  );
}
