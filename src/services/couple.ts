import type { RealtimeChannel } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { useAuth } from '@/store/auth';
import { resetCoupleState, useCouple, type Couple, type Partner } from '@/store/couple';
import { resumeSync, setSyncCouple } from './sync';
import { supabase } from './supabase';

// Пара на сервері: код запрошення, приєднання, дата початку, роз'єднання.
// Усі дії повертають текст помилки українською або null, якщо все вдалося.

type Result = { error: string | null };

const NETWORK_ERROR = 'Немає з’єднання. Перевір інтернет і спробуй ще раз.';
const GENERIC_ERROR = 'Щось пішло не так. Спробуй ще раз.';

// Коди помилок із RPC join_couple
const JOIN_MESSAGES: Record<string, string> = {
  own_code: 'Це твій власний код. Введи код, який надіслав партнер.',
  already_paired: 'Ти вже в парі. Спершу роз’єднай її в налаштуваннях.',
  too_many_attempts: 'Забагато невдалих спроб. Зачекай годину і спробуй ще раз.',
};

function toMessage(error: { message?: string } | null, status?: number): string {
  if (status === 0 || (error?.message && /network|fetch/i.test(error.message)))
    return NETWORK_ERROR;
  return GENERIC_ERROR;
}

type MemberRow = {
  user_id: string;
  joined_at: string;
  couple: Couple;
  profile: Partner;
};

// Підтягує пару й партнера з сервера. Без мережі лишає кеш як є.
export async function refreshCouple(): Promise<Result> {
  const userId = useAuth.getState().session?.user.id;
  if (!userId) return { error: null };

  const { data, error, status } = await supabase
    .from('couple_members')
    .select(
      'user_id, joined_at, couple:couples(id, invite_code, started_on, plus_until, created_at), profile:profiles(id, name, avatar_url, birth_date)',
    )
    .returns<MemberRow[]>();

  if (error || !data) return { error: toMessage(error, status) };
  // Користувач міг вийти, поки йшов запит
  if (useAuth.getState().session?.user.id !== userId) return { error: null };

  const partnerRow = data.find((m) => m.user_id !== userId) ?? null;
  useCouple.setState({
    userId,
    loaded: true,
    couple: data[0]?.couple ?? null,
    partner: partnerRow?.profile ?? null,
    pairedAt: partnerRow ? data.reduce((a, m) => (m.joined_at > a ? m.joined_at : a), '') : null,
  });
  return { error: null };
}

// Код запрошення; пара з одним учасником створюється на сервері під час першого запиту
export async function requestInviteCode(): Promise<Result> {
  const { error, status } = await supabase.rpc('get_invite_code');
  if (error) return { error: toMessage(error, status) };
  return refreshCouple();
}

export async function joinCouple(code: string): Promise<Result> {
  const { data, error, status } = await supabase.rpc('join_couple', { code });
  if (error) return { error: JOIN_MESSAGES[error.message] ?? toMessage(error, status) };
  if (!data) return { error: 'Цей код не підходить. Перевір його і спробуй ще раз.' };
  // Партнер побачить приєднання через Realtime, а ми одразу оновлюємо свій стан
  return refreshCouple();
}

export async function setStartDate(startedOn: string | null): Promise<Result> {
  const couple = useCouple.getState().couple;
  if (!couple) return { error: GENERIC_ERROR };
  const { error, status } = await supabase
    .from('couples')
    .update({ started_on: startedOn })
    .eq('id', couple.id);
  if (error) return { error: toMessage(error, status) };
  useCouple.setState({ couple: { ...couple, started_on: startedOn } });
  return { error: null };
}

// Роз'єднання видаляє пару і всі спільні дані для обох
export async function leaveCouple(): Promise<Result> {
  const { error, status } = await supabase.rpc('leave_couple');
  if (error) return { error: toMessage(error, status) };
  // Партнерові видалення через Realtime не приходить, тож повідомляємо його напряму
  await channel?.send({ type: 'broadcast', event: 'unpaired', payload: {} });
  resetLocalCouple();
  return refreshCouple();
}

// ─── Підписки ────────────────────────────────────────────────────────────────

let channel: RealtimeChannel | null = null;
let channelKey: string | null = null;

function subscribe(couple: Couple | null, partner: Partner | null): void {
  const key = couple ? `${couple.id}:${partner?.id ?? ''}` : null;
  if (key === channelKey) return;
  if (channel) void supabase.removeChannel(channel);
  channel = null;
  channelKey = key;
  if (!couple) return;

  const refresh = () => void refreshCouple();
  let next = supabase
    .channel(`couple:${couple.id}`)
    // Приєднання партнера: екран запрошення одразу перейде до пари
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'couple_members',
        filter: `couple_id=eq.${couple.id}`,
      },
      refresh,
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${couple.id}` },
      refresh,
    )
    .on('broadcast', { event: 'unpaired' }, refresh);
  if (partner) {
    next = next.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${partner.id}` },
      refresh,
    );
  }
  channel = next.subscribe((status) => {
    // Після перепідключення могли пропустити події
    if (status === 'SUBSCRIBED') refresh();
  });
}

function resetLocalCouple(): void {
  resetCoupleState();
  setSyncCouple(null);
}

let started = false;

// Викликається один раз у кореневому layout, поруч зі startAuthListener
export function startCoupleListener(): void {
  if (started) return;
  started = true;

  const onUser = (userId: string | null) => {
    // Кеш іншого користувача на цьому телефоні не показуємо
    if (useCouple.getState().userId !== userId) {
      resetLocalCouple();
      useCouple.setState({ userId });
    }
    if (userId) void refreshCouple();
  };

  // До відновлення сесії зі сховища користувач ще невідомий, і кеш чіпати не можна
  let currentUser: string | null | undefined;
  const onAuth = (s: ReturnType<typeof useAuth.getState>) => {
    if (!s.initialized) return;
    const userId = s.session?.user.id ?? null;
    if (userId === currentUser) return;
    currentUser = userId;
    onUser(userId);
  };
  onAuth(useAuth.getState());
  useAuth.subscribe(onAuth);

  // Синхронізуємо спільні дані лише для з'єднаної пари
  const onCouple = ({ couple, partner }: ReturnType<typeof useCouple.getState>) => {
    subscribe(couple, partner);
    setSyncCouple(couple && partner ? couple.id : null);
  };
  onCouple(useCouple.getState());
  useCouple.subscribe(onCouple);

  AppState.addEventListener('change', (state) => {
    if (state !== 'active' || !useAuth.getState().session) return;
    void refreshCouple();
    resumeSync();
  });
}

// Вихід з акаунта: прибираємо пару й кеш спільних даних цього телефона
export function clearCoupleOnSignOut(): void {
  resetLocalCouple();
}
