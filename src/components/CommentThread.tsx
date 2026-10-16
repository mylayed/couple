import { PaperPlaneRightIcon, TrashIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useAuth } from '@/store/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { formatTimeAgo } from '@/utils/dates';
import { Icon } from './Icon';
import { Text } from './Text';
import { TextField } from './TextField';

type ThreadComment = { id: string; body: string; created_by: string | null; created_at: string };

type CommentThreadProps = {
  comments: ThreadComment[];
  partnerName: string;
  placeholder: string;
  maxLength: number;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
};

// Коментарі пари бульбашками: свої праворуч, партнера ліворуч; поле відправки внизу
export function CommentThread({
  comments,
  partnerName,
  placeholder,
  maxLength,
  onAdd,
  onDelete,
}: CommentThreadProps) {
  const { colors, radius, spacing } = useTheme();
  const userId = useAuth((s) => s.session?.user.id);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <View
      style={{
        gap: spacing.sm,
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingTop: spacing.md,
      }}
    >
      <Text variant="caption" color="textMuted">
        Коментарі
      </Text>
      {comments.map((c) => {
        const mine = c.created_by === userId;
        return (
          <View
            key={c.id}
            style={{
              alignSelf: mine ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              gap: spacing.xs,
              padding: spacing.sm + 2,
              borderRadius: radius.md,
              backgroundColor: mine ? colors.background : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text>{c.body}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text variant="caption" color="textMuted">
                {mine ? 'Ти' : partnerName} · {formatTimeAgo(c.created_at)}
              </Text>
              {mine ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Видалити коментар"
                  hitSlop={8}
                  onPress={() => onDelete(c.id)}
                >
                  <Icon icon={TrashIcon} size={14} color="textMuted" />
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextField
            placeholder={placeholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={maxLength}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Надіслати коментар"
          disabled={!text.trim()}
          onPress={send}
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            opacity: text.trim() ? 1 : 0.5,
          }}
        >
          <Icon icon={PaperPlaneRightIcon} size={22} color="onPrimary" weight="fill" />
        </Pressable>
      </View>
    </View>
  );
}
