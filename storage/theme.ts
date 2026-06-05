import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@/constants/theme';

const THEME_KEY = '@owe_log_theme_v1';

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw;
    return 'auto';
  } catch {
    return 'auto';
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, mode);
}
