import { Linking, Platform } from 'react-native';
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import { create } from 'zustand';

import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { pluralUk } from '@/utils/dates';
import { refreshAiQuota } from './ai';
import { refreshCouple } from './couple';
import { supabase } from './supabase';

// Підписка Plus через RevenueCat. Платить один — Plus отримують обидва.
// Статус пари (couples.plus_until) пише лише сервер: Edge Function `revenuecat` після вебхука
// або після покупки на цьому телефоні. Тут — покупка, відновлення і читання статусу.
// App user id у RevenueCat = id користувача в Supabase.

// Ідентифікатор entitlement у RevenueCat (той самий у supabase/functions/revenuecat)
const ENTITLEMENT = 'plus';

// Безкоштовно стільки спогадів із фото; сервер перевіряє те саме з невеликим запасом
// (міграція 20261023120000_plus.sql)
export const FREE_PHOTOS = 100;

// Звідки відкрили paywall: для воронки й щоб пояснити, чому він з'явився
export type PaywallSource = 'ai' | 'capsule' | 'photos' | 'settings' | 'push';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

// У вебверсії і без ключа покупки недоступні; Plus пари все одно діє
export const purchasesAvailable = Boolean(API_KEY);

// ─── Статус ──────────────────────────────────────────────────────────────────

// Покупка «назавжди» на сервері має дату 9999-12-31
const LIFETIME_YEAR = 9000;

export function isPlusActive(plusUntil: string | null | undefined): boolean {
  return !!plusUntil && Date.parse(plusUntil) > Date.now();
}

export const isLifetime = (until: string) => new Date(until).getFullYear() >= LIFETIME_YEAR;

export function usePlus(): boolean {
  return useCouple((s) => isPlusActive(s.couple?.plus_until));
}

// Хто з пари платить. Рядки бачать обоє (RLS), змінює лише сервер
export type PlusPayment = {
  user_id: string;
  expires_at: string;
  store: string | null;
  will_renew: boolean;
};

export const usePlusPayments = create<{ items: PlusPayment[] }>()(() => ({ items: [] }));

export async function refreshPlusPayments(): Promise<void> {
  const { data, error } = await supabase
    .from('plus_entitlements')
    .select('user_id, expires_at, store, will_renew')
    .returns<PlusPayment[]>();
  if (!error && data) usePlusPayments.setState({ items: data });
}

// Активна оплата, яка дає Plus парі зараз (найпізніша)
export function useActivePayment(): PlusPayment | null {
  const items = usePlusPayments((s) => s.items);
  const userId = useCouple((s) => s.userId);
  const partnerId = useCouple((s) => s.partner?.id);
  return (
    items
      .filter(
        (p) => (p.user_id === userId || p.user_id === partnerId) && isPlusActive(p.expires_at),
      )
      .sort((a, b) => b.expires_at.localeCompare(a.expires_at))[0] ?? null
  );
}

// Просить сервер перечитати стан у RevenueCat, щоб Plus з'явився одразу
export async function syncPlus(): Promise<void> {
  try {
    await supabase.functions.invoke('revenuecat', { body: {} });
  } catch {
    // Вебхук однаково дійде; статус оновиться через Realtime
  }
  // Ліміт ШІ теж залежить від Plus
  await Promise.all([refreshCouple(), refreshPlusPayments(), refreshAiQuota()]);
}

export async function logPaywallOpen(source: PaywallSource): Promise<void> {
  await supabase.from('paywall_events').insert({ source });
}

// ─── Плани ───────────────────────────────────────────────────────────────────

export type PlanKind = 'annual' | 'monthly' | 'lifetime';

export type Plan = {
  kind: PlanKind;
  pkg: PurchasesPackage;
  price: string;
  // Для річного: скільки виходить на місяць
  perMonth: string | null;
  // «7 днів безкоштовно», якщо пробний період доступний цьому користувачу
  trial: string | null;
};

const KINDS: Partial<Record<PACKAGE_TYPE, PlanKind>> = {
  [PACKAGE_TYPE.ANNUAL]: 'annual',
  [PACKAGE_TYPE.MONTHLY]: 'monthly',
  [PACKAGE_TYPE.LIFETIME]: 'lifetime',
};

const ORDER: PlanKind[] = ['annual', 'monthly', 'lifetime'];

function trialText(unit: string, count: number): string | null {
  const days = unit === 'DAY' ? count : unit === 'WEEK' ? count * 7 : null;
  if (days) return `${days} ${pluralUk(days, ['день', 'дні', 'днів'])} безкоштовно`;
  if (unit === 'MONTH')
    return `${count} ${pluralUk(count, ['місяць', 'місяці', 'місяців'])} безкоштовно`;
  return null;
}

// Android віддає лише ті пропозиції, на які користувач має право.
// На iOS пробний період — це intro price з нульовою ціною, право перевіряємо окремо.
async function trialFor(pkg: PurchasesPackage): Promise<string | null> {
  const product = pkg.product;
  if (Platform.OS === 'android') {
    const free = product.defaultOption?.freePhase?.billingPeriod;
    return free ? trialText(free.unit, free.value) : null;
  }
  const intro = product.introPrice;
  if (!intro || intro.price !== 0) return null;
  try {
    const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility([
      product.identifier,
    ]);
    const status = eligibility[product.identifier]?.status;
    if (status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE) return null;
  } catch {
    // Невідомо — показуємо, магазин сам не дасть пробний період повторно
  }
  return trialText(intro.periodUnit, intro.periodNumberOfUnits * intro.cycles);
}

export async function loadPlans(): Promise<Plan[] | null> {
  if (!purchasesAvailable) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    const plans: Plan[] = [];
    for (const pkg of packages) {
      const kind = KINDS[pkg.packageType];
      if (!kind || plans.some((p) => p.kind === kind)) continue;
      plans.push({
        kind,
        pkg,
        price: pkg.product.priceString,
        perMonth: kind === 'annual' ? pkg.product.pricePerMonthString : null,
        trial: kind === 'lifetime' ? null : await trialFor(pkg),
      });
    }
    return plans.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  } catch {
    return null;
  }
}

// ─── Покупка ─────────────────────────────────────────────────────────────────

type Result = { error: string | null; cancelled?: boolean };

const NETWORK_ERROR = 'Немає з’єднання. Перевір інтернет і спробуй ще раз.';

function purchaseError(e: unknown): Result {
  const code = (e as PurchasesError | null)?.code;
  switch (code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return { error: null, cancelled: true };
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return {
        error: 'Оплата чекає підтвердження в магазині. Plus з’явиться, щойно її буде проведено.',
      };
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return { error: NETWORK_ERROR };
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return { error: 'Покупки на цьому пристрої заборонені в налаштуваннях.' };
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return { error: 'Магазин зараз не відповідає. Спробуй трохи пізніше.' };
    default:
      return { error: 'Не вдалося оформити Plus. Спробуй ще раз.' };
  }
}

const hasPlus = (info: CustomerInfo) => info.entitlements.active[ENTITLEMENT] !== undefined;

export async function buyPlan(plan: Plan): Promise<Result> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    if (hasPlus(customerInfo)) await syncPlus();
    return { error: null };
  } catch (e) {
    return purchaseError(e);
  }
}

export async function restorePurchases(): Promise<Result> {
  if (!purchasesAvailable) return { error: 'Відновлення доступне в застосунку на телефоні.' };
  try {
    const info = await Purchases.restorePurchases();
    await syncPlus();
    if (!hasPlus(info)) return { error: 'Активних покупок Plus на цьому акаунті магазину немає.' };
    return { error: null };
  } catch (e) {
    return purchaseError(e);
  }
}

// Підписку скасовують і змінюють у магазині, не в застосунку
export async function manageSubscription(): Promise<void> {
  try {
    await Purchases.showManageSubscriptions();
  } catch {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';
    await Linking.openURL(url);
  }
}

// ─── Запуск ──────────────────────────────────────────────────────────────────

let started = false;

// Викликається один раз у кореневому layout, поруч зі startCoupleListener
export function startPurchases(): void {
  if (started || !API_KEY) return;
  started = true;
  Purchases.configure({ apiKey: API_KEY });

  // Покупки прив'язані до акаунта Dotyk, а не до телефона
  let currentUser: string | null | undefined;
  const onAuth = (s: ReturnType<typeof useAuth.getState>) => {
    if (!s.initialized) return;
    const userId = s.session?.user.id ?? null;
    if (userId === currentUser) return;
    const previous = currentUser;
    currentUser = userId;
    if (userId) {
      Purchases.logIn(userId).catch(() => {});
      void refreshPlusPayments();
    } else {
      usePlusPayments.setState({ items: [] });
      // Анонімного користувача розлогінити не можна, і це не помилка
      if (previous) Purchases.logOut().catch(() => {});
    }
  };
  onAuth(useAuth.getState());
  useAuth.subscribe(onAuth);

  // Продовження, скасування чи покупка на іншому телефоні з тим самим акаунтом магазину:
  // якщо магазин каже інше, ніж сервер, просимо сервер перечитати стан
  Purchases.addCustomerInfoUpdateListener((info) => {
    if (!currentUser) return;
    const payment = usePlusPayments.getState().items.find((p) => p.user_id === currentUser);
    if (hasPlus(info) !== isPlusActive(payment?.expires_at)) void syncPlus();
  });
}
