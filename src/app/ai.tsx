import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { ToggleRow } from '@/components/ToggleRow';
import { quotaText, refreshAiQuota, useAiConsent, useAiQuota } from '@/services/ai';
import { updateProfile } from '@/services/auth';
import { useCouple } from '@/store/couple';
import { useTheme } from '@/theme/ThemeProvider';

// Що саме йде до ШІ в кожній функції. Тримати в згоді з supabase/functions/ai/features.ts
const FEATURES: { title: string; sent: string }[] = [
  {
    title: 'Ідеї побачень під вас',
    sent: 'Обраний бюджет і настрій, поточний місяць, назви дій «Коли ми востаннє…», які ви відмічаєте найчастіше, назви невиконаних мрій із бакет-ліста.',
  },
  {
    title: 'Помічник для листівок',
    sent: 'Тон, текст твоєї чернетки та ім’я партнера.',
  },
  {
    title: 'Історія року',
    sent: 'Цифри з підсумку року, ваші імена, найчастіші моменти, назви здійснених мрій і підписи до спогадів за рік.',
  },
];

function Bullet({ children }: { children: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      <Text color="textMuted">•</Text>
      <Text color="textMuted" style={{ flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

export default function AiScreen() {
  const { spacing } = useTheme();
  const consent = useAiConsent();
  const partnerName = useCouple((s) => s.partner?.name);
  const quota = useAiQuota((s) => s.quota);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshAiQuota();
  }, []);

  const toggle = async (ai_enabled: boolean) => {
    setBusy(true);
    setError(null);
    const result = await updateProfile({ ai_enabled });
    setBusy(false);
    if (result.error) setError(result.error);
  };

  return (
    <Screen edges={['bottom']}>
      <Card style={{ gap: spacing.md }}>
        <ToggleRow
          title="Використовувати ШІ"
          description="Якщо вимкнути, функції ШІ зникнуть, а твої дані не надсилатимуться"
          value={consent.mine}
          onValueChange={toggle}
          disabled={busy}
        />
        {error ? (
          <Text variant="caption" color="primary">
            {error}
          </Text>
        ) : null}
        {consent.mine && quota ? <Text color="textMuted">{quotaText(quota)}</Text> : null}
        {!consent.partner ? (
          <Text variant="caption" color="textMuted">
            {partnerName ?? 'Партнер'} вимикає ШІ для себе. Тому спільні дані пари ми не надсилаємо:
            історія року недоступна, ідеї побачень будуть без ваших моментів і мрій, а в листівках
            не буде імені.
          </Text>
        ) : null}
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text variant="subtitle">Що надсилається</Text>
        <Text color="textMuted">
          Лише після натискання кнопки зі значком ✨ і лише те, що потрібно для цієї функції:
        </Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={{ gap: spacing.xs }}>
            <Text>{f.title}</Text>
            <Text variant="caption" color="textMuted">
              {f.sent}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="subtitle">Що не надсилається ніколи</Text>
        <Bullet>Фото, відповіді на питання дня, настрій, листівки партнера й коментарі.</Bullet>
        <Bullet>Пошта, дата народження та інші дані акаунта.</Bullet>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text variant="subtitle">Як це працює</Text>
        <Bullet>
          Запит іде на наш сервер, а звідти до моделі Claude від Anthropic. За умовами Anthropic
          дані з API не використовуються для навчання моделей.
        </Bullet>
        <Bullet>
          Готові відповіді зберігаються на сервері до 30 днів, щоб однаковий запит не витрачав
          ліміт. Вхідні дані там не зберігаються. Усе видаляється разом із парою.
        </Bullet>
        <Bullet>Безкоштовно 3 запити на добу для кожного з вас. З Plus — без обмежень.</Bullet>
        <Bullet>ШІ може помилятися. Перечитай текст, перш ніж надіслати.</Bullet>
      </Card>
    </Screen>
  );
}
