import { LinearGradient } from 'expo-linear-gradient';
import { ArrowsClockwiseIcon, CheckIcon, SparkleIcon } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  BUDGETS,
  DATE_MOODS,
  pickDateIdea,
  type Budget,
  type DateIdea,
  type DateMood,
} from '@/data/dateIdeas';
import { addBucketItem } from '@/services/plans';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; title: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Chip label="Будь-який" selected={value === null} onPress={() => onChange(null)} />
        {options.map((o) => (
          <Chip
            key={o.value}
            label={o.title}
            selected={value === o.value}
            onPress={() => onChange(o.value)}
          />
        ))}
      </View>
    </View>
  );
}

export default function DateIdeaScreen() {
  const { colors, radius, spacing } = useTheme();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [mood, setMood] = useState<DateMood | null>(null);
  const [idea, setIdea] = useState<DateIdea | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  // Показані за цей візит, щоб «Ще одна» не повторювала їх одразу
  const seen = useRef(new Set<string>());

  const next = (filters = { budget, mood }) => {
    const picked = pickDateIdea(filters, seen.current);
    if (picked) seen.current.add(picked.id);
    setIdea(picked);
    setSavedId(null);
    haptics.tap();
  };

  const tags = idea
    ? [
        BUDGETS.find((b) => b.value === idea.budget)?.title,
        DATE_MOODS.find((m) => m.value === idea.mood)?.title,
      ].join(' · ')
    : '';

  return (
    <Screen edges={['bottom']}>
      <FilterRow label="Бюджет" options={BUDGETS} value={budget} onChange={setBudget} />
      <FilterRow label="Настрій" options={DATE_MOODS} value={mood} onChange={setMood} />

      {idea ? (
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm }}
        >
          <Text variant="caption" color="onPrimary">
            {tags}
          </Text>
          <Text variant="title" color="onPrimary">
            {idea.title}
          </Text>
          <Text color="onPrimary">{idea.description}</Text>
        </LinearGradient>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg }}>
          <Text color="textMuted" align="center">
            Оберіть бюджет і настрій або просто натисніть кнопку — ми запропонуємо, куди піти чи чим
            зайнятися разом.
          </Text>
        </View>
      )}

      {idea ? (
        <Button
          title={savedId ? 'Додано в бакет-ліст' : 'Хочемо! У бакет-ліст'}
          icon={savedId ? CheckIcon : SparkleIcon}
          variant="secondary"
          disabled={Boolean(savedId)}
          onPress={() => {
            haptics.success();
            setSavedId(addBucketItem(idea.title, idea.description));
          }}
        />
      ) : null}

      <View style={{ flex: idea ? 1 : 0 }} />
      <Button
        title={idea ? 'Ще одна ідея' : 'Запропонуй ідею'}
        icon={idea ? ArrowsClockwiseIcon : SparkleIcon}
        onPress={() => next()}
      />
    </Screen>
  );
}
