import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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
import { useEntries } from '@/context/EntriesContext';
import { colors, spacing } from '@/constants/theme';
import { entrySignedAmount, shareSummaryText } from '@/utils/balance';

export default function PersonDetailScreen() {
  const router = useRouter();
  const { key, name } = useLocalSearchParams<{ key: string; name?: string }>();
  const personKey = decodeURIComponent(key ?? '');
  const displayName = name ? decodeURIComponent(name) : personKey;

  const { getEntriesForPerson, settleEntry, archiveEntry } = useEntries();
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
    const message = shareSummaryText(displayName, netBalance);
    await Share.share({ message });
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
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
