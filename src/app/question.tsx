import { LockSimpleIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { saveAnswer, useQuestionDays, type QuestionDay } from '@/services/questions';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDayMonth, parseIsoDate, todayIso } from '@/utils/dates';

const MAX_ANSWER = 1000;

function AnswerForm({ day, onDone }: { day: QuestionDay; onDone: () => void }) {
  const { spacing } = useTheme();
  const [text, setText] = useState(day.mine?.answer ?? '');

  const submit = () => {
    if (!text.trim()) return;
    saveAnswer(day, text);
    onDone();
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <TextField
        placeholder="Твоя відповідь…"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_ANSWER}
        style={{ minHeight: 120, textAlignVertical: 'top' }}
        autoFocus
      />
      <Button
        title={day.mine ? 'Зберегти' : 'Відповісти'}
        onPress={submit}
        disabled={!text.trim()}
      />
    </View>
  );
}

function Answers({ day, partnerName }: { day: QuestionDay; partnerName: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {day.mine ? (
        <View style={{ gap: spacing.xs }}>
          <Text variant="caption" color="textMuted">
            Ти
          </Text>
          <Text>{day.mine.answer}</Text>
        </View>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" color="textMuted">
          {partnerName}
        </Text>
        {day.partner ? (
          <Text>{day.partner.answer}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon icon={LockSimpleIcon} size={18} color="textMuted" />
            <Text color="textMuted">
              {day.mine ? 'Ще не відповідає' : 'Відповідь відкриється після твоєї'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function Question() {
  const { spacing } = useTheme();
  const days = useQuestionDays();
  const partnerName = useCouple((s) => s.partner?.name ?? 'Партнер');
  const today = todayIso();
  const current = days.find((d) => d.date === today) ?? days[0];
  const history = days.filter((d) => d.date !== today && d.mine);
  const [editing, setEditing] = useState(false);

  // Свою відповідь можна змінити, поки партнер ще не відповів
  const canEdit = current.mine && !current.partner;
  const showForm = !current.mine || editing;

  return (
    <Screen edges={['bottom']}>
      <Card style={{ gap: spacing.lg }}>
        <Text variant="caption" color="textMuted">
          Сьогодні, {formatDayMonth(parseIsoDate(current.date))}
        </Text>
        <Text variant="title">{current.question.text}</Text>
        {showForm ? (
          <AnswerForm key={current.date} day={current} onDone={() => setEditing(false)} />
        ) : (
          <>
            <Answers day={current} partnerName={partnerName} />
            {canEdit ? (
              <Button title="Змінити відповідь" variant="ghost" onPress={() => setEditing(true)} />
            ) : null}
          </>
        )}
        {showForm && !current.mine ? (
          <Text variant="caption" color="textMuted">
            Відповідь партнера відкриється, щойно ти відповіси. А {partnerName} побачить твою лише
            після своєї.
          </Text>
        ) : null}
      </Card>

      {history.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">Попередні питання</Text>
          {history.map((day) => (
            <Card key={day.date} style={{ gap: spacing.md }}>
              <Text variant="caption" color="textMuted">
                {formatDayMonth(parseIsoDate(day.date), true)}
              </Text>
              <Text variant="subtitle">{day.question.text}</Text>
              <Answers day={day} partnerName={partnerName} />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
