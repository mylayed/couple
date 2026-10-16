import { useRouter } from 'expo-router';
import { PaperPlaneTiltIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { NotePaper, useNoteTint } from '@/components/NotePaper';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import {
  loadNoteDraft,
  MAX_NOTE,
  NOTE_STYLES,
  saveNoteDraft,
  sendNote,
  type NoteStyle,
} from '@/services/notes';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';

const STYLE_LABELS: Record<NoteStyle, string> = {
  rose: 'Рожева',
  violet: 'Фіолетова',
  mint: "М'ятна",
  dawn: 'Світанок',
};

function StyleSwatch({
  value,
  selected,
  onPress,
}: {
  value: NoteStyle;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();
  const [from] = useNoteTint(value);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={STYLE_LABELS[value]}
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[
        styles.swatch,
        {
          borderRadius: radius.pill,
          backgroundColor: from,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    />
  );
}

export default function NewNote() {
  const router = useRouter();
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'партнера');
  const [draft] = useState(loadNoteDraft);
  const [body, setBody] = useState(draft?.body ?? '');
  const [style, setStyle] = useState<NoteStyle>(draft?.style ?? 'rose');

  // Чернетка зберігається на ходу, тож вихід з екрана нічого не губить
  useEffect(() => {
    saveNoteDraft({ body, style });
  }, [body, style]);

  const send = () => {
    if (!body.trim()) return;
    if (sendNote(body, style)) {
      haptics.success();
      router.back();
    }
  };

  return (
    <Screen edges={['bottom']}>
      <Text color="textMuted">
        Листівку для {partnerName} буде запечатано в конверт. Відкрити її можна лише самому.
      </Text>
      <NotePaper noteStyle={style}>
        <TextField
          placeholder="Напиши щось тепле…"
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={MAX_NOTE}
          style={{ minHeight: 160, textAlignVertical: 'top' }}
          autoFocus
        />
        <Text variant="caption" color="textMuted" align="right">
          {body.length}/{MAX_NOTE}
        </Text>
      </NotePaper>
      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Колір листівки
        </Text>
        <View style={[styles.row, { gap: spacing.md }]}>
          {NOTE_STYLES.map((s) => (
            <StyleSwatch key={s} value={s} selected={style === s} onPress={() => setStyle(s)} />
          ))}
        </View>
      </View>
      <Button title="Надіслати" icon={PaperPlaneTiltIcon} onPress={send} disabled={!body.trim()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 40, height: 40, borderWidth: 2 },
});
