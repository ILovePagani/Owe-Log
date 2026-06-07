import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { BalanceBadge } from '@/components/BalanceBadge';
import { EmptyState } from '@/components/EmptyState';
import { EntryRow } from '@/components/EntryRow';
import { useCurrency } from '@/context/CurrencyContext';
import { useEntries } from '@/context/EntriesContext';
import { useTheme } from '@/context/ThemeContext';
import { spacing, type ColorPalette } from '@/constants/theme';
import { entrySignedAmount, shareSummaryText } from '@/utils/balance';

export default function PersonDetailScreen() {
  const router = useRouter();
  const { key, name } = useLocalSearchParams<{ key: string; name?: string }>();
  const personKey = decodeURIComponent(key ?? '');
  const displayName = name ? decodeURIComponent(name) : personKey;

  const { getEntriesForPerson, settleEntry, archiveEntry, deleteEntry, deleteAllEntriesForPerson } = useEntries();
  const { colors } = useTheme();
  const { symbol } = useCurrency();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showSettled, setShowSettled] = useState(false);

  const allEntries = getEntriesForPerson(personKey);

  const netBalance = useMemo(
    () => allEntries.reduce((sum, e) => sum + entrySignedAmount(e), 0),
    [allEntries]
  );

  const visibleEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (e.archived) return showSettled;
      if (e.settledAt && !showSettled) return false;
      return true;
    });
  }, [allEntries, showSettled]);

  const handleShare = async () => {
    const message = shareSummaryText(displayName, netBalance, symbol);
    await Share.share({ message });
  };

  const handleDeletePerson = () => {
    Alert.alert(
      `Delete ${displayName}?`,
      'This will permanently delete all entries with this person. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllEntriesForPerson(personKey);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: displayName,
          headerRight: () => (
            <Pressable onPress={handleShare} hitSlop={12}>
              <Text style={styles.shareBtn}>Share</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <BalanceBadge netBalance={netBalance} />
          <Pressable
            onPress={() =>
              router.push({ pathname: '/add', params: { name: displayName } })
            }
            style={styles.addLink}
          >
            <Text style={styles.addLinkText}>+ Add tab</Text>
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show settled & archived</Text>
          <Switch
            value={showSettled}
            onValueChange={setShowSettled}
            trackColor={{ false: colors.border, true: colors.oweMeBg }}
            thumbColor={showSettled ? colors.oweMe : colors.surface}
          />
        </View>

        {visibleEntries.length === 0 ? (
          <EmptyState
            title={showSettled ? 'Nothing here' : 'No open tabs'}
            subtitle={
              showSettled
                ? 'Settled tabs appear here when you turn on the toggle.'
                : 'Add a tab or show settled entries.'
            }
          />
        ) : (
          <FlatList
            data={visibleEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryRow
                entry={item}
                onSettle={() => settleEntry(item.id)}
                onArchive={
                  item.settledAt && !item.archived
                    ? () => archiveEntry(item.id)
                    : undefined
                }
                onEdit={() =>
                  router.push({
                    pathname: '/add',
                    params: { entryId: item.id },
                  })
                }
                onDelete={() => deleteEntry(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              allEntries.length > 0 ? (
                <Pressable
                  onPress={handleDeletePerson}
                  style={({ pressed }) => [styles.deletePersonBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.deletePersonText}>Delete {displayName}</Text>
                </Pressable>
              ) : null
            }
          />
        )}

        {visibleEntries.length === 0 && allEntries.length > 0 && (
          <Pressable
            onPress={handleDeletePerson}
            style={({ pressed }) => [styles.deletePersonBtn, styles.deletePersonBtnBottom, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.deletePersonText}>Delete {displayName}</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    header: {
      alignItems: 'flex-start',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    shareBtn: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '500',
    },
    addLink: {
      paddingVertical: spacing.xs,
    },
    addLinkText: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: '600',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
    },
    toggleLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    list: {
      paddingBottom: spacing.xl,
    },
    deletePersonBtn: {
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    deletePersonBtnBottom: {
      position: 'absolute',
      bottom: spacing.xl,
      left: 0,
      right: 0,
    },
    deletePersonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
