import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorPalette, type ThemeMode } from '@/constants/theme';
import { loadThemeMode, saveThemeMode } from '@/storage/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  colors: ColorPalette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadThemeMode().then((saved) => {
      setModeState(saved);
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await saveThemeMode(next);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemScheme === 'dark';
  }, [mode, systemScheme]);

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, setMode, colors, isDark }),
    [mode, setMode, colors, isDark]
  );

  // Don't render until the saved preference is loaded to avoid a flash
  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
