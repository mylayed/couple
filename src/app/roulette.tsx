import { useLocalSearchParams } from 'expo-router';
import { CheckIcon, SpinnerIcon, XIcon } from 'phosphor-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { AddField } from '@/components/AddField';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { listKindGlyph } from '@/components/ListKindIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Wheel, type WheelHandle } from '@/components/Wheel';
import { MAX_WHEEL_OPTIONS, ROULETTE_PRESETS } from '@/data/roulette';
import { setListItemDone } from '@/services/plans';
import { useRows } from '@/services/sync';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';

type Option = { label: string; listItemId?: string };
type Source = { id: string; title: string; listKind?: string; options: Option[] };

const CUSTOM = 'custom';

// Якщо пунктів більше, ніж влазить на колесо, беремо випадкові
function sample<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, max);
}

// Варіанти з незроблених пунктів спільних списків: «який фільм із нашого списку»
function useListSources(): Source[] {
  const lists = useRows('lists');
  const items = useRows('list_items');
  return useMemo(
    () =>
      [...lists]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((l) => ({
          id: l.id,
          title: l.title,
          listKind: l.kind,
          options: sample(
            items
              .filter((i) => i.list_id === l.id && !i.done_at)
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .map((i) => ({ label: i.title, listItemId: i.id })),
            MAX_WHEEL_OPTIONS,
          ),
        }))
        .filter((s) => s.options.length >= 2),
    [lists, items],
  );
}

export default function Roulette() {
  const { spacing, colors } = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ list?: string }>();
  const listSources = useListSources();
  const sources: Source[] = useMemo(
    () => [
      ...ROULETTE_PRESETS.map((p) => ({
        id: p.id,
        title: p.title,
        options: p.options.map((label) => ({ label })),
      })),
      ...listSources,
    ],
    [listSources],
  );

  const [sourceId, setSourceId] = useState(params.list ?? ROULETTE_PRESETS[0].id);
  // Свої варіанти живуть лише поки відкрито екран
  const [custom, setCustom] = useState<string[]>([]);
  const [result, setResult] = useState<Option | null>(null);
  const [marked, setMarked] = useState(false);
  const wheel = useRef<WheelHandle>(null);

  const source = sources.find((s) => s.id === sourceId);
  const options: Option[] = useMemo(
    () =>
      sourceId === CUSTOM
        ? custom.map((label) => ({ label }))
        : (source?.options ?? sources[0].options),
    [sourceId, custom, source, sources],
  );
  const labels = useMemo(() => options.map((o) => o.label), [options]);
  const wheelSize = Math.min(width - spacing.lg * 2, 340);

  const choose = (id: string) => {
    setSourceId(id);
    setResult(null);
  };

  return (
    <Screen edges={['bottom']}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {sources.map((s) => (
          <Chip
            key={s.id}
            label={s.title}
            icon={s.listKind ? listKindGlyph(s.listKind) : undefined}
            selected={s.id === (source ? sourceId : sources[0].id)}
            onPress={() => choose(s.id)}
          />
        ))}
        <Chip label="Свої варіанти" selected={sourceId === CUSTOM} onPress={() => choose(CUSTOM)} />
      </View>

      {sourceId === CUSTOM ? (
        <View style={{ gap: spacing.sm }}>
          <AddField
            placeholder="Варіант"
            maxLength={40}
            onAdd={(label) => {
              setCustom((prev) =>
                prev.length >= MAX_WHEEL_OPTIONS || prev.includes(label) ? prev : [...prev, label],
              );
              setResult(null);
            }}
          />
          {custom.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {custom.map((label) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`Прибрати «${label}»`}
                  onPress={() => {
                    setCustom((prev) => prev.filter((l) => l !== label));
                    setResult(null);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text variant="caption">{label}</Text>
                  <Icon icon={XIcon} size={14} color="textMuted" />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ alignItems: 'center' }}>
        {labels.length >= 2 ? (
          <Wheel
            ref={wheel}
            options={labels}
            size={wheelSize}
            onSpinStart={() => {
              setResult(null);
              setMarked(false);
            }}
            onResult={(index) => {
              haptics.success();
              setResult(options[index] ?? null);
            }}
          />
        ) : (
          <Text color="textMuted" align="center">
            Додайте щонайменше два варіанти, і колесо вирішить за вас.
          </Text>
        )}
      </View>

      {result ? (
        <Card style={{ gap: spacing.sm, alignItems: 'center' }}>
          <Text variant="caption" color="textMuted">
            Колесо вирішило
          </Text>
          <Text variant="title" align="center">
            {result.label}
          </Text>
          {result.listItemId ? (
            <Button
              title={marked ? 'Відмічено в списку' : 'Відмітити зробленим'}
              icon={CheckIcon}
              variant="ghost"
              disabled={marked}
              onPress={() => {
                setListItemDone(result.listItemId as string, true);
                setMarked(true);
              }}
            />
          ) : null}
        </Card>
      ) : null}

      <View style={{ flex: 1 }} />
      <Button
        title={result ? 'Крутити ще раз' : 'Крутити'}
        icon={SpinnerIcon}
        disabled={labels.length < 2}
        onPress={() => wheel.current?.spin()}
      />
    </Screen>
  );
}
