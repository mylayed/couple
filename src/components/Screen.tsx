import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

type ScreenProps = {
  children: React.ReactNode;
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

// Базова обгортка екрана: безпечні зони, прокрутка, відступи з теми
export function Screen({ children, edges = ['top'], contentStyle }: ScreenProps) {
  const { spacing } = useTheme();
  return (
    <SafeAreaView style={styles.flex} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.grow,
            { padding: spacing.lg, gap: spacing.lg },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
});
