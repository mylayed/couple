import { useRouter } from 'expo-router';
import { SparkleIcon } from 'phosphor-react-native';
import { useState } from 'react';

import { AddField } from '@/components/AddField';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow } from '@/components/CheckRow';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { addBucketItem, MAX_ITEM_TITLE, setBucketDone, useBucketList } from '@/services/plans';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth } from '@/utils/dates';

export default function BucketList() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { open, done } = useBucketList();
  const [showDone, setShowDone] = useState(false);

  return (
    <Screen edges={['bottom']}>
      <AddField
        placeholder="Наша мрія: побачити північне сяйво"
        maxLength={MAX_ITEM_TITLE}
        onAdd={(title) => addBucketItem(title)}
      />

      {open.length === 0 && done.length === 0 ? (
        <EmptyState
          icon={SparkleIcon}
          title="Що ви мрієте зробити разом?"
          description="Подорожі, пригоди, дрібниці на кшталт «спекти торт». Відмічайте, коли здійсните."
        />
      ) : null}

      {open.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          {open.map((item) => (
            <CheckRow
              key={item.id}
              title={item.title}
              subtitle={item.note}
              done={false}
              onToggle={(value) => setBucketDone(item.id, value)}
              onPress={() => router.push(`/bucket/${item.id}`)}
            />
          ))}
        </Card>
      ) : done.length > 0 ? (
        <Text color="textMuted" align="center">
          Усі мрії здійснено. Час придумати нові ✨
        </Text>
      ) : null}

      {done.length > 0 ? (
        <>
          <Button
            title={showDone ? 'Сховати здійснене' : `Здійснено: ${done.length}`}
            variant="ghost"
            onPress={() => setShowDone(!showDone)}
          />
          {showDone ? (
            <Card style={{ gap: spacing.md }}>
              {done.map((item) => (
                <CheckRow
                  key={item.id}
                  title={item.title}
                  subtitle={`Здійснено ${formatDayMonth(new Date(item.done_at as string), true)}`}
                  done
                  onToggle={(value) => setBucketDone(item.id, value)}
                  onPress={() => router.push(`/bucket/${item.id}`)}
                />
              ))}
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
