import { useRouter } from 'expo-router';
import {
  BellIcon,
  CalendarHeartIcon,
  ChatCircleDotsIcon,
  EnvelopeSimpleIcon,
  GameControllerIcon,
  PencilSimpleLineIcon,
} from 'phosphor-react-native';
import { Platform, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Counter } from '@/components/Counter';
import { Icon } from '@/components/Icon';
import { ListItem } from '@/components/ListItem';
import { momentGlyph } from '@/components/MomentIcon';
import { Screen } from '@/components/Screen';
import { TouchButton } from '@/components/TouchButton';
import { Text } from '@/components/Text';
import { TreeCard } from '@/components/TreeCard';
import { useCalendar } from '@/services/calendar';
import { GAMES, useRounds } from '@/services/games';
import { useMomentSummaries } from '@/services/moments';
import { moodMeta, useMyMood, usePartnerMood } from '@/services/moods';
import { useNotes } from '@/services/notes';
import { requestNotificationPermission } from '@/services/notifications';
import { usePoints } from '@/services/points';
import { useTodayQuestion } from '@/services/questions';
import { sendTouch, TOUCH_PHRASES, TOUCHES, useLastTouches } from '@/services/touches';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useNotificationPrefs } from '@/store/notifications';
import { useTheme } from '@/theme/ThemeProvider';
import {
  daysBetween,
  durationParts,
  formatDayMonth,
  formatDaysAgo,
  formatDaysLeft,
  formatDuration,
  formatOrdinal,
  formatTimeAgo,
  nextOccurrence,
  parseIsoDate,
  pluralUk,
} from '@/utils/dates';

function TogetherCounter() {
  const router = useRouter();
  const { spacing } = useTheme();
  const startedOn = useCouple((s) => s.couple?.started_on ?? null);
  const pairedAt = useCouple((s) => s.pairedAt);
  // Поки дату початку не задано, рахуємо від з'єднання в Dotyk
  const since = startedOn ?? pairedAt;
  const from = since ? parseIsoDate(since) : new Date();
  const days = daysBetween(from);

  let caption = formatDuration(durationParts(from));
  if (startedOn) {
    const next = nextOccurrence(startedOn);
    const left = daysBetween(new Date(), next);
    const years = next.getFullYear() - from.getFullYear();
    if (years > 0) caption += ` · ${formatOrdinal(years)} річниця ${formatDaysLeft(left)}`;
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <Counter
        value={days}
        label={`${pluralUk(days, ['день', 'дні', 'днів'])} разом`}
        caption={caption}
      />
      {!startedOn ? (
        <Button
          title="Вказати дату початку стосунків"
          variant="ghost"
          onPress={() => router.push('/settings')}
        />
      ) : null}
    </View>
  );
}

function TouchCard() {
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const { fromPartner, fromMe } = useLastTouches();

  const status = fromPartner
    ? `${partnerName} ${TOUCH_PHRASES[fromPartner.kind]} · ${formatTimeAgo(fromPartner.created_at)}`
    : fromMe
      ? `Твій дотик надіслано ${formatTimeAgo(fromMe.created_at)}`
      : 'Один дотик — і партнер знає, що ти поруч';

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Дотик</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {TOUCHES.map((t) => (
          <TouchButton
            key={t.kind}
            icon={t.icon}
            label={t.label}
            onPress={() => sendTouch(t.kind)}
          />
        ))}
      </View>
      <Text variant="caption" color={fromPartner ? 'primary' : 'textMuted'} align="center">
        {status}
      </Text>
    </Card>
  );
}

function MoodCard() {
  const router = useRouter();
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const mine = useMyMood();
  const partner = usePartnerMood();

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Настрій дня</Text>
      <ListItem
        icon={mine ? moodMeta(mine.mood).icon : undefined}
        title={
          mine ? `Ти: ${moodMeta(mine.mood).label.toLowerCase()}` : 'Ти ще не ділишся настроєм'
        }
        subtitle={
          mine
            ? [mine.note, mine.visibility === 'private' ? 'бачиш лише ти' : null]
                .filter(Boolean)
                .join(' · ') || undefined
            : undefined
        }
        onPress={() => router.push('/mood')}
      />
      {partner ? (
        <ListItem
          icon={moodMeta(partner.mood).icon}
          title={`${partnerName}: ${moodMeta(partner.mood).label.toLowerCase()}`}
          subtitle={partner.note ?? undefined}
        />
      ) : (
        <Text variant="caption" color="textMuted">
          {partnerName} ще не ділиться настроєм сьогодні
        </Text>
      )}
    </Card>
  );
}

function NotesCard() {
  const router = useRouter();
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const { unopened } = useNotes();
  const latest = unopened[0];

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={EnvelopeSimpleIcon} color="primary" weight="duotone" />
        <Text variant="subtitle">Листівки</Text>
      </View>
      {latest ? (
        <>
          <Text color="primary">
            {unopened.length > 1
              ? `${partnerName} надсилає тобі листівки: ${unopened.length}`
              : `${partnerName} надсилає тобі листівку 💌`}
          </Text>
          <Button title="Відкрити" onPress={() => router.push(`/notes/${latest.id}`)} />
        </>
      ) : (
        <Text color="textMuted">Тепле слово серед дня — найкращий сюрприз.</Text>
      )}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Написати"
            icon={PencilSimpleLineIcon}
            variant="secondary"
            onPress={() => router.push('/notes/new')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Усі" variant="ghost" onPress={() => router.push('/notes')} />
        </View>
      </View>
    </Card>
  );
}

function QuestionCard() {
  const router = useRouter();
  const { spacing } = useTheme();
  const day = useTodayQuestion();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');

  const status = !day.mine
    ? 'Відповідай, щоб побачити відповідь партнера'
    : day.partner
      ? `${partnerName} теж відповідає. Подивись!`
      : `Чекаємо на відповідь: ${partnerName}`;

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={ChatCircleDotsIcon} color="secondary" weight="duotone" />
        <Text variant="caption" color="textMuted">
          Питання дня
        </Text>
      </View>
      <Text variant="subtitle">{day.question.text}</Text>
      <Text variant="caption" color={day.mine ? 'textMuted' : 'primary'}>
        {status}
      </Text>
      <Button
        title={day.mine ? 'Відкрити' : 'Відповісти'}
        variant={day.mine ? 'secondary' : 'primary'}
        onPress={() => router.push('/question')}
      />
    </Card>
  );
}

function GamesCard() {
  const router = useRouter();
  const { spacing } = useTheme();
  const points = usePoints();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const yourTurn = useRounds().find((r) => r.status === 'yourTurn');

  return (
    <TreeCard points={points} compact>
      {yourTurn ? (
        <Text color="primary">
          {partnerName} чекає на тебе: «{GAMES[yourTurn.round.kind].title}» 🎲
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            title={yourTurn ? 'Грати' : 'Ігри'}
            icon={GameControllerIcon}
            variant={yourTurn ? 'primary' : 'secondary'}
            onPress={() => router.push(yourTurn ? `/games/${yourTurn.round.id}` : '/games')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Челенджі" variant="ghost" onPress={() => router.push('/challenges')} />
        </View>
      </View>
    </TreeCard>
  );
}

const UPCOMING_COUNT = 3;

function UpcomingDates() {
  const router = useRouter();
  const { spacing } = useTheme();
  const upcoming = useCalendar()
    .filter((e) => e.next)
    .slice(0, UPCOMING_COUNT);

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Найближчі дати</Text>
      {upcoming.length === 0 ? (
        <Text color="textMuted">Додайте річниці, дні народження й інші важливі для вас дні.</Text>
      ) : (
        upcoming.map((e) => (
          <ListItem
            key={e.key}
            icon={CalendarHeartIcon}
            title={e.title}
            subtitle={`${formatDayMonth(e.next!)} · ${formatDaysLeft(e.daysLeft!)}`}
            accent={e.daysLeft! <= 7}
          />
        ))
      )}
      <Button title="Усі дати" variant="secondary" onPress={() => router.push('/dates')} />
    </Card>
  );
}

function OverdueMoments() {
  const router = useRouter();
  const { spacing } = useTheme();
  const overdue = useMomentSummaries().filter((m) => m.overdue);
  if (overdue.length === 0) return null;

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">Давно не було</Text>
      {overdue.slice(0, 3).map((m) => (
        <ListItem
          key={m.id}
          icon={momentGlyph(m.icon)}
          title={m.title}
          subtitle={`Востаннє ${formatDaysAgo(m.daysSince ?? 0)}`}
          accent
          onPress={() => router.push(`/moment/${m.id}`)}
        />
      ))}
    </Card>
  );
}

function NotificationsPrompt() {
  const { spacing } = useTheme();
  const asked = useNotificationPrefs((s) => s.asked);
  if (asked || Platform.OS === 'web') return null;

  const enable = async () => {
    const granted = await requestNotificationPermission();
    useNotificationPrefs.setState({ asked: true, enabled: granted });
  };

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={BellIcon} color="primary" weight="duotone" />
        <Text variant="subtitle">Нагадування</Text>
      </View>
      <Text color="textMuted">
        Нагадаємо про питання дня, річниці й про те, що давно не було побачення. Налаштувати можна
        будь-коли в профілі.
      </Text>
      <Button title="Увімкнути" onPress={enable} />
      <Button
        title="Не зараз"
        variant="ghost"
        onPress={() => useNotificationPrefs.setState({ asked: true })}
      />
    </Card>
  );
}

export default function Home() {
  const { spacing } = useTheme();
  const name = useAuth((s) => s.profile?.name);
  const partnerName = useCouple((s) => s.partner?.name);

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text color="textMuted">{name ? `Привіт, ${name}` : 'Привіт'}</Text>
        <Text variant="title">{partnerName ? `Ти і ${partnerName}` : 'Ви разом у Dotyk'}</Text>
      </View>

      <TogetherCounter />
      <NotificationsPrompt />
      <TouchCard />
      <NotesCard />
      <QuestionCard />
      <GamesCard />
      <MoodCard />
      <OverdueMoments />
      <UpcomingDates />
    </Screen>
  );
}
