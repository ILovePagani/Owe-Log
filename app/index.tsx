import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { PersonCard } from '@/components/PersonCard';
import { useEntries } from '@/context/EntriesContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, type ColorPalette } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { summaries, allSummaries, loading } = useEntries();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showHistory, setShowHistory] = useState(false);

  const displayed = showHistory ? allSummaries : summaries;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <Text style={styles.tagline}>Who owes who — kept simple.</Text>

      {allSummaries.length > 0 && (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show history</Text>
          <Switch
            value={showHistory}
            onValueChange={setShowHistory}
            trackColor={{ false: colors.border, true: colors.oweMeBg }}
            thumbColor={showHistory ? colors.oweMe : colors.surface}
          />
        </View>
      )}

      {displayed.length === 0 ? (
        <EmptyState
          title={showHistory ? 'No history yet' : 'No open tabs'}
          subtitle={
            showHistory
              ? 'Your past tabs will appear here once you add some.'
              : 'Tap + to log lunch, rides, or anything between friends.'
          }
        />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.personKey}
          renderItem={({ item }) => (
            <PersonCard
              summary={item}
              onPress={() =>
                router.push({
                  pathname: '/person/[key]',
                  params: { key: item.personKey, name: item.displayName },
                })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={() => router.push('/add')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + spacing.lg },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    tagline: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingVertical: spacing.xs,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    list: {
      paddingBottom: spacing.md,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    fabPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.96 }],
    },
    fabText: {
      fontSize: 28,
      color: '#fff',
      fontWeight: '300',
      marginTop: -2,
    },
  });
}
