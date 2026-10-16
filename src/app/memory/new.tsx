import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { PhotoSlot } from '@/components/PhotoSlot';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { createMemory, MAX_CAPTION, useCanAddPhoto } from '@/services/memories';
import { pickPhoto, type Photo } from '@/services/photos';
import { todayIso } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

export default function NewMemory() {
  const router = useRouter();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [happenedOn, setHappenedOn] = useState<string | null>(todayIso());
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canAddPhoto = useCanAddPhoto();

  const choose = async () => {
    // Безкоштовні фото закінчились: пропонуємо Plus замість галереї
    if (!photo && !canAddPhoto) {
      router.push({ pathname: '/plus', params: { from: 'photos' } });
      return;
    }
    const picked = await pickPhoto();
    if (picked) {
      setPhoto(picked);
      setError(null);
    }
  };

  const save = async () => {
    if (!photo && !caption.trim()) return setError('Додай фото або кілька слів про цей день.');
    if (!happenedOn) return setError('Обери дату.');
    setBusy(true);
    try {
      // Фото стискається тут, а завантажиться у фоні, навіть якщо зараз немає мережі
      const id = await createMemory({ happenedOn, caption, photo });
      if (!id) return setError('Спершу з’єднайтеся в пару.');
      haptics.success();
      router.back();
    } catch {
      setError('Не вдалося обробити фото. Спробуй інше.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <PhotoSlot uri={photo?.uri ?? null} onPress={choose} />
      <DateField
        label="Коли це було"
        value={happenedOn}
        onChange={setHappenedOn}
        maxDate={todayIso()}
      />
      <TextField
        label="Підпис"
        placeholder="Що тоді сталося, що хочеться запам’ятати"
        value={caption}
        onChangeText={(text) => {
          setCaption(text);
          setError(null);
        }}
        maxLength={MAX_CAPTION}
        multiline
        style={{ minHeight: 96, textAlignVertical: 'top' }}
      />
      {error ? <Text color="primary">{error}</Text> : null}
      <View style={{ flex: 1 }} />
      <Button title={busy ? 'Зберігаємо…' : 'Зберегти спогад'} disabled={busy} onPress={save} />
    </Screen>
  );
}
