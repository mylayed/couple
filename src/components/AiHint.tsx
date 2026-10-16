import { useRouter } from 'expo-router';
import { SparkleIcon } from 'phosphor-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { quotaText, refreshAiQuota, useAiQuota } from '@/services/ai';
import { usePlus } from '@/services/plus';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

// Рядок під кнопкою ШІ: скільки запитів лишилось і вхід до пояснення, що надсилається.
// Коли безкоштовні запити закінчились, з'являється вхід до Plus
export function AiHint() {
  const router = useRouter();
  const { spacing } = useTheme();
  const quota = useAiQuota((s) => s.quota);
  const plus = usePlus();
  const exhausted = !!quota && !quota.plus && !plus && quota.used >= quota.quota;

  useEffect(() => {
    void refreshAiQuota();
  }, []);

  const hint = (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Відкриває пояснення, які дані надсилаються до ШІ"
      onPress={() => router.push('/ai')}
      style={({ pressed }) => [styles.row, { gap: spacing.xs, opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon icon={SparkleIcon} size={14} color="textMuted" />
      <Text variant="caption" color="textMuted" style={styles.flex}>
        {[quotaText(quota), 'Що надсилається?'].filter(Boolean).join(' · ')}
      </Text>
    </Pressable>
  );

  if (!exhausted) return hint;
  return (
    <View style={{ gap: spacing.sm }}>
      {hint}
      <Button
        title="ШІ без обмежень з Plus"
        icon={SparkleIcon}
        variant="secondary"
        onPress={() => router.push({ pathname: '/plus', params: { from: 'ai' } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flexShrink: 1 },
});
