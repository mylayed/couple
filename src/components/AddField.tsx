import { PlusIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/utils/haptics';
import { Icon } from './Icon';
import { TextField } from './TextField';

type AddFieldProps = {
  placeholder: string;
  maxLength: number;
  onAdd: (title: string) => void;
};

// Швидке додавання пункту: Enter або «+», поле лишається у фокусі для наступного
export function AddField({ placeholder, maxLength, onAdd }: AddFieldProps) {
  const { colors, radius, spacing } = useTheme();
  const [value, setValue] = useState('');
  const canAdd = value.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    haptics.tap();
    onAdd(value.trim());
    setValue('');
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <TextField
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          submitBehavior="submit"
          returnKeyType="done"
          maxLength={maxLength}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Додати"
        disabled={!canAdd}
        onPress={submit}
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: canAdd ? 1 : 0.5,
        }}
      >
        <Icon icon={PlusIcon} size={22} color="onPrimary" weight="bold" />
      </Pressable>
    </View>
  );
}
