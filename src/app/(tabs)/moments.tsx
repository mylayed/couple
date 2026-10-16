import { useRouter } from 'expo-router';
import { CheckIcon, ClockCounterClockwiseIcon, PlusIcon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { MOMENT_ICON_GLYPHS, momentGlyph } from '@/components/MomentIcon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  logMoment,
  MOMENT_PRESETS,
  saveMoment,
  useMomentSummaries,
  type MomentSummary,
} from '@/services/moments';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDaysAgo } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

function subtitle(m: MomentSummary): string {
  if (m.daysSince === null) return 'Ще не відмічали';
  const ago = `Востаннє ${formatDaysAgo(m.daysSince)}`;
  return m.overdue ? `${ago} · давно не було` : ago;
}

// Кнопка «Було сьогодні»: одна відмітка на день, повторне натискання нічого не додає
function LogTodayButton({ moment }: { moment: MomentSummary }) {
  const { colors, radius } = useTheme();
  const doneToday = moment.daysSince === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Відмітити «${moment.title}» сьогодні`}
      disabled={doneToday}
      onPress={() => {
        haptics.success();
        logMoment(moment.id);
      }}
      style={{
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: doneToday ? colors.success : colors.primary,
      }}
    >
      <Icon icon={CheckIcon} size={22} color="onPrimary" weight="bold" />
    </Pressable>
  );
}

export default function Moments() {
  const router = useRouter();
  const { spacing } = useTheme();
  const moments = useMomentSummaries();

  return (
    <Screen>
      <Text variant="title">Коли ми востаннє…</Text>

      {moments.length === 0 ? (
        <>
          <EmptyState
            icon={ClockCounterClockwiseIcon}
            title="Поки що тут порожньо"
            description="Додайте спільні справи: побачення, подорожі, вечері. Ми нагадаємо, коли давно не було."
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {MOMENT_PRESETS.map((p) => (
              <Chip
                key={p.title}
                label={p.title}
                icon={MOMENT_ICON_GLYPHS[p.icon]}
                onPress={() =>
                  saveMoment({ title: p.title, icon: p.icon, remindAfterDays: p.remindAfterDays })
                }
              />
            ))}
          </View>
        </>
      ) : (
        <Card style={{ gap: spacing.lg }}>
          {moments.map((m) => (
            <ListItem
              key={m.id}
              icon={momentGlyph(m.icon)}
              title={m.title}
              subtitle={subtitle(m)}
              accent={m.overdue}
              onPress={() => router.push(`/moment/${m.id}`)}
              right={<LogTodayButton moment={m} />}
            />
          ))}
        </Card>
      )}

      <Button
        title="Додати своє"
        icon={PlusIcon}
        variant="secondary"
        onPress={() => router.push('/moment/new')}
      />
    </Screen>
  );
}
