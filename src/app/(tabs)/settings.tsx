import { LinkBreakIcon, SignOutIcon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode } from '@/theme/tokens';

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: 'light', title: 'Світла' },
  { mode: 'dark', title: 'Темна' },
  { mode: 'system', title: 'Системна' },
];

export default function Settings() {
  const { spacing, mode, setMode } = useTheme();
  const name = useSession((s) => s.user?.name ?? '');
  const leaveCouple = useSession((s) => s.leaveCouple);
  const signOut = useSession((s) => s.signOut);

  return (
    <Screen>
      <Text variant="title">Налаштування</Text>

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
        <Text color="textMuted">Твоє ім’я: {name}</Text>
        <Button
          title="Роз'єднати пару"
          icon={LinkBreakIcon}
          variant="secondary"
          onPress={leaveCouple}
        />
        <Button title="Вийти" icon={SignOutIcon} variant="ghost" onPress={signOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
