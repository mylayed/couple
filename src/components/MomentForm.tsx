import { useState } from 'react';
import { View } from 'react-native';

import { MOMENT_ICONS, type MomentIconName, type MomentInput } from '@/services/moments';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Chip } from './Chip';
import { MOMENT_ICON_GLYPHS } from './MomentIcon';
import { Text } from './Text';
import { TextField } from './TextField';

const REMIND_OPTIONS: { days: number | null; label: string }[] = [
  { days: null, label: 'Не нагадувати' },
  { days: 7, label: 'Тиждень' },
  { days: 14, label: '2 тижні' },
  { days: 30, label: 'Місяць' },
  { days: 90, label: '3 місяці' },
  { days: 180, label: 'Пів року' },
];

type MomentFormProps = {
  initial?: MomentInput;
  submitTitle: string;
  onSubmit: (input: MomentInput) => void;
};

export function MomentForm({ initial, submitTitle, onSubmit }: MomentFormProps) {
  const { spacing } = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [icon, setIcon] = useState<MomentIconName>(initial?.icon ?? 'heart');
  const [remindAfterDays, setRemindAfterDays] = useState<number | null>(
    initial ? initial.remindAfterDays : 14,
  );
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) return setError('Назви, що саме відстежуємо.');
    onSubmit({ title, icon, remindAfterDays });
  };

  // Збережене значення, якого немає серед варіантів, теж показуємо
  const options = REMIND_OPTIONS.some((o) => o.days === remindAfterDays)
    ? REMIND_OPTIONS
    : [...REMIND_OPTIONS, { days: remindAfterDays, label: `${remindAfterDays} дн.` }];

  return (
    <View style={{ gap: spacing.lg }}>
      <TextField
        label="Що робимо разом"
        placeholder="Побачення, подорож, кіно…"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setError(null);
        }}
        maxLength={60}
        error={error}
        autoFocus={!initial}
      />

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Іконка
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {MOMENT_ICONS.map((name) => (
            <Chip
              key={name}
              icon={MOMENT_ICON_GLYPHS[name]}
              selected={icon === name}
              onPress={() => setIcon(name)}
              accessibilityLabel={name}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="textMuted">
          Нагадати, якщо не було довше ніж
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {options.map((o) => (
            <Chip
              key={o.label}
              label={o.label}
              selected={remindAfterDays === o.days}
              onPress={() => setRemindAfterDays(o.days)}
            />
          ))}
        </View>
      </View>

      <Button title={submitTitle} onPress={submit} />
    </View>
  );
}
