import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors, ThemeMode, spacing, radius, motion, touchTarget } from './tokens';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  touchTarget: typeof touchTarget;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'poth.theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ThemeMode>(
    (Appearance.getColorScheme() as ThemeMode) ?? 'light'
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreferenceState(saved);
      }
    });
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme((colorScheme as ThemeMode) ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const mode: ThemeMode = preference === 'system' ? systemScheme : preference;
  const colors = mode === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, mode, preference, setPreference, spacing, radius, motion, touchTarget }),
    [colors, mode, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
