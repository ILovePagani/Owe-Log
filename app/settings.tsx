import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CURRENCY_OPTIONS, useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import type { ThemeMode } from '@/constants/theme';

const THEME_OPTIONS: { mode: ThemeMode; label: string; description: string }[] = [
  { mode: 'light', label: 'Light',  description: 'Always use light appearance' },
  { mode: 'dark',  label: 'Dark',   description: 'Always use dark appearance'  },
  { mode: 'auto',  label: 'System', description: 'Match your device setting'   },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { symbol, setSymbol } = useCurrency();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((opt, i) => {
            const selected = mode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => setMode(opt.mode)}
                style={({ pressed }) => [
                  styles.row,
                  i < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{opt.description}</Text>
                </View>
                <View
                  style={[
                    styles.check,
                    {
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accent : 'transparent',
                    },
                  ]}
                >
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Currency */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.lg }]}>
          Currency
        </Text>
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {CURRENCY_OPTIONS.map((opt, i) => {
            const selected = symbol === opt.symbol;
            return (
              <Pressable
                key={opt.symbol}
                onPress={() => setSymbol(opt.symbol)}
                style={({ pressed }) => [
                  styles.row,
                  i < CURRENCY_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{opt.label}</Text>
                </View>
                <View
                  style={[
                    styles.check,
                    {
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accent : 'transparent',
                    },
                  ]}
                >
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
