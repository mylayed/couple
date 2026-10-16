import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { useAuth } from '@/store/auth';
import { selectIsPaired, useCouple } from '@/store/couple';
import { useNotificationPrefs } from '@/store/notifications';
import { addDays, formatOrdinal, parseIsoDate, todayIso, toIsoDate } from '@/utils/dates';
import { buildCalendar } from './calendar';
import { summarize } from './moments';
import { questionForDate } from './questions';
import { isExpoGo } from './storage';
import { supabase } from './supabase';
import { useSync, type DailyAnswer, type ImportantDate, type Moment, type MomentLog } from './sync';

// Нагадування плануються локально на кожному телефоні й перераховуються після кожної зміни
// даних. Про дії партнера приходить push із сервера (міграція 20261017120000_notifications.sql).

const supported = Platform.OS !== 'web';
const CHANNEL_ID = 'reminders';
const DATE_HOUR = 10;
const MOMENT_HOUR = 19;
const QUESTION_DAYS_AHEAD = 7;
const DATES_DAYS_AHEAD = 60;
// iOS тримає не більше 64 запланованих сповіщень на застосунок
const MAX_SCHEDULED = 50;

type Reminder = { date: Date; body: string; url: string };

function at(day: Date, hour: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
}

function rowsOf<T>(table: Record<string, T & { deleted_at: string | null }>): T[] {
  return Object.values(table).filter((row) => !row.deleted_at);
}

function plannedReminders(now = new Date()): Reminder[] {
  const prefs = useNotificationPrefs.getState();
  const { rows } = useSync.getState();
  const { couple, partner } = useCouple.getState();
  const { profile, session } = useAuth.getState();
  const today = parseIsoDate(todayIso());
  const reminders: Reminder[] = [];

  if (prefs.questionReminder) {
    const answers = rowsOf<DailyAnswer>(rows.daily_answers);
    for (let i = 0; i < QUESTION_DAYS_AHEAD; i++) {
      const day = addDays(today, i);
      const iso = toIsoDate(day);
      if (answers.some((a) => a.question_date === iso && a.user_id === session?.user.id)) continue;
      reminders.push({
        date: at(day, prefs.questionHour),
        body: `Питання дня: ${questionForDate(iso).text}`,
        url: '/question',
      });
    }
  }

  if (prefs.momentReminders) {
    const moments = summarize(
      rowsOf<Moment>(rows.moments),
      rowsOf<MomentLog>(rows.moment_logs),
      todayIso(),
    );
    for (const m of moments) {
      if (!m.lastOn || m.remind_after_days === null) continue;
      reminders.push({
        date: at(addDays(parseIsoDate(m.lastOn), m.remind_after_days), MOMENT_HOUR),
        body: `Ви давно не відмічали «${m.title}». Може, час повторити? 💞`,
        url: `/moment/${m.id}`,
      });
    }
  }

  if (prefs.dateReminders) {
    const calendar = buildCalendar({
      rows: rowsOf<ImportantDate>(rows.important_dates),
      couple,
      profile,
      partner,
    });
    for (const entry of calendar) {
      if (!entry.next || entry.daysLeft === null || entry.daysLeft > DATES_DAYS_AHEAD) continue;
      const years = !entry.years
        ? ''
        : entry.kind === 'birthday'
          ? ` (${entry.years})`
          : ` (${formatOrdinal(entry.years)} річниця)`;
      reminders.push(
        {
          date: at(addDays(entry.next, -1), DATE_HOUR),
          body: `Завтра: ${entry.title}${years}`,
          url: '/dates',
        },
        {
          date: at(entry.next, DATE_HOUR),
          body: `Сьогодні: ${entry.title}${years} 🎉`,
          url: '/dates',
        },
      );
    }
  }

  return reminders
    .filter((r) => r.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED);
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Нагадування',
    importance: AndroidImportance.DEFAULT,
  });
}

async function hasPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return status.granted || status.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}

// Питає дозвіл, якщо ще можна. Повертає, чи сповіщення дозволені.
export async function requestNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  await ensureChannel();
  if (await hasPermission()) return true;
  const current = await Notifications.getPermissionsAsync();
  if (!current.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

let rescheduling: Promise<void> | null = null;
let rescheduleAgain = false;

async function rescheduleNow(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const { enabled } = useNotificationPrefs.getState();
  const paired = selectIsPaired(useCouple.getState());
  if (!enabled || !paired || !(await hasPermission())) return;
  for (const reminder of plannedReminders()) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Dotyk', body: reminder.body, data: { url: reminder.url } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: CHANNEL_ID,
      },
    });
  }
}

// Перепланування не перетинаються: якщо зміни прийшли під час роботи, проходимо ще раз
export async function rescheduleReminders(): Promise<void> {
  if (!supported) return;
  if (rescheduling) {
    rescheduleAgain = true;
    return rescheduling;
  }
  rescheduling = (async () => {
    do {
      rescheduleAgain = false;
      try {
        await rescheduleNow();
      } catch (e) {
        console.warn('notifications: не вдалося запланувати', e);
      }
    } while (rescheduleAgain);
  })();
  await rescheduling;
  rescheduling = null;
}

// ─── Push ────────────────────────────────────────────────────────────────────

let registeredFor: string | null = null;

async function syncPushToken(): Promise<void> {
  const prefs = useNotificationPrefs.getState();
  const userId = useAuth.getState().session?.user.id ?? null;
  // В Expo Go на Android віддалених push немає з SDK 53
  const canPush = supported && !(isExpoGo && Platform.OS === 'android');
  const wanted = canPush && prefs.enabled && prefs.partnerActivity && userId !== null;

  if (!wanted) {
    if (prefs.pushToken) await unregisterPushToken();
    return;
  }
  if (registeredFor === userId && prefs.pushToken) return;
  if (!(await hasPermission())) return;

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase.rpc('register_push_token', {
      p_token: token,
      p_platform: Platform.OS,
    });
    if (error) throw error;
    registeredFor = userId;
    useNotificationPrefs.setState({ pushToken: token });
  } catch (e) {
    // Без мережі спробуємо наступного разу, коли застосунок повернеться на екран
    console.warn('notifications: push-токен не зареєстровано', e);
  }
}

// Викликається перед виходом з акаунта, поки сесія ще діє
export async function unregisterPushToken(): Promise<void> {
  const token = useNotificationPrefs.getState().pushToken;
  if (!token) return;
  try {
    await supabase.rpc('unregister_push_token', { p_token: token });
  } catch {
    // Сервер однаково віддасть токен новому власнику, коли той увійде
  }
  registeredFor = null;
  useNotificationPrefs.setState({ pushToken: null });
}

// ─── Життєвий цикл ───────────────────────────────────────────────────────────

let started = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleUpdate(): void {
  if (timer) clearTimeout(timer);
  // Синхронізація часто приносить кілька змін поспіль, тож чекаємо, поки вони вляжуться
  timer = setTimeout(() => {
    timer = null;
    void rescheduleReminders();
    void syncPushToken();
  }, 1500);
}

// Викликається один раз у кореневому layout
export function startNotifications(): void {
  if (started || !supported) return;
  started = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  void ensureChannel();

  useSync.subscribe((s, prev) => {
    if (s.rows !== prev.rows) scheduleUpdate();
  });
  useCouple.subscribe(scheduleUpdate);
  useAuth.subscribe((s, prev) => {
    if (s.profile !== prev.profile || s.session?.user.id !== prev.session?.user.id) {
      scheduleUpdate();
    }
  });
  useNotificationPrefs.subscribe((s, prev) => {
    if (s.pushToken === prev.pushToken) scheduleUpdate();
  });
  // Новий день: питання дня й відлік до дат змінились
  AppState.addEventListener('change', (state) => {
    if (state === 'active') scheduleUpdate();
  });
  scheduleUpdate();
}

function openUrl(response: Notifications.NotificationResponse | null): void {
  const url = response?.notification.request.content.data?.url;
  if (typeof url === 'string' && url.startsWith('/')) router.push(url as Href);
}

// Відкриває екран зі сповіщення. Підключається у вкладках, тобто вже після з'єднання пари.
export function useNotificationNavigation(): void {
  useEffect(() => {
    if (!supported) return;
    // Застосунок запустили натисканням на сповіщення
    openUrl(Notifications.getLastNotificationResponse());
    Notifications.clearLastNotificationResponse();
    const subscription = Notifications.addNotificationResponseReceivedListener(openUrl);
    return () => subscription.remove();
  }, []);
}
