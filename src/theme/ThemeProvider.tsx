import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { storage, StorageKeys } from '@/services/storage';
import {
  Colors,
  ThemeMode,
  darkColors,
  lightColors,
  motion,
  radius,
  spacing,
  typography,
} from './tokens';

type Theme = {
  mode: ThemeMode; // вибір користувача: light | dark | system
  isDark: boolean; // фактична тема зараз
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<Theme | null>(null);

function readSavedMode(): ThemeMode {
  const saved = storage.getString(StorageKeys.themeMode);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  // MMKV синхронний, тому збережений вибір доступний одразу, без мерехтіння теми
  const [mode, setModeState] = useState<ThemeMode>(readSavedMode);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.set(StorageKeys.themeMode, next);
  }, []);

  const value = useMemo<Theme>(() => {
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    return {
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      motion,
      setMode,
    };
  }, [mode, systemScheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme має використовуватись усередині ThemeProvider');
  return ctx;
}
