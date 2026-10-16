import { useRouter } from 'expo-router';
import {
  ArrowCounterClockwiseIcon,
  MagicWandIcon,
  PaperPlaneTiltIcon,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AiHint } from '@/components/AiHint';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
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
import { askAi, NOTE_TONES, useAiConsent, type NoteTone } from '@/services/ai';
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

// Текст до ШІ і що з нього вийшло. Повторне натискання переписує той самий
// вихідний текст іншим варіантом, а не попередню відповідь ШІ.
type AiDraft = { source: string; output: string; variant: number };

function AiHelper({ body, onChange }: { body: string; onChange: (text: string) => void }) {
  const { spacing } = useTheme();
  const consent = useAiConsent();
  const partner = useCouple((s) => s.partner?.name ?? '');
  const [tone, setTone] = useState<NoteTone>('tender');
  const [last, setLast] = useState<AiDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!consent.mine) return null;

  const fromAi = last !== null && body === last.output;
  const source = fromAi ? last.source : body;

  const write = async () => {
    setBusy(true);
    setError(null);
    haptics.tap();
    const variant = fromAi ? last.variant + 1 : 0;
    const { data, error: failed } = await askAi('note', {
      tone,
      draft: source,
      partner: consent.partner ? partner : '',
      variant,
    });
    setBusy(false);
    if (failed !== null) return setError(failed);
    haptics.success();
    setLast({ source, output: data.text, variant });
    onChange(data.text);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" color="textMuted">
        Допомога ШІ
      </Text>
      <View style={[styles.row, { gap: spacing.sm }]}>
        {NOTE_TONES.map((t) => (
          <Chip
            key={t.value}
            label={t.title}
            selected={tone === t.value}
            onPress={() => setTone(t.value)}
          />
        ))}
      </View>
      {error ? (
        <Text variant="caption" color="primary">
          {error}
        </Text>
      ) : null}
      <Button
        title={
          busy
            ? 'Пишемо…'
            : fromAi
              ? 'Інший варіант ✨'
              : body.trim()
                ? 'Покращити ✨'
                : 'Написати ✨'
        }
        icon={MagicWandIcon}
        variant="secondary"
        disabled={busy}
        onPress={write}
      />
      {fromAi ? (
        <Button
          title={last.source ? 'Повернути мій текст' : 'Очистити'}
          icon={ArrowCounterClockwiseIcon}
          variant="ghost"
          onPress={() => {
            onChange(last.source);
            setLast(null);
          }}
        />
      ) : null}
      <AiHint />
    </View>
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
      <AiHelper body={body} onChange={setBody} />
      <Button title="Надіслати" icon={PaperPlaneTiltIcon} onPress={send} disabled={!body.trim()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 40, height: 40, borderWidth: 2 },
});
