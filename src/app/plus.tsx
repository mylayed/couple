import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircleIcon,
  HourglassMediumIcon,
  ImagesIcon,
  SparkleIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  FREE_PHOTOS,
  buyPlan,
  isLifetime,
  loadPlans,
  logPaywallOpen,
  manageSubscription,
  purchasesAvailable,
  refreshPlusPayments,
  restorePurchases,
  useActivePayment,
  usePlus,
  type PaywallSource,
  type Plan,
  type PlanKind,
} from '@/services/plus';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

// Paywall. Відкривається лише тоді, коли користувач сам натиснув на платну функцію
// (або «Що дає Plus» у налаштуваннях). Платить один — Plus отримують обидва.

const SOURCES: PaywallSource[] = ['ai', 'capsule', 'photos', 'settings', 'push'];

// Чому paywall з'явився: перший рядок під заголовком
const REASONS: Partial<Record<PaywallSource, string>> = {
  ai: 'Запити ШІ на сьогодні закінчились. З Plus — без обмежень.',
  capsule: 'Капсула часу — частина Plus. Твій лист нікуди не дінеться, поки ти тут.',
  photos: `Безкоштовно — ${FREE_PHOTOS} спогадів із фото. З Plus — скільки завгодно.`,
};

const BENEFITS: { icon: PhosphorIcon; title: string; text: string }[] = [
  {
    icon: SparkleIcon,
    title: 'ШІ без обмежень',
    text: 'Ідеї побачень, помічник для листівок, історія року',
  },
  {
    icon: ImagesIcon,
    title: 'Фото без меж',
    text: `Безкоштовно — ${FREE_PHOTOS} спогадів із фото`,
  },
  {
    icon: HourglassMediumIcon,
    title: 'Капсула часу',
    text: 'Листи, які відкриються через рік чи п’ять',
  },
];

const PLAN_TITLES: Record<PlanKind, string> = {
  annual: 'Рік',
  monthly: 'Місяць',
  lifetime: 'Назавжди',
};

function PlanOption({
  plan,
  selected,
  onPress,
}: {
  plan: Plan;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const details = [
    plan.perMonth ? `${plan.perMonth} на місяць` : null,
    plan.kind === 'lifetime' ? 'Одна оплата' : null,
    plan.trial,
  ].filter(Boolean);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.plan,
        {
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.md,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.flex}>
        <Text variant="subtitle">{PLAN_TITLES[plan.kind]}</Text>
        {details.length > 0 ? (
          <Text variant="caption" color={plan.trial ? 'primary' : 'textMuted'}>
            {details.join(' · ')}
          </Text>
        ) : null}
      </View>
      <Text variant="subtitle">{plan.price}</Text>
    </Pressable>
  );
}

// Plus уже є: хто платить і до коли
function ActiveCard() {
  const { spacing } = useTheme();
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const until = useCouple((s) => s.couple?.plus_until ?? null);
  const payment = useActivePayment();
  const mine = payment?.user_id === userId;

  const period = !until
    ? ''
    : isLifetime(until)
      ? 'Назавжди.'
      : payment?.will_renew
        ? `Продовжиться ${formatDayMonth(new Date(until), true)}.`
        : `Діє до ${formatDayMonth(new Date(until), true)}.`;

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <Icon icon={CheckCircleIcon} size={28} color="success" weight="fill" />
        <Text variant="subtitle">Plus у вас обох</Text>
      </View>
      <Text color="textMuted">
        {[payment ? (mine ? 'Оплачуєш ти.' : `Оплачує ${partnerName}.`) : null, period]
          .filter(Boolean)
          .join(' ')}
      </Text>
      {mine && payment && !isLifetime(payment.expires_at) && purchasesAvailable ? (
        <Button title="Керувати підпискою" variant="secondary" onPress={manageSubscription} />
      ) : null}
    </Card>
  );
}

function Plans({ source }: { source: PaywallSource }) {
  const router = useRouter();
  const { spacing } = useTheme();
  const [plans, setPlans] = useState<Plan[] | null | undefined>(undefined);
  const [selected, setSelected] = useState<PlanKind>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = () =>
    loadPlans().then((result) => {
      setPlans(result);
      if (result?.length && !result.some((p) => p.kind === 'annual')) setSelected(result[0].kind);
    });

  useEffect(() => {
    void fetchPlans();
  }, []);

  const retry = () => {
    setPlans(undefined);
    void fetchPlans();
  };

  const run = async (action: () => Promise<{ error: string | null; cancelled?: boolean }>) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.cancelled) return;
    if (result.error) return setError(result.error);
    haptics.success();
    // Після покупки з платної функції повертаємось до неї
    if (source !== 'settings' && router.canGoBack()) router.back();
  };

  if (!purchasesAvailable) {
    return (
      <Card>
        <Text color="textMuted">Оформити Plus можна в застосунку Dotyk на телефоні.</Text>
      </Card>
    );
  }

  if (plans === undefined) {
    return <ActivityIndicator style={{ padding: spacing.lg }} />;
  }

  if (!plans?.length) {
    return (
      <Card style={{ gap: spacing.md }}>
        <Text color="textMuted">
          Не вдалося завантажити ціни. Перевір інтернет і спробуй ще раз.
        </Text>
        <Button title="Спробувати ще раз" variant="secondary" onPress={retry} />
      </Card>
    );
  }

  const plan = plans.find((p) => p.kind === selected) ?? plans[0];
  const cta = busy
    ? 'Зачекай…'
    : plan.trial
      ? `Спробувати: ${plan.trial}`
      : plan.kind === 'lifetime'
        ? `Купити за ${plan.price}`
        : `Оформити за ${plan.price}`;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        {plans.map((p) => (
          <PlanOption
            key={p.kind}
            plan={p}
            selected={p.kind === plan.kind}
            onPress={() => setSelected(p.kind)}
          />
        ))}
      </View>
      {error ? (
        <Text variant="caption" color="primary">
          {error}
        </Text>
      ) : null}
      <Button title={cta} disabled={busy} onPress={() => run(() => buyPlan(plan))} />
      <Text variant="caption" color="textMuted" align="center">
        {plan.kind === 'lifetime'
          ? 'Одна оплата, без підписки.'
          : plan.trial
            ? `Після пробного періоду — ${plan.price} за ${plan.kind === 'annual' ? 'рік' : 'місяць'}. ` +
              'Скасувати можна будь-коли в налаштуваннях магазину, до кінця пробного періоду — без оплати.'
            : 'Підписка продовжується автоматично. Скасувати можна будь-коли в налаштуваннях магазину.'}
      </Text>
      <Button
        title="Відновити покупки"
        variant="ghost"
        disabled={busy}
        onPress={() => run(restorePurchases)}
      />
    </View>
  );
}

export default function PlusScreen() {
  const { colors, radius, spacing } = useTheme();
  const params = useLocalSearchParams<{ from?: string }>();
  const source = SOURCES.find((s) => s === params.from) ?? 'settings';
  const plus = usePlus();

  useEffect(() => {
    void refreshPlusPayments();
    if (!plus) void logPaywallOpen(source);
    // Подію пишемо раз на відкриття екрана
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reason = plus ? null : REASONS[source];

  return (
    <Screen edges={['bottom']}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm }}
      >
        <Text variant="title" color="onPrimary">
          Dotyk Plus
        </Text>
        <Text color="onPrimary">Платить один — Plus у вас обох.</Text>
      </LinearGradient>

      {reason ? <Text variant="subtitle">{reason}</Text> : null}

      <Card style={{ gap: spacing.md }}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={[styles.row, { gap: spacing.md }]}>
            <Icon icon={b.icon} size={28} color="primary" weight="duotone" />
            <View style={styles.flex}>
              <Text variant="subtitle">{b.title}</Text>
              <Text variant="caption" color="textMuted">
                {b.text}
              </Text>
            </View>
          </View>
        ))}
        <Text variant="caption" color="textMuted">
          Згодом: експорт спогадів у PDF, нові набори питань та ігор, теми, іконки й віджети, режим
          відстані.
        </Text>
      </Card>

      {plus ? <ActiveCard /> : <Plans source={source} />}

      <Text variant="caption" color="textMuted" align="center">
        Усе основне в Dotyk безкоштовне назавжди. Коли Plus закінчиться, ваші фото, капсули й
        спогади нікуди не зникнуть: обмеження стосуються лише нового.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  flex: { flex: 1 },
});
