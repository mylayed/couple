import {
  ArrowsClockwiseIcon,
  CheckIcon,
  LightningIcon,
  TrophyIcon,
  XIcon,
} from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  dropChallenge,
  pickChallenges,
  setChallengeDone,
  takeChallenge,
  useChallenges,
  type ChallengeEntry,
} from '@/services/games';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, pluralUk } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

const SUGGESTIONS = 3;
const HISTORY_COUNT = 10;

const pointsLabel = (n: number) => `+${n} ${pluralUk(n, ['бал', 'бали', 'балів'])}`;

function ActiveChallenge({ entry }: { entry: ChallengeEntry }) {
  const { spacing } = useTheme();
  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="subtitle">{entry.title}</Text>
          {entry.info ? <Text color="textMuted">{entry.info.description}</Text> : null}
          <Text variant="caption" color="primary">
            {pointsLabel(entry.points)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Відмовитися від «${entry.title}»`}
          hitSlop={8}
          onPress={() => dropChallenge(entry.id)}
        >
          <Icon icon={XIcon} size={18} color="textMuted" />
        </Pressable>
      </View>
      <Button
        title="Виконали!"
        icon={CheckIcon}
        onPress={() => {
          haptics.success();
          setChallengeDone(entry.id, true);
        }}
      />
    </Card>
  );
}

export default function Challenges() {
  const { spacing } = useTheme();
  const challenges = useChallenges();
  // Пропозиції оновлюються лише на прохання, щоб не стрибали після кожної зміни
  const [suggestions, setSuggestions] = useState(() => pickChallenges(challenges, SUGGESTIONS));
  const visible = suggestions.filter(
    (s) => !challenges.active.some((c) => c.challenge_id === s.id),
  );
  const history = challenges.done.slice(0, HISTORY_COUNT);

  return (
    <Screen edges={['bottom']}>
      <Text color="textMuted">
        Беріть челендж, виконуйте разом і відмічайте. Бали йдуть на ваше спільне дерево.
      </Text>

      {challenges.active.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">У роботі</Text>
          {challenges.active.map((c) => (
            <ActiveChallenge key={c.id} entry={c} />
          ))}
        </View>
      ) : null}

      <Card style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Icon icon={LightningIcon} color="primary" weight="duotone" />
          <Text variant="subtitle" style={{ flex: 1 }}>
            Спробуйте
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Інші челенджі"
            hitSlop={8}
            onPress={() => {
              haptics.select();
              setSuggestions(pickChallenges(challenges, SUGGESTIONS));
            }}
          >
            <Icon icon={ArrowsClockwiseIcon} size={22} color="primary" />
          </Pressable>
        </View>
        {visible.length === 0 ? (
          <Text color="textMuted">Оновіть, щоб побачити інші челенджі.</Text>
        ) : null}
        {visible.map((s) => (
          <View key={s.id} style={{ gap: spacing.sm }}>
            <Text variant="subtitle">{s.title}</Text>
            <Text color="textMuted">{s.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text variant="caption" color="primary" style={{ flex: 1 }}>
                {pointsLabel(s.points)}
              </Text>
              <Button title="Беремо" variant="secondary" onPress={() => takeChallenge(s)} />
            </View>
          </View>
        ))}
      </Card>

      {history.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Виконані · {challenges.done.length}</Text>
          {history.map((c) => (
            <ListItem
              key={c.id}
              icon={TrophyIcon}
              title={c.title}
              subtitle={`${formatDayMonth(new Date(c.done_at as string))} · ${pointsLabel(c.points)}`}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
