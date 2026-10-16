import { LinearGradient } from 'expo-linear-gradient';
import { ArrowsClockwiseIcon, CheckIcon, MagicWandIcon, SparkleIcon } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { AiHint } from '@/components/AiHint';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
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
import { askAi, useAiConsent, type AiIdea } from '@/services/ai';
import { addBucketItem } from '@/services/plans';
import { useRows } from '@/services/sync';
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

const ideaTags = (idea: { budget: Budget; mood: DateMood }) =>
  [
    BUDGETS.find((b) => b.value === idea.budget)?.title,
    DATE_MOODS.find((m) => m.value === idea.mood)?.title,
  ].join(' · ');

// Що пара любить робити разом і про що мріє: з цього ШІ складає ідеї саме для вас
function usePairTaste() {
  const moments = useRows('moments');
  const logs = useRows('moment_logs');
  const bucket = useRows('bucket_items');
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) counts.set(log.moment_id, (counts.get(log.moment_id) ?? 0) + 1);
    const liked = moments
      .filter((m) => counts.has(m.id))
      .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
      .slice(0, 8)
      .map((m) => m.title);
    const dreams = bucket
      .filter((b) => !b.done_at)
      .slice(0, 10)
      .map((b) => b.title);
    return { liked, dreams };
  }, [moments, logs, bucket]);
}

function AiIdeaCard({ idea }: { idea: AiIdea }) {
  const { spacing } = useTheme();
  const [saved, setSaved] = useState(false);
  return (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="caption" color="textMuted">
        {ideaTags(idea)}
      </Text>
      <Text variant="subtitle">{idea.title}</Text>
      <Text color="textMuted">{idea.description}</Text>
      <Button
        title={saved ? 'Додано в бакет-ліст' : 'У бакет-ліст'}
        icon={saved ? CheckIcon : SparkleIcon}
        variant="ghost"
        disabled={saved}
        onPress={() => {
          haptics.success();
          addBucketItem(idea.title, idea.description);
          setSaved(true);
        }}
      />
    </Card>
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
  const consent = useAiConsent();
  const taste = usePairTaste();
  const [aiIdeas, setAiIdeas] = useState<AiIdea[] | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Назви ідей ШІ за цей візит, щоб наступні були іншими
  const aiSeen = useRef<string[]>([]);

  const askForUs = async () => {
    setAiBusy(true);
    setAiError(null);
    haptics.tap();
    const { data, error } = await askAi('date_ideas', {
      budget,
      mood,
      month: new Date().getMonth() + 1,
      // Спільні дані пари надсилаємо, лише якщо партнер не вимкнув ШІ
      liked: consent.partner ? taste.liked : [],
      dreams: consent.partner ? taste.dreams : [],
      exclude: aiSeen.current.slice(-20),
    });
    setAiBusy(false);
    if (error !== null) return setAiError(error);
    aiSeen.current.push(...data.ideas.map((i) => i.title));
    setAiIdeas(data.ideas);
    setIdea(null);
  };

  const next = (filters = { budget, mood }) => {
    const picked = pickDateIdea(filters, seen.current);
    if (picked) seen.current.add(picked.id);
    setIdea(picked);
    setSavedId(null);
    setAiIdeas(null);
    haptics.tap();
  };

  const tags = idea ? ideaTags(idea) : '';

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
      ) : aiIdeas ? (
        aiIdeas.map((i) => <AiIdeaCard key={i.title} idea={i} />)
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

      <View style={{ flex: idea || aiIdeas ? 1 : 0 }} />
      {consent.mine ? (
        <View style={{ gap: spacing.sm }}>
          {aiError ? (
            <Text variant="caption" color="primary">
              {aiError}
            </Text>
          ) : null}
          <Button
            title={aiBusy ? 'Думаємо…' : aiIdeas ? 'Ще ідеї для нас' : 'Ідеї саме для нас ✨'}
            icon={MagicWandIcon}
            variant="secondary"
            disabled={aiBusy}
            onPress={askForUs}
          />
          <AiHint />
        </View>
      ) : null}
      <Button
        title={idea ? 'Ще одна ідея' : 'Запропонуй ідею'}
        icon={idea ? ArrowsClockwiseIcon : SparkleIcon}
        onPress={() => next()}
      />
    </Screen>
  );
}
