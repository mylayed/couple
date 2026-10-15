import { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function TextField({ label, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          typography.body,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? colors.primary : focused ? colors.secondary : colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md - 2,
            // У вебі прибираємо системну рамку фокусу: її роль виконує колір рамки
            outlineWidth: 0,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="primary">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
