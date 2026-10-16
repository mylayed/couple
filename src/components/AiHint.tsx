import { useRouter } from 'expo-router';
import { SparkleIcon } from 'phosphor-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { quotaText, refreshAiQuota, useAiQuota } from '@/services/ai';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

// Рядок під кнопкою ШІ: скільки запитів лишилось і вхід до пояснення, що надсилається
export function AiHint() {
  const router = useRouter();
  const { spacing } = useTheme();
  const quota = useAiQuota((s) => s.quota);

  useEffect(() => {
    void refreshAiQuota();
  }, []);

  return (
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
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flexShrink: 1 },
});
