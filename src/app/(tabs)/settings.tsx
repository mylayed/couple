import { LinkBreakIcon, SignOutIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { deleteAccount, signOut, updateProfile } from '@/services/auth';
import { useAuth, type Profile } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode } from '@/theme/tokens';
import { formatUkDate, parseUkDate } from '@/utils/dates';

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: 'light', title: 'Світла' },
  { mode: 'dark', title: 'Темна' },
  { mode: 'system', title: 'Системна' },
];

// Поля ініціалізуються з профілю один раз; key на батьківському рівні скидає їх після зміни профілю
function ProfileCard({ profile }: { profile: Profile }) {
  const { spacing } = useTheme();
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(formatUkDate(profile.birth_date));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Ім'я не може бути порожнім.");
    const iso = birthDate.trim() ? parseUkDate(birthDate) : null;
    if (birthDate.trim() && !iso) return setError('Дата має бути у форматі ДД.ММ.РРРР.');
    setBusy(true);
    setError(null);
    const result = await updateProfile({ name: trimmed, birth_date: iso });
    setBusy(false);
    if (result.error) setError(result.error);
    else setSaved(true);
  };

  const dirty = name.trim() !== profile.name || birthDate !== formatUkDate(profile.birth_date);

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Профіль</Text>
      <TextField
        label="Ім'я"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setSaved(false);
        }}
        autoCapitalize="words"
        maxLength={40}
      />
      <TextField
        label="Дата народження"
        placeholder="ДД.ММ.РРРР"
        value={birthDate}
        onChangeText={(text) => {
          setBirthDate(text.replace(/[^\d.]/g, '').slice(0, 10));
          setSaved(false);
        }}
        keyboardType="numbers-and-punctuation"
        error={error}
      />
      {saved && !dirty ? <Text color="textMuted">Збережено</Text> : null}
      <Button
        title={busy ? 'Зберігаємо…' : 'Зберегти'}
        variant="secondary"
        onPress={save}
        disabled={!dirty || busy}
      />
    </Card>
  );
}

export default function Settings() {
  const { spacing, mode, setMode } = useTheme();
  const profile = useAuth((s) => s.profile);
  const email = useAuth((s) => s.session?.user.email);
  const leaveCouple = useCouple((s) => s.leaveCouple);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<{ error: string | null }>) => {
    setBusy(true);
    setAccountError(null);
    const result = await action();
    setBusy(false);
    if (result.error) setAccountError(result.error);
  };

  return (
    <Screen>
      <Text variant="title">Налаштування</Text>

      {profile ? <ProfileCard key={profile.id} profile={profile} /> : null}

      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Тема</Text>
        <View style={[styles.row, { gap: spacing.sm }]}>
          {MODES.map((m) => (
            <Button
              key={m.mode}
              title={m.title}
              variant={mode === m.mode ? 'primary' : 'secondary'}
              onPress={() => setMode(m.mode)}
            />
          ))}
        </View>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Пара</Text>
        <Button
          title="Роз'єднати пару"
          icon={LinkBreakIcon}
          variant="secondary"
          onPress={leaveCouple}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Акаунт</Text>
        {email ? <Text color="textMuted">{email}</Text> : null}
        <Button
          title="Вийти"
          icon={SignOutIcon}
          variant="secondary"
          disabled={busy}
          onPress={() => run(signOut)}
        />
        {confirmDelete ? (
          <View style={{ gap: spacing.sm }}>
            <Text>Акаунт і всі твої дані буде видалено назавжди. Відновити їх не вийде.</Text>
            <Button
              title={busy ? 'Видаляємо…' : 'Так, видалити назавжди'}
              icon={TrashIcon}
              disabled={busy}
              onPress={() => run(deleteAccount)}
            />
            <Button title="Скасувати" variant="ghost" onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <Button
            title="Видалити акаунт"
            icon={TrashIcon}
            variant="ghost"
            onPress={() => setConfirmDelete(true)}
          />
        )}
        {accountError ? <Text color="primary">{accountError}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
