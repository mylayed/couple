import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { LIST_KIND_ICONS } from '@/components/ListKindIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { LIST_KINDS, MAX_LIST_TITLE, saveList } from '@/services/plans';
import type { ListKind } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';

export default function NewList() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [kind, setKind] = useState<ListKind>('movies');
  // Поки назву не змінили вручну, вона йде за видом списку
  const [title, setTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kindTitle = LIST_KINDS.find((k) => k.kind === kind)?.title ?? '';
  const value = title ?? (kind === 'other' ? '' : kindTitle);

  const create = () => {
    if (!value.trim()) return setError('Назви список.');
    const id = saveList({ title: value, kind });
    if (id) router.replace(`/lists/${id}`);
  };

  return (
    <Screen edges={['bottom']}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Що збираємо
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {LIST_KINDS.map((k) => (
            <Chip
              key={k.kind}
              label={k.title}
              icon={LIST_KIND_ICONS[k.kind]}
              selected={kind === k.kind}
              onPress={() => setKind(k.kind)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Назва"
        placeholder="Наприклад, «Подарунки на Новий рік»"
        value={value}
        onChangeText={(text) => {
          setTitle(text);
          setError(null);
        }}
        maxLength={MAX_LIST_TITLE}
        error={error}
      />

      <View style={{ flex: 1 }} />
      <Button title="Створити список" onPress={create} />
    </Screen>
  );
}
