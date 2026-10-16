import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { DATE_KIND_ICONS } from '@/components/DateKindIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { ToggleRow } from '@/components/ToggleRow';
import {
  DATE_KINDS,
  deleteImportantDate,
  saveImportantDate,
  type DateKind,
} from '@/services/calendar';
import { useRow } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';
import { formatUkDate, parseUkDate } from '@/utils/dates';

// Один екран і для нової дати (/dates/new), і для зміни наявної
export default function EditDate() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const existing = useRow('important_dates', isNew ? '' : id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(formatUkDate(existing?.date ?? null));
  const [kind, setKind] = useState<DateKind>(existing?.kind ?? 'anniversary');
  const [repeatsYearly, setRepeatsYearly] = useState(existing?.repeats_yearly ?? true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isNew && !existing) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Дата' }} />
        <Text color="textMuted">Цієї дати вже немає. Можливо, її видалили на іншому телефоні.</Text>
      </Screen>
    );
  }

  const save = () => {
    if (!title.trim()) return setError('Назви дату.');
    // Майбутні дати теж можна: наприклад, запланована подорож
    const iso = parseUkDate(date, { allowFuture: true });
    if (!iso) return setError('Дата має бути у форматі ДД.ММ.РРРР.');
    saveImportantDate({ title, date: iso, kind, repeatsYearly }, isNew ? undefined : id);
    router.back();
  };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: isNew ? 'Нова дата' : 'Змінити дату' }} />

      <TextField
        label="Назва"
        placeholder="Перший поцілунок"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setError(null);
        }}
        maxLength={80}
        autoFocus={isNew}
      />
      <TextField
        label="Дата"
        placeholder="ДД.ММ.РРРР"
        value={date}
        onChangeText={(text) => {
          setDate(text.replace(/[^\d.]/g, '').slice(0, 10));
          setError(null);
        }}
        keyboardType="numbers-and-punctuation"
        error={error}
      />

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Що це за дата
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {DATE_KINDS.map((k) => (
            <Chip
              key={k.kind}
              label={k.title}
              icon={DATE_KIND_ICONS[k.kind]}
              selected={kind === k.kind}
              onPress={() => setKind(k.kind)}
            />
          ))}
        </View>
      </View>

      <ToggleRow
        title="Щороку"
        description="Нагадувати про цю дату кожного року"
        value={repeatsYearly}
        onValueChange={setRepeatsYearly}
      />

      <View style={{ flex: 1 }} />
      <Button title={isNew ? 'Додати' : 'Зберегти'} onPress={save} />
      {!isNew ? (
        confirmDelete ? (
          <View style={{ gap: spacing.sm }}>
            <Text align="center">Дата зникне у вас обох.</Text>
            <Button
              title="Так, видалити"
              icon={TrashIcon}
              onPress={() => {
                deleteImportantDate(id);
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
        )
      ) : null}
    </Screen>
  );
}
