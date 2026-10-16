import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { MOODS, saveMood, useMyMood, VISIBILITY } from '@/services/moods';
import type { MoodKind } from '@/services/sync';
import { useMyMoods, type MoodVisibility } from '@/store/moods';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';

const MAX_MOOD_NOTE = 140;

export default function MoodScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const current = useMyMood();
  const defaultVisibility = useMyMoods((s) => s.defaultVisibility);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const [mood, setMood] = useState<MoodKind | null>(current?.mood ?? null);
  const [note, setNote] = useState(current?.note ?? '');
  const [visibility, setVisibility] = useState<MoodVisibility>(
    current?.visibility ?? defaultVisibility,
  );

  const save = () => {
    if (!mood) return;
    saveMood({ mood, note, visibility });
    haptics.success();
    router.back();
  };

  const hint = VISIBILITY.find((v) => v.value === visibility)?.hint;

  return (
    <Screen edges={['bottom']}>
      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Як ти сьогодні?</Text>
        <View style={[styles.row, { gap: spacing.sm }]}>
          {MOODS.map((m) => (
            <Chip
              key={m.kind}
              icon={m.icon}
              label={m.label}
              selected={mood === m.kind}
              onPress={() => setMood(m.kind)}
            />
          ))}
        </View>
        <TextField
          label="Кілька слів (необов'язково)"
          placeholder="Що на душі?"
          value={note}
          onChangeText={setNote}
          maxLength={MAX_MOOD_NOTE}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Що бачить {partnerName}</Text>
        <View style={[styles.row, { gap: spacing.sm }]}>
          {VISIBILITY.map((v) => (
            <Chip
              key={v.value}
              label={v.label}
              selected={visibility === v.value}
              onPress={() => setVisibility(v.value)}
            />
          ))}
        </View>
        <Text variant="caption" color="textMuted">
          {hint}
          {visibility !== 'all' && current?.visibility === 'all'
            ? `. Те, що ${partnerName} вже бачить, зникне після збереження.`
            : null}
        </Text>
      </Card>

      <Button title="Зберегти" onPress={save} disabled={!mood} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
