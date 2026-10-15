import { ImagesIcon } from 'phosphor-react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export default function Memories() {
  return (
    <Screen>
      <Text variant="title">Спогади</Text>
      <EmptyState
        icon={ImagesIcon}
        title="Перший спогад попереду"
        description="Фото й кілька слів до важливих днів, щоб нічого не загубилось."
      />
    </Screen>
  );
}
