export type ThemeMode = 'light' | 'dark' | 'auto';

export const lightColors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  text: '#2D2D2A',
  textMuted: '#8A8A85',
  border: '#E8E8E4',

  oweMe: '#5B8A72',
  oweMeBg: '#EEF5F0',

  iOwe: '#C4785A',
  iOweBg: '#FBF0EC',

  settled: '#B0B0AA',
  settledBg: '#F4F4F2',

  accent: '#6B7FD7',
  danger: '#D45D5D',
};

export const darkColors = {
  background: '#1A1A18',
  surface: '#242422',
  text: '#F0F0ED',
  textMuted: '#78787A',
  border: '#333330',

  oweMe: '#6FAF8C',
  oweMeBg: '#1E2E25',

  iOwe: '#D98B6A',
  iOweBg: '#2C1F17',

  settled: '#6A6A65',
  settledBg: '#1E1E1C',

  accent: '#8090E0',
  danger: '#E06B6B',
};

export type ColorPalette = typeof lightColors;

/** Kept for any legacy direct imports — resolves to light palette */
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};
