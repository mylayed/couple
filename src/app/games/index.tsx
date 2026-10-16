import { useRouter } from 'expo-router';
import {
  ArrowsLeftRightIcon,
  HourglassIcon,
  LightningIcon,
  TargetIcon,
  TrophyIcon,
} from 'phosphor-react-native';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TreeCard } from '@/components/TreeCard';
import { GAMES, useChallenges, useRounds, type RoundSummary } from '@/services/games';
import { POINT_SOURCES, usePoints, type PointSource } from '@/services/points';
import type { GameKind } from '@/services/sync';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimeAgo, pluralUk } from '@/utils/dates';

const HISTORY_COUNT = 5;
const gameIcon = (kind: GameKind) => (kind === 'guess' ? TargetIcon : ArrowsLeftRightIcon);

function resultLine(r: RoundSummary): string {
  const total = r.questions.length;
  const score =
    r.round.kind === 'pair'
      ? `${r.matches} ${pluralUk(r.matches, ['збіг', 'збіги', 'збігів'])} з ${total}`
      : `вгадано ${r.matches} з ${total}`;
  return `${score} · +${r.points}`;
}

function GameCard({ kind }: { kind: GameKind }) {
  const router = useRouter();
  const { spacing } = useTheme();
  const game = GAMES[kind];
  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={gameIcon(kind)} color="primary" weight="duotone" />
        <Text variant="subtitle" style={{ flex: 1 }}>
          {game.title}
        </Text>
      </View>
      <Text color="textMuted">{game.rules}</Text>
      <Button
        title="Новий раунд"
        variant="secondary"
        onPress={() => router.push(`/games/new?kind=${kind}`)}
      />
    </Card>
  );
}

export default function Games() {
  const router = useRouter();
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const rounds = useRounds();
  const challenges = useChallenges();
  const points = usePoints();

  const yourTurn = rounds.filter((r) => r.status === 'yourTurn');
  const waiting = rounds.filter((r) => r.status === 'waiting');
  const history = rounds.filter((r) => r.status === 'done').slice(0, HISTORY_COUNT);
  const sources = (Object.keys(POINT_SOURCES) as PointSource[]).filter(
    (s) => points.bySource[s] > 0,
  );

  return (
    <Screen edges={['bottom']}>
      <TreeCard points={points} />

      {sources.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {sources.map((s) => (
            <Card key={s} style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
              <Text variant="caption" color="textMuted">
                {POINT_SOURCES[s]}
              </Text>
              <Text variant="subtitle">{points.bySource[s]}</Text>
            </Card>
          ))}
        </View>
      ) : (
        <Text variant="caption" color="textMuted">
          Дерево росте за ігри, челенджі, спільні відповіді на питання дня, відмітки моментів і
          здійснені мрії.
        </Text>
      )}

      {yourTurn.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Твоя черга</Text>
          {yourTurn.map((r) => (
            <ListItem
              key={r.round.id}
              icon={gameIcon(r.round.kind)}
              title={GAMES[r.round.kind].title}
              subtitle={`${partnerName} чекає · ${formatTimeAgo(r.round.created_at)}`}
              accent
              onPress={() => router.push(`/games/${r.round.id}`)}
            />
          ))}
        </Card>
      ) : null}

      <GameCard kind="pair" />
      <GameCard kind="guess" />

      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Icon icon={LightningIcon} color="primary" weight="duotone" />
          <Text variant="subtitle">Челенджі пари</Text>
        </View>
        <Text color="textMuted">
          {challenges.active.length > 0
            ? `У роботі: ${challenges.active.map((c) => c.title).join(', ')}`
            : '«30 хвилин без телефонів», «приготуйте щось нове» та інші спільні завдання.'}
        </Text>
        <Button
          title={challenges.active.length > 0 ? 'Відкрити' : 'Обрати челендж'}
          variant="secondary"
          onPress={() => router.push('/challenges')}
        />
      </Card>

      {waiting.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Чекаємо на хід</Text>
          {waiting.map((r) => (
            <ListItem
              key={r.round.id}
              icon={HourglassIcon}
              title={GAMES[r.round.kind].title}
              subtitle={`Черга: ${partnerName} · ${formatTimeAgo(r.round.created_at)}`}
              onPress={() => router.push(`/games/${r.round.id}`)}
            />
          ))}
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Зіграні раунди</Text>
          {history.map((r) => (
            <ListItem
              key={r.round.id}
              icon={TrophyIcon}
              title={GAMES[r.round.kind].title}
              subtitle={resultLine(r)}
              onPress={() => router.push(`/games/${r.round.id}`)}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
