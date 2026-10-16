import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
} from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, ScrollViewInstance, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, parseIsoDate, toIsoDate, todayIso } from '@/utils/dates';
import { haptics } from '@/utils/haptics';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

const MONTHS = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const MIN_ISO = '1920-01-01';
const YEAR_ROW_HEIGHT = 52;

type DateFieldProps = {
  label?: string;
  placeholder?: string;
  // Календарна дата як YYYY-MM-DD
  value: string | null;
  onChange: (iso: string | null) => void;
  error?: string | null;
  minDate?: string;
  maxDate?: string;
  // Дозволяє стерти дату, якщо поле необов'язкове
  clearable?: boolean;
};

// Поле дати: показує дату словами, а по натисканню відкриває календар у стилі застосунку
export function DateField({
  label,
  placeholder = 'Обрати дату',
  value,
  onChange,
  error,
  minDate = MIN_ISO,
  maxDate,
  clearable = false,
}: DateFieldProps) {
  const { colors, radius, spacing } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityValue={{ text: value ? formatDayMonth(parseIsoDate(value), true) : '' }}
        onPress={() => {
          haptics.tap();
          setOpen(true);
        }}
        style={[
          styles.field,
          {
            gap: spacing.sm,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? colors.primary : open ? colors.secondary : colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md - 2,
          },
        ]}
      >
        <Text style={styles.flex} color={value ? 'text' : 'textMuted'}>
          {value ? formatDayMonth(parseIsoDate(value), true) : placeholder}
        </Text>
        <Icon icon={CalendarBlankIcon} size={22} color="primary" weight="duotone" />
      </Pressable>
      {error ? (
        <Text variant="caption" color="primary">
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        {open ? (
          <CalendarSheet
            title={label}
            initial={value}
            minDate={minDate}
            maxDate={maxDate ?? `${new Date().getFullYear() + 50}-12-31`}
            clearable={clearable && value !== null}
            onCancel={() => setOpen(false)}
            onDone={(iso) => {
              setOpen(false);
              onChange(iso);
            }}
          />
        ) : null}
      </Modal>
    </View>
  );
}

type CalendarSheetProps = {
  title?: string;
  initial: string | null;
  minDate: string;
  maxDate: string;
  clearable: boolean;
  onCancel: () => void;
  onDone: (iso: string | null) => void;
};

function CalendarSheet({
  title,
  initial,
  minDate,
  maxDate,
  clearable,
  onCancel,
  onDone,
}: CalendarSheetProps) {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const today = todayIso();
  const start = parseIsoDate(initial ?? (today > maxDate ? maxDate : today));

  const [selected, setSelected] = useState(initial);
  const [month, setMonth] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [pickingYear, setPickingYear] = useState(false);
  const yearsRef = useRef<ScrollViewInstance>(null);

  const minYear = Number(minDate.slice(0, 4));
  const maxYear = Number(maxDate.slice(0, 4));
  // Місяць як одне число, щоб легко порівнювати з межами
  const minKey = minYear * 12 + Number(minDate.slice(5, 7)) - 1;
  const maxKey = maxYear * 12 + Number(maxDate.slice(5, 7)) - 1;
  const currentKey = month.year * 12 + month.month;
  const canPrev = currentKey > minKey;
  const canNext = currentKey < maxKey;

  const shift = (delta: number) => {
    haptics.select();
    const next = new Date(month.year, month.month + delta, 1);
    setMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  // Тиждень починається з понеділка; порожні клітинки вирівнюють перше число
  const firstWeekday = (new Date(month.year, month.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  // Кожен тиждень — окремий рядок: з відсотковою шириною iOS округлює клітинки й переносить неділю
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <View style={styles.flex}>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable
          accessibilityLabel="Закрити календар"
          onPress={onCancel}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 6, 14, 0.6)' }]}
        />
      </Animated.View>
      <View style={styles.flex} pointerEvents="none" />
      <Animated.View
        entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
          gap: spacing.md,
        }}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {title ? (
          <Text variant="caption" color="textMuted" align="center">
            {title}
          </Text>
        ) : null}

        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={pickingYear ? 'Повернутися до днів' : 'Обрати рік'}
            onPress={() => {
              haptics.select();
              setPickingYear((v) => !v);
            }}
            hitSlop={8}
            style={[styles.row, styles.flex, { gap: spacing.xs }]}
          >
            <Text variant="subtitle">
              {MONTHS[month.month]} {month.year}
            </Text>
            <Icon
              icon={pickingYear ? CaretUpIcon : CaretDownIcon}
              size={18}
              color="primary"
              weight="bold"
            />
          </Pressable>
          {!pickingYear ? (
            <View style={[styles.row, { gap: spacing.sm }]}>
              <RoundButton
                label="Попередній місяць"
                icon={CaretLeftIcon}
                disabled={!canPrev}
                onPress={() => shift(-1)}
              />
              <RoundButton
                label="Наступний місяць"
                icon={CaretRightIcon}
                disabled={!canNext}
                onPress={() => shift(1)}
              />
            </View>
          ) : null}
        </View>

        {pickingYear ? (
          <ScrollView
            ref={yearsRef}
            style={{ height: YEAR_ROW_HEIGHT * 6 + spacing.xs }}
            showsVerticalScrollIndicator={false}
            onLayout={() => {
              const index = years.indexOf(month.year);
              const row = Math.max(0, Math.floor(index / 4) - 2);
              yearsRef.current?.scrollTo({ y: row * YEAR_ROW_HEIGHT, animated: false });
            }}
          >
            <View style={styles.wrap}>
              {years.map((year) => {
                const active = year === month.year;
                return (
                  <Pressable
                    key={year}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      haptics.select();
                      // Місяць лишаємо, але не виходимо за межі дозволеного
                      const key = Math.min(Math.max(year * 12 + month.month, minKey), maxKey);
                      setMonth({ year: Math.floor(key / 12), month: key % 12 });
                      setPickingYear(false);
                    }}
                    style={[styles.yearCell, { height: YEAR_ROW_HEIGHT }]}
                  >
                    <View
                      style={[
                        styles.yearPill,
                        {
                          borderRadius: radius.pill,
                          backgroundColor: active ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      <Text color={active ? 'onPrimary' : 'text'}>{year}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View>
            <View style={styles.row}>
              {WEEKDAYS.map((day, i) => (
                <Text
                  key={day}
                  variant="caption"
                  color={i >= 5 ? 'primary' : 'textMuted'}
                  align="center"
                  style={styles.weekday}
                >
                  {day}
                </Text>
              ))}
            </View>
            {weeks.map((week, w) => (
              <View key={w} style={styles.row}>
                {week.map((day, i) => {
                  if (day === null) return <View key={`empty-${i}`} style={styles.cell} />;
                  const iso = toIsoDate(new Date(month.year, month.month, day));
                  const isSelected = iso === selected;
                  const isToday = iso === today;
                  const disabled = iso < minDate || iso > maxDate;
                  return (
                    <Pressable
                      key={iso}
                      accessibilityRole="button"
                      accessibilityLabel={formatDayMonth(parseIsoDate(iso), true)}
                      accessibilityState={{ selected: isSelected, disabled }}
                      disabled={disabled}
                      onPress={() => {
                        haptics.select();
                        setSelected(iso);
                      }}
                      style={styles.cell}
                    >
                      <View
                        style={[
                          styles.day,
                          {
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                            borderColor: isToday && !isSelected ? colors.secondary : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          color={isSelected ? 'onPrimary' : isToday ? 'secondary' : 'text'}
                          style={{ opacity: disabled ? 0.3 : 1 }}
                        >
                          {day}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <View style={{ gap: spacing.sm }}>
          <Button title="Готово" disabled={!selected} onPress={() => onDone(selected)} />
          {clearable ? (
            <Button title="Прибрати дату" variant="ghost" onPress={() => onDone(null)} />
          ) : (
            <Button title="Скасувати" variant="ghost" onPress={onCancel} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

type RoundButtonProps = {
  label: string;
  icon: typeof CaretLeftIcon;
  disabled: boolean;
  onPress: () => void;
};

function RoundButton({ label, icon, disabled, onPress }: RoundButtonProps) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.round,
        {
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
    >
      <Icon icon={icon} size={18} color="primary" weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { flexDirection: 'row', alignItems: 'center' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2 },
  weekday: { flex: 1, paddingBottom: 8 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: {
    width: '86%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearCell: { width: '25%', alignItems: 'center', justifyContent: 'center' },
  yearPill: { paddingHorizontal: 14, paddingVertical: 6 },
  round: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
