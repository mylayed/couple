import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { EnvelopeSimpleIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { NotePaper } from '@/components/NotePaper';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { deleteNote, openNote, reactToNote } from '@/services/notes';
import { useRow } from '@/services/sync';
import { TOUCHES, touchMeta } from '@/services/touches';
import { useAuth } from '@/store/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, formatTimeAgo } from '@/utils/dates';
import { haptics } from '@/utils/haptics';

// Запечатаний конверт: листівка відкривається лише дотиком отримувача
function Envelope({ onOpen, from }: { onOpen: () => void; from: string }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Animated.View entering={ZoomIn.springify().damping(14)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Відкрити листівку"
        onPress={onOpen}
        style={[
          styles.envelope,
          {
            gap: spacing.md,
            padding: spacing.xl,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            borderColor: colors.primary,
          },
        ]}
      >
        <Icon icon={EnvelopeSimpleIcon} size={72} color="primary" weight="duotone" />
        <Text variant="subtitle" align="center">
          Листівка від: {from}
        </Text>
        <Text color="textMuted" align="center">
          Торкнись, щоб відкрити
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function NoteScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useRow('notes', id);
  const userId = useAuth((s) => s.session?.user.id);
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!note) {
    return (
      <Screen edges={['bottom']}>
        <Stack.Screen options={{ title: 'Листівка' }} />
        <EmptyState
          icon={EnvelopeSimpleIcon}
          title="Листівки немає"
          description="Можливо, її вже видалено."
        />
      </Screen>
    );
  }

  const incoming = note.created_by !== userId;
  const created = new Date(note.created_at);

  if (incoming && !note.opened_at) {
    return (
      <Screen edges={['bottom']} contentStyle={{ justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Листівка' }} />
        <Envelope
          from={partnerName}
          onOpen={() => {
            haptics.success();
            openNote(note);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: incoming ? `Від: ${partnerName}` : 'Твоя листівка' }} />
      <Animated.View entering={FadeIn.duration(400)}>
        <NotePaper noteStyle={note.style}>
          <Text variant="subtitle">{note.body}</Text>
          <Text variant="caption" color="textMuted" align="right">
            {formatDayMonth(created, created.getFullYear() !== new Date().getFullYear())}
          </Text>
        </NotePaper>
      </Animated.View>

      {incoming ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="caption" color="textMuted">
            Відповісти дотиком
          </Text>
          <View style={[styles.row, { gap: spacing.sm }]}>
            {TOUCHES.map((t) => (
              <Chip
                key={t.kind}
                icon={t.icon}
                label={t.label}
                selected={note.reaction === t.kind}
                onPress={() => reactToNote(note, note.reaction === t.kind ? null : t.kind)}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Text color="textMuted">
            {note.opened_at
              ? `${partnerName} відкриває листівку ${formatTimeAgo(note.opened_at)}`
              : 'Листівка ще в конверті'}
          </Text>
          {note.reaction ? (
            <Text color="primary">У відповідь: {touchMeta(note.reaction).label.toLowerCase()}</Text>
          ) : null}
          {confirmDelete ? (
            <>
              <Text>Листівка зникне і в тебе, і в {partnerName}.</Text>
              <Button
                title="Так, видалити"
                icon={TrashIcon}
                onPress={() => {
                  deleteNote(note.id);
                  router.back();
                }}
              />
              <Button title="Скасувати" variant="ghost" onPress={() => setConfirmDelete(false)} />
            </>
          ) : (
            <Button
              title="Видалити листівку"
              icon={TrashIcon}
              variant="ghost"
              onPress={() => setConfirmDelete(true)}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  envelope: { alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
