import { EnvelopeOpenIcon, EnvelopeSimpleIcon, LockSimpleIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { DateField } from '@/components/DateField';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  CAPSULE_PERIODS,
  MAX_CAPSULE,
  minOpenDate,
  opensAfterMonths,
  sealCapsule,
  useCapsuleList,
  type Capsule,
} from '@/services/capsules';
import { usePlus } from '@/services/plus';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { daysBetween, formatDayMonth, formatDaysLeft, parseIsoDate } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

const DEFAULT_MONTHS = 12;

function useAuthorName() {
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  return (capsule: Capsule) => (capsule.created_by === userId ? 'Ти' : partnerName);
}

function SealForm() {
  const router = useRouter();
  const { spacing } = useTheme();
  const plus = usePlus();
  const [message, setMessage] = useState('');
  const [months, setMonths] = useState<number | null>(DEFAULT_MONTHS);
  const [opensOn, setOpensOn] = useState<string | null>(opensAfterMonths(DEFAULT_MONTHS));
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState(false);

  const seal = async () => {
    if (!opensOn) return;
    setBusy(true);
    setError(null);
    const result = await sealCapsule(message, opensOn);
    setBusy(false);
    if (result.error) return setError(result.error);
    haptics.success();
    setMessage('');
    setConfirm(false);
    setSealed(true);
  };

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Лист у майбутнє</Text>
      <Text color="textMuted">
        Напишіть, якими ви є зараз, про що мрієте й чого чекаєте. Лист відкриється в обраний день
        для вас обох.
      </Text>
      {plus ? null : (
        <Text variant="caption" color="textMuted">
          Запечатати нову капсулу можна з Plus. Уже запечатані відкриються у свій день у будь-якому
          разі.
        </Text>
      )}
      <TextField
        placeholder="Привіт, ми з майбутнього…"
        value={message}
        onChangeText={(text) => {
          setMessage(text);
          setSealed(false);
          setError(null);
        }}
        maxLength={MAX_CAPSULE}
        multiline
        style={{ minHeight: 140, textAlignVertical: 'top' }}
      />
      <View style={[styles.row, { gap: spacing.sm }]}>
        {CAPSULE_PERIODS.map((p) => (
          <Chip
            key={p.months}
            label={p.label}
            selected={months === p.months}
            onPress={() => {
              setMonths(p.months);
              setOpensOn(opensAfterMonths(p.months));
            }}
          />
        ))}
      </View>
      <DateField
        label="Відкриється"
        value={opensOn}
        onChange={(iso) => {
          setOpensOn(iso);
          setMonths(null);
        }}
        minDate={minOpenDate()}
      />
      {sealed ? <Text color="textMuted">Запечатано 💌 Лист чекатиме свого дня.</Text> : null}
      {error ? <Text color="primary">{error}</Text> : null}
      {confirm ? (
        <View style={{ gap: spacing.sm }}>
          <Text>
            Після запечатування лист не можна буде змінити чи прочитати до{' '}
            {opensOn ? formatDayMonth(parseIsoDate(opensOn), true) : 'дня відкриття'}. Навіть тобі.
          </Text>
          <Button
            title={busy ? 'Запечатуємо…' : 'Так, запечатати'}
            icon={LockSimpleIcon}
            disabled={busy}
            onPress={seal}
          />
          <Button title="Скасувати" variant="ghost" onPress={() => setConfirm(false)} />
        </View>
      ) : (
        <Button
          title="Запечатати"
          icon={LockSimpleIcon}
          disabled={!message.trim() || !opensOn}
          onPress={() =>
            plus
              ? setConfirm(true)
              : router.push({ pathname: '/plus', params: { from: 'capsule' } })
          }
        />
      )}
    </Card>
  );
}

export default function CapsuleScreen() {
  const { spacing } = useTheme();
  const { closed, opened } = useCapsuleList();
  const authorOf = useAuthorName();

  return (
    <Screen edges={['bottom']}>
      {opened.map((capsule) => (
        <Card key={capsule.id} style={{ gap: spacing.sm }}>
          <View style={[styles.row, { gap: spacing.sm }]}>
            <Icon icon={EnvelopeOpenIcon} size={24} color="primary" weight="duotone" />
            <Text variant="caption" color="textMuted" style={styles.flex}>
              {authorOf(capsule)} · запечатано {formatDayMonth(new Date(capsule.created_at), true)}
            </Text>
          </View>
          <Text>{capsule.message}</Text>
          <Text variant="caption" color="textMuted">
            Відкрито {formatDayMonth(parseIsoDate(capsule.opens_on), true)}
          </Text>
        </Card>
      ))}

      {closed.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Чекають свого дня</Text>
          {closed.map((capsule) => {
            const opens = parseIsoDate(capsule.opens_on);
            return (
              <View key={capsule.id} style={[styles.row, { gap: spacing.md }]}>
                <Icon icon={EnvelopeSimpleIcon} size={28} color="secondary" weight="duotone" />
                <View style={styles.flex}>
                  <Text variant="subtitle">
                    Відкриється {formatDaysLeft(daysBetween(new Date(), opens))}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {formatDayMonth(opens, true)} · {authorOf(capsule)}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}

      <SealForm />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  flex: { flex: 1 },
});
