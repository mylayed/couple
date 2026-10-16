import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowCounterClockwiseIcon, CheckIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  deleteBucketItem,
  MAX_BUCKET_NOTE,
  MAX_ITEM_TITLE,
  setBucketDone,
  updateBucketItem,
} from '@/services/plans';
import { useRow } from '@/services/sync';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

export default function BucketItemScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useRow('bucket_items', id);
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');

  const [title, setTitle] = useState(item?.title ?? '');
  const [note, setNote] = useState(item?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!item) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Мрія' }} />
        <Text color="textMuted">Цієї мрії вже немає. Можливо, її видалили на іншому телефоні.</Text>
      </Screen>
    );
  }

  const changed = title.trim() !== item.title || (note.trim() || null) !== item.note;
  const author = item.created_by === userId ? 'Ти' : partnerName;

  const save = () => {
    if (!title.trim()) return setError('Опиши мрію.');
    updateBucketItem(item.id, title, note);
    router.back();
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: item.done_at ? 'Здійснено' : 'Мрія' }} />

      <Card style={{ gap: spacing.xs }}>
        <Text variant="caption" color="textMuted">
          {author} · додано {formatDayMonth(new Date(item.created_at), true)}
        </Text>
        {item.done_at ? (
          <Text variant="subtitle" color="primary">
            Здійснено {formatDayMonth(new Date(item.done_at), true)} 🎉
          </Text>
        ) : null}
      </Card>

      <TextField
        label="Мрія"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setError(null);
        }}
        maxLength={MAX_ITEM_TITLE}
        error={error}
      />
      <TextField
        label="Подробиці"
        placeholder="Коли, де, що для цього потрібно"
        value={note}
        onChangeText={setNote}
        maxLength={MAX_BUCKET_NOTE}
        multiline
        style={{ minHeight: 96, textAlignVertical: 'top' }}
      />

      {item.done_at ? (
        <Button
          title="Ще не здійснено"
          icon={ArrowCounterClockwiseIcon}
          variant="secondary"
          onPress={() => setBucketDone(item.id, false)}
        />
      ) : (
        <Button
          title="Здійснили!"
          icon={CheckIcon}
          onPress={() => {
            haptics.success();
            setBucketDone(item.id, true);
          }}
        />
      )}

      <View style={{ flex: 1 }} />
      {changed ? <Button title="Зберегти" variant="secondary" onPress={save} /> : null}
      {confirmDelete ? (
        <View style={{ gap: spacing.sm }}>
          <Text align="center">Мрія зникне у вас обох.</Text>
          <Button
            title="Так, видалити"
            icon={TrashIcon}
            onPress={() => {
              deleteBucketItem(item.id);
              router.back();
            }}
          />
          <Button title="Скасувати" variant="ghost" onPress={() => setConfirmDelete(false)} />
        </View>
      ) : (
        <Button
          title="Видалити"
          icon={TrashIcon}
          variant="ghost"
          onPress={() => setConfirmDelete(true)}
        />
      )}
    </Screen>
  );
}
