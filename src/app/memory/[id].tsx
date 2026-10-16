import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ImageSquareIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CommentThread } from '@/components/CommentThread';
import { DateField } from '@/components/DateField';
import { Photo } from '@/components/Photo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  addMemoryComment,
  attachPhoto,
  deleteMemory,
  deleteMemoryComment,
  MAX_CAPTION,
  MAX_MEMORY_COMMENT,
  removeMemoryPhoto,
  updateMemory,
  useMemoryComments,
  usePendingPhoto,
} from '@/services/memories';
import { pickPhoto } from '@/services/photos';
import { useRow } from '@/services/sync';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, parseIsoDate, todayIso } from '@/utils/dates';

// Дуже вузькі чи високі фото не розтягують екран
const clampRatio = (ratio: number) => Math.min(Math.max(ratio, 0.6), 1.8);

export default function MemoryScreen() {
  const router = useRouter();
  const { radius, spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const memory = useRow('memories', id);
  const pending = usePendingPhoto(id);
  const comments = useMemoryComments(id);
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');

  const [happenedOn, setHappenedOn] = useState(memory?.happened_on ?? todayIso());
  const [caption, setCaption] = useState(memory?.caption ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!memory) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Спогад' }} />
        <Text color="textMuted">
          Цього спогаду вже немає. Можливо, його видалили на іншому телефоні.
        </Text>
      </Screen>
    );
  }

  const photoWidth = pending?.full.width ?? memory.photo_width;
  const photoHeight = pending?.full.height ?? memory.photo_height;
  const hasPhoto = Boolean(pending || memory.photo_path);
  const ratio = photoWidth && photoHeight ? clampRatio(photoWidth / photoHeight) : 4 / 3;
  const changed = happenedOn !== memory.happened_on || (caption.trim() || null) !== memory.caption;
  const author = memory.created_by === userId ? 'Ти' : partnerName;

  const changePhoto = async () => {
    const picked = await pickPhoto();
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      await attachPhoto(memory.id, picked);
    } catch {
      setError('Не вдалося обробити фото. Спробуй інше.');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!hasPhoto && !caption.trim()) return setError('Без фото потрібен хоча б підпис.');
    updateMemory(memory.id, { happenedOn, caption });
    router.back();
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: formatDayMonth(parseIsoDate(memory.happened_on), true) }} />

      {hasPhoto ? (
        <Photo
          bucket="memories"
          path={memory.photo_path}
          localUri={pending?.full.uri}
          style={{ width: '100%', aspectRatio: ratio, borderRadius: radius.lg }}
          accessibilityLabel={memory.caption ?? 'Фото спогаду'}
        />
      ) : null}
      {pending ? (
        <Text variant="caption" color="textMuted">
          Фото завантажується. {partnerName} побачить його, щойно воно дійде.
        </Text>
      ) : null}

      <Card style={{ gap: spacing.md }}>
        <Text variant="caption" color="textMuted">
          {author} · додано {formatDayMonth(new Date(memory.created_at), true)}
        </Text>
        <DateField
          label="Коли це було"
          value={happenedOn}
          onChange={(iso) => iso && setHappenedOn(iso)}
          maxDate={todayIso()}
        />
        <TextField
          label="Підпис"
          placeholder="Що тоді сталося"
          value={caption}
          onChangeText={(text) => {
            setCaption(text);
            setError(null);
          }}
          maxLength={MAX_CAPTION}
          multiline
          style={{ minHeight: 72, textAlignVertical: 'top' }}
        />
        {error ? <Text color="primary">{error}</Text> : null}
        {changed ? <Button title="Зберегти" onPress={save} /> : null}
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Button
            title={busy ? 'Обробляємо…' : hasPhoto ? 'Змінити фото' : 'Додати фото'}
            icon={ImageSquareIcon}
            variant="secondary"
            disabled={busy}
            onPress={changePhoto}
          />
          {hasPhoto ? (
            <Button
              title="Прибрати фото"
              icon={XIcon}
              variant="ghost"
              disabled={busy || (!caption.trim() && !memory.caption)}
              onPress={() => removeMemoryPhoto(memory)}
            />
          ) : null}
        </View>

        <CommentThread
          comments={comments}
          partnerName={partnerName}
          placeholder="Що ти пам’ятаєш про цей день?"
          maxLength={MAX_MEMORY_COMMENT}
          onAdd={(text) => addMemoryComment(memory.id, text)}
          onDelete={deleteMemoryComment}
        />
      </Card>

      {confirmDelete ? (
        <View style={{ gap: spacing.sm }}>
          <Text align="center">Спогад і фото зникнуть у вас обох.</Text>
          <Button
            title="Так, видалити"
            icon={TrashIcon}
            onPress={() => {
              deleteMemory(memory);
              router.back();
            }}
          />
          <Button title="Скасувати" variant="ghost" onPress={() => setConfirmDelete(false)} />
        </View>
      ) : (
        <Button
          title="Видалити спогад"
          icon={TrashIcon}
          variant="ghost"
          onPress={() => setConfirmDelete(true)}
        />
      )}
    </Screen>
  );
}
