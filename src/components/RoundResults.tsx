import { CheckCircleIcon, XCircleIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import type { RoundSummary } from '@/services/games';
import { useTheme } from '@/theme/ThemeProvider';
import { Card } from './Card';
import { Icon } from './Icon';
import { Text } from './Text';

type RoundResultsProps = {
  summary: RoundSummary;
  userId: string | undefined;
  partnerName: string;
};

// Відповіді обох по кожному питанню. У «Що обрав(ла) б партнер» автор раунду обирає
// про себе, а другий вгадує, тож підписи залежать від того, хто з них ти.
export function RoundResults({ summary, userId, partnerName }: RoundResultsProps) {
  const { spacing } = useTheme();
  const { round, questions, mine, partner } = summary;
  if (!mine || !partner) return null;

  const iAmSubject = round.created_by === userId;
  const myLabel = round.kind === 'pair' || iAmSubject ? 'Ти' : 'Твоя здогадка';
  const partnerLabel = round.kind === 'pair' || !iAmSubject ? partnerName : `${partnerName} вгадує`;

  return (
    <View style={{ gap: spacing.md }}>
      {questions.map((q, i) => {
        const match = mine.choices[i] === partner.choices[i];
        return (
          <Card key={q.id} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text variant="subtitle" style={{ flex: 1 }}>
                {q.text}
              </Text>
              <Icon
                icon={match ? CheckCircleIcon : XCircleIcon}
                color={match ? 'success' : 'textMuted'}
                weight="duotone"
              />
            </View>
            <Text>
              <Text color="textMuted">{myLabel}: </Text>
              {q.options[mine.choices[i]] ?? '—'}
            </Text>
            <Text>
              <Text color="textMuted">{partnerLabel}: </Text>
              {q.options[partner.choices[i]] ?? '—'}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}
