import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BroomIcon, PencilSimpleIcon, SpinnerIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AddField } from '@/components/AddField';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow } from '@/components/CheckRow';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { listKindGlyph } from '@/components/ListKindIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  addListItem,
  clearDoneItems,
  deleteList,
  deleteListItem,
  listKindInfo,
  MAX_ITEM_TITLE,
  MAX_LIST_TITLE,
  saveList,
  setListItemDone,
  useListItems,
} from '@/services/plans';
import { useRow, type ListItem, type ListKind } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';

function RemoveButton({ item }: { item: ListItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Прибрати «${item.title}»`}
      hitSlop={8}
      onPress={() => deleteListItem(item.id)}
    >
      <Icon icon={XIcon} size={18} color="textMuted" />
    </Pressable>
  );
}

// Перейменування та видалення списку
function ListSettings({ id, title, kind }: { id: string; title: string; kind: ListKind }) {
  const router = useRouter();
  const { spacing } = useTheme();
  const [mode, setMode] = useState<'closed' | 'rename' | 'delete'>('closed');
  const [value, setValue] = useState(title);

  if (mode === 'rename') {
    return (
      <View style={{ gap: spacing.sm }}>
        <TextField
          label="Назва списку"
          value={value}
          onChangeText={setValue}
          maxLength={MAX_LIST_TITLE}
          autoFocus
        />
        <Button
          title="Зберегти"
          variant="secondary"
          disabled={!value.trim()}
          onPress={() => {
            saveList({ title: value, kind }, id);
            setMode('closed');
          }}
        />
        <Button title="Скасувати" variant="ghost" onPress={() => setMode('closed')} />
      </View>
    );
  }

  if (mode === 'delete') {
    return (
      <View style={{ gap: spacing.sm }}>
        <Text align="center">Список і всі його пункти зникнуть у вас обох.</Text>
        <Button
          title="Так, видалити"
          icon={TrashIcon}
          onPress={() => {
            deleteList(id);
            router.back();
          }}
        />
        <Button title="Скасувати" variant="ghost" onPress={() => setMode('closed')} />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }}>
      <Button
        title="Перейменувати"
        icon={PencilSimpleIcon}
        variant="ghost"
        onPress={() => setMode('rename')}
      />
      <Button title="Видалити" icon={TrashIcon} variant="ghost" onPress={() => setMode('delete')} />
    </View>
  );
}

export default function ListScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useRow('lists', id);
  const { open, done } = useListItems(id);

  if (!list) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Список' }} />
        <Text color="textMuted">
          Цього списку вже немає. Можливо, його видалили на іншому телефоні.
        </Text>
      </Screen>
    );
  }

  const info = listKindInfo(list.kind);

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: list.title }} />

      <AddField
        placeholder={info.placeholder}
        maxLength={MAX_ITEM_TITLE}
        onAdd={(title) => addListItem(list.id, title)}
      />

      {open.length === 0 && done.length === 0 ? (
        <EmptyState
          icon={listKindGlyph(list.kind)}
          title="Список порожній"
          description="Додавайте пункти разом: усе, що допише партнер, одразу з'явиться тут."
        />
      ) : null}

      {open.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          {open.map((item) => (
            <CheckRow
              key={item.id}
              title={item.title}
              done={false}
              onToggle={(value) => setListItemDone(item.id, value)}
              right={<RemoveButton item={item} />}
            />
          ))}
        </Card>
      ) : null}

      {open.length >= 2 ? (
        <Button
          title="Обрати навмання"
          icon={SpinnerIcon}
          variant="secondary"
          onPress={() => router.push({ pathname: '/roulette', params: { list: list.id } })}
        />
      ) : null}

      {done.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="caption" color="textMuted">
            Зроблено
          </Text>
          {done.map((item) => (
            <CheckRow
              key={item.id}
              title={item.title}
              done
              onToggle={(value) => setListItemDone(item.id, value)}
              right={<RemoveButton item={item} />}
            />
          ))}
          <Button
            title="Прибрати зроблене"
            icon={BroomIcon}
            variant="ghost"
            onPress={() => clearDoneItems(done)}
          />
        </Card>
      ) : null}

      <View style={{ flex: 1 }} />
      <ListSettings id={list.id} title={list.title} kind={list.kind} />
    </Screen>
  );
}
