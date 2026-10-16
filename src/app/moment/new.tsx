import { useRouter } from 'expo-router';

import { MomentForm } from '@/components/MomentForm';
import { Screen } from '@/components/Screen';
import { saveMoment } from '@/services/moments';

export default function NewMoment() {
  const router = useRouter();
  return (
    <Screen edges={['bottom']}>
      <MomentForm
        submitTitle="Додати"
        onSubmit={(input) => {
          saveMoment(input);
          router.back();
        }}
      />
    </Screen>
  );
}
