import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { MomentForm } from '@/components/MomentForm';
import { momentGlyph } from '@/components/MomentIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  deleteMoment,
  deleteMomentLog,
  logMoment,
  MOMENT_ICONS,
  saveMoment,
  useMomentLogs,
  useMomentSummaries,
  type MomentIconName,
} from '@/services/moments';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, formatDaysAgo, parseIsoDate, parseUkDate, todayIso } from '@/utils/dates';

// Відмітка за інший день: коли забули відмітити вчасно
function LogPastDate({ momentId }: { momentId: string }) {
  const { spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return <Button title="Було в інший день" variant="ghost" onPress={() => setOpen(true)} />;
  }

  const save = () => {
    const iso = parseUkDate(date);
    if (!iso) return setError('Дата має бути у форматі ДД.ММ.РРРР і не в майбутньому.');
    logMoment(momentId, iso);
    setOpen(false);
    setDate('');
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <TextField
        label="Коли це було"
        placeholder="ДД.ММ.РРРР"
        value={date}
        onChangeText={(text) => {
          setDate(text.replace(/[^\d.]/g, '').slice(0, 10));
          setError(null);
        }}
        keyboardType="numbers-and-punctuation"
        error={error}
        autoFocus
      />
      <Button title="Відмітити" variant="secondary" onPress={save} />
      <Button title="Скасувати" variant="ghost" onPress={() => setOpen(false)} />
    </View>
  );
}

const asIconName = (icon: string | null): MomentIconName =>
  MOMENT_ICONS.includes(icon as MomentIconName) ? (icon as MomentIconName) : 'star';

export default function MomentScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const moment = useMomentSummaries().find((m) => m.id === id);
  const logs = useMomentLogs(id);
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!moment) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Момент' }} />
        <EmptyState
          icon={TrashIcon}
          title="Цього моменту вже немає"
          description="Можливо, його видалили на іншому телефоні."
        />
      </Screen>
    );
  }

  if (editing) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Змінити' }} />
        <MomentForm
          initial={{
            title: moment.title,
            icon: asIconName(moment.icon),
            remindAfterDays: moment.remind_after_days,
          }}
          submitTitle="Зберегти"
          onSubmit={(input) => {
            saveMoment(input, moment.id);
            setEditing(false);
          }}
        />
      </Screen>
    );
  }

  const doneToday = moment.lastOn === todayIso();

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: moment.title }} />

      <Card style={{ alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={momentGlyph(moment.icon)} size={48} color="primary" weight="duotone" />
        <Text variant="title" align="center">
          {moment.daysSince === null ? 'Ще не було' : formatDaysAgo(moment.daysSince)}
        </Text>
        <Text color={moment.overdue ? 'primary' : 'textMuted'} align="center">
          {moment.remind_after_days
            ? `Нагадаємо, якщо не буде довше ніж ${moment.remind_after_days} дн.`
            : 'Без нагадувань'}
        </Text>
      </Card>

      <Button
        title={doneToday ? 'Сьогодні вже відмічено' : 'Було сьогодні'}
        icon={CheckIcon}
        disabled={doneToday}
        onPress={() => logMoment(moment.id)}
      />
      <LogPastDate momentId={moment.id} />

      {logs.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Історія · {logs.length}</Text>
          {logs.map((log) => (
            <View
              key={log.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
            >
              <View style={{ flex: 1 }}>
                <Text>{formatDayMonth(parseIsoDate(log.happened_on), true)}</Text>
                <Text variant="caption" color="textMuted">
                  {log.created_by === userId ? 'Твоя відмітка' : `Відмітка: ${partnerName}`}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Видалити відмітку"
                onPress={() => deleteMomentLog(log.id)}
                hitSlop={12}
              >
                <Icon icon={TrashIcon} size={20} color="textMuted" />
              </Pressable>
            </View>
          ))}
        </Card>
      ) : null}

      <View style={{ flex: 1 }} />
      <Button title="Змінити" variant="secondary" onPress={() => setEditing(true)} />
      {confirmDelete ? (
        <View style={{ gap: spacing.sm }}>
          <Text align="center">Момент і всі відмітки зникнуть у вас обох.</Text>
          <Button
            title="Так, видалити"
            icon={TrashIcon}
            onPress={() => {
              deleteMoment(moment.id);
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
