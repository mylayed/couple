import { useRouter } from 'expo-router';
import { EnvelopeOpenIcon, EnvelopeSimpleIcon, PencilSimpleLineIcon } from 'phosphor-react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useNotes } from '@/services/notes';
import { touchMeta } from '@/services/touches';
import type { Note } from '@/services/sync';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimeAgo } from '@/utils/dates';

const preview = (body: string) => (body.length > 60 ? `${body.slice(0, 60)}…` : body);

function NoteRow({ note, incoming }: { note: Note; incoming: boolean }) {
  const router = useRouter();
  const sealed = incoming && !note.opened_at;
  const status = incoming
    ? formatTimeAgo(note.created_at)
    : note.reaction
      ? `${formatTimeAgo(note.created_at)} · у відповідь: ${touchMeta(note.reaction).label.toLowerCase()}`
      : `${formatTimeAgo(note.created_at)} · ${note.opened_at ? 'відкрито' : 'ще в конверті'}`;
  return (
    <ListItem
      icon={sealed ? EnvelopeSimpleIcon : EnvelopeOpenIcon}
      // Зміст запечатаної листівки не показуємо навіть у списку: це сюрприз
      title={sealed ? 'Нова листівка' : preview(note.body)}
      subtitle={status}
      accent={sealed}
      onPress={() => router.push(`/notes/${note.id}`)}
    />
  );
}

export default function Notes() {
  const router = useRouter();
  const { spacing } = useTheme();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const { inbox, sent } = useNotes();

  return (
    <Screen edges={['bottom']}>
      <Button
        title="Написати листівку"
        icon={PencilSimpleLineIcon}
        onPress={() => router.push('/notes/new')}
      />
      {inbox.length === 0 && sent.length === 0 ? (
        <EmptyState
          icon={EnvelopeSimpleIcon}
          title="Тут житимуть ваші листівки"
          description="Напиши кілька теплих слів — вони прийдуть сюрпризом у запечатаному конверті."
        />
      ) : null}
      {inbox.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Від: {partnerName}</Text>
          {inbox.map((n) => (
            <NoteRow key={n.id} note={n} incoming />
          ))}
        </Card>
      ) : null}
      {sent.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <Text variant="subtitle">Від тебе</Text>
          {sent.map((n) => (
            <NoteRow key={n.id} note={n} incoming={false} />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
