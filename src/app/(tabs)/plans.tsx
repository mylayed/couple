import { MapTrifoldIcon } from 'phosphor-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export default function Plans() {
  return (
    <Screen>
      <Text variant="title">Плани</Text>
      <EmptyState
        icon={MapTrifoldIcon}
        title="Ваш бакет-ліст"
        description="Тут будуть спільні мрії, списки й ідеї для побачень."
      />
    </Screen>
  );
}
