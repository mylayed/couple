import { useRouter } from 'expo-router';
import { ChartBarIcon, CheckCircleIcon, MagicWandIcon } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AiHint } from '@/components/AiHint';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { momentGlyph } from '@/components/MomentIcon';
import { Photo } from '@/components/Photo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { askAi, saveYearStory, useAiConsent, useYearStory } from '@/services/ai';
import { useSummaryYears, useYearSummary, type YearSummary } from '@/services/yearSummary';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, monthName, parseIsoDate, pluralUk } from '@/utils/dates';

const PHOTO_COLUMNS = 3;
const MAX_PHOTOS = 9;

function Stat({ value, label }: { value: number; label: string }) {
  const { spacing } = useTheme();
  return (
    <Card style={[styles.stat, { padding: spacing.md, gap: spacing.xs }]}>
      <Text variant="title" color="primary">
        {value}
      </Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </Card>
  );
}

const MAX_CAPTIONS = 20;

// Рівномірна вибірка, щоб у довгому році були і початок, і кінець
function spread<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  return Array.from({ length: max }, (_, i) => items[Math.floor((i * items.length) / max)]);
}

// Коротка тепла історія року від ШІ. Готовий текст зберігається на телефоні;
// якщо дані року змінились, пропонуємо оновити.
function YearStoryCard({ s }: { s: YearSummary }) {
  const { spacing } = useTheme();
  const consent = useAiConsent();
  const me = useAuth((st) => st.profile?.name ?? '');
  const partnerName = useCouple((st) => st.partner?.name ?? '');
  const story = useYearStory(s.year);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const input = useMemo(
    () => ({
      year: s.year,
      me,
      partner: partnerName,
      stats: {
        dates: s.dates,
        trips: s.trips,
        memories: s.memories.length,
        questions: s.questions,
        games: s.games,
        challenges: s.challenges,
        notes: s.notes,
        touches: s.touches,
      },
      busiestMonth: s.busiestMonth,
      topMoments: s.topMoments.map((m) => ({ title: m.title, count: m.count })),
      dreams: s.dreams.map((d) => d.title),
      captions: spread(
        s.memories.map((m) => m.caption?.trim() ?? '').filter(Boolean),
        MAX_CAPTIONS,
      ),
    }),
    [s, me, partnerName],
  );
  const inputKey = JSON.stringify(input);

  if (!consent.mine) return null;

  const tell = async () => {
    setBusy(true);
    setError(null);
    const { data, error: failed } = await askAi('year_story', input);
    setBusy(false);
    if (failed !== null) return setError(failed);
    saveYearStory(s.year, { ...data, input: inputKey });
  };

  return (
    <Card style={{ gap: spacing.md }}>
      {story ? (
        <>
          <Text variant="subtitle">{story.title}</Text>
          <Text>{story.text}</Text>
        </>
      ) : (
        <>
          <Text variant="subtitle">Історія вашого року</Text>
          <Text color="textMuted">
            ШІ складе з ваших моментів, мрій і спогадів кілька теплих рядків.
          </Text>
        </>
      )}
      {!consent.partner ? (
        <Text variant="caption" color="textMuted">
          {partnerName || 'Партнер'} вимикає ШІ, тож спільні дані пари ми не надсилаємо.
        </Text>
      ) : !story || story.input !== inputKey ? (
        <>
          {error ? (
            <Text variant="caption" color="primary">
              {error}
            </Text>
          ) : null}
          <Button
            title={
              busy ? 'Пишемо…' : story ? 'Оновити з новими подіями ✨' : 'Розповісти наш рік ✨'
            }
            icon={MagicWandIcon}
            variant="secondary"
            disabled={busy}
            onPress={tell}
          />
          <AiHint />
        </>
      ) : null}
    </Card>
  );
}

export default function YearScreen() {
  const router = useRouter();
  const { radius, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const years = useSummaryYears();
  const [year, setYear] = useState(years[0]);
  const s = useYearSummary(year);

  const photos = s.memories.filter((m) => m.thumb_path).slice(-MAX_PHOTOS);
  // Картка має внутрішній відступ, тож рахуємо ширину від нього
  const photoSize = Math.floor(
    (width - spacing.lg * 4 - spacing.sm * (PHOTO_COLUMNS - 1)) / PHOTO_COLUMNS,
  );

  const stats: { value: number; label: string }[] = [
    { value: s.dates, label: pluralUk(s.dates, ['побачення', 'побачення', 'побачень']) },
    { value: s.trips, label: pluralUk(s.trips, ['подорож', 'подорожі', 'подорожей']) },
    {
      value: s.memories.length,
      label: pluralUk(s.memories.length, ['спогад', 'спогади', 'спогадів']),
    },
    { value: s.questions, label: 'питань дня на двох' },
    { value: s.games, label: pluralUk(s.games, ['гра', 'гри', 'ігор']) },
    { value: s.challenges, label: pluralUk(s.challenges, ['челендж', 'челенджі', 'челенджів']) },
    { value: s.notes, label: pluralUk(s.notes, ['листівка', 'листівки', 'листівок']) },
    { value: s.touches, label: pluralUk(s.touches, ['дотик', 'дотики', 'дотиків']) },
  ].filter((stat) => stat.value > 0);

  return (
    <Screen edges={['bottom']}>
      {years.length > 1 ? (
        <View style={[styles.row, { gap: spacing.sm }]}>
          {years.map((y) => (
            <Chip key={y} label={String(y)} selected={y === year} onPress={() => setYear(y)} />
          ))}
        </View>
      ) : null}

      <Text variant="title">Ваш {year}</Text>

      {s.isEmpty ? (
        <EmptyState
          icon={ChartBarIcon}
          title="Тут з’явиться ваш рік"
          description="Відмічайте моменти, додавайте спогади, грайте разом, і підсумок наповниться сам."
        />
      ) : (
        <>
          <YearStoryCard s={s} />

          {stats.length > 0 ? (
            <View style={[styles.row, { gap: spacing.md }]}>
              {stats.map((stat) => (
                <Stat key={stat.label} {...stat} />
              ))}
            </View>
          ) : null}

          {s.busiestMonth !== null ? (
            <Text color="textMuted">
              Найнасиченіший місяць: {monthName(s.busiestMonth).toLowerCase()}.
            </Text>
          ) : null}

          {photos.length > 0 ? (
            <Card style={{ gap: spacing.md }}>
              <Text variant="subtitle">Кадри року</Text>
              <View style={[styles.row, { gap: spacing.sm }]}>
                {photos.map((m) => (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityLabel={m.caption ?? 'Спогад'}
                    onPress={() => router.push(`/memory/${m.id}`)}
                  >
                    <Photo
                      bucket="memories"
                      path={m.thumb_path}
                      style={{ width: photoSize, height: photoSize, borderRadius: radius.sm }}
                    />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}

          {s.topMoments.length > 0 ? (
            <Card style={{ gap: spacing.lg }}>
              <Text variant="subtitle">Найчастіше</Text>
              {s.topMoments.map((m) => (
                <ListItem
                  key={m.id}
                  icon={momentGlyph(m.icon)}
                  title={m.title}
                  subtitle={`${m.count} ${pluralUk(m.count, ['раз', 'рази', 'разів'])}`}
                  onPress={() => router.push(`/moment/${m.id}`)}
                />
              ))}
            </Card>
          ) : null}

          {s.dreams.length > 0 ? (
            <Card style={{ gap: spacing.md }}>
              <Text variant="subtitle">Здійснені мрії</Text>
              {s.dreams.map((d) => (
                <View key={d.id} style={[styles.line, { gap: spacing.sm }]}>
                  <Icon icon={CheckCircleIcon} size={22} color="success" weight="fill" />
                  <Text style={styles.flex}>{d.title}</Text>
                  <Text variant="caption" color="textMuted">
                    {formatDayMonth(new Date(d.done_at as string))}
                  </Text>
                </View>
              ))}
            </Card>
          ) : null}

          {s.memories.length > 0 ? (
            <Card style={{ gap: spacing.md }}>
              <Text variant="subtitle">Ключові моменти</Text>
              {s.memories
                .filter((m) => m.caption)
                .map((m) => (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    onPress={() => router.push(`/memory/${m.id}`)}
                    style={({ pressed }) => ({ gap: 2, opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text variant="caption" color="textMuted">
                      {formatDayMonth(parseIsoDate(m.happened_on))}
                    </Text>
                    <Text numberOfLines={3}>{m.caption}</Text>
                  </Pressable>
                ))}
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  line: { flexDirection: 'row', alignItems: 'center' },
  stat: { flexGrow: 1, flexBasis: '40%' },
  flex: { flex: 1 },
});
