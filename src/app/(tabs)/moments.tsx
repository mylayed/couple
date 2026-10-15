import { ClockCounterClockwiseIcon } from 'phosphor-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export default function Moments() {
  return (
    <Screen>
      <Text variant="title">Коли ми востаннє…</Text>
      <EmptyState
        icon={ClockCounterClockwiseIcon}
        title="Поки що тут порожньо"
        description="Додавайте спільні справи: побачення, подорожі, вечері. Ми нагадаємо, коли давно не було."
      />
    </Screen>
  );
}
