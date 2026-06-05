import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type ColorPalette } from '@/constants/theme';
import type { Entry } from '@/types/entry';
import { formatMoney } from '@/utils/balance';
import { SwipeableRow } from './SwipeableRow';

interface Props {
  entry: Entry;
  onSettle: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
}

export function EntryRow({ entry, onSettle, onEdit, onArchive }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const settled = !!entry.settledAt;
  const isTheyOwe = entry.direction === 'they_owe_me';

  const handleSettle = () => {
    if (settled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettle();
  };

  // Prefer the user-chosen entryDate, fall back to createdAt for old entries
  const dateStr = entry.entryDate ?? entry.createdAt;
  const date = entry.entryDate
    ? (() => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      })()
    : new Date(entry.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

  const canEdit = !settled && !entry.archived && !!onEdit;

  return (
    <SwipeableRow onSwipeSettle={handleSettle} disabled={settled || entry.archived}>
      <View style={[styles.row, settled && styles.rowSettled, entry.archived && styles.archived]}>
        <View style={styles.main}>
          <View style={styles.top}>
            <Text style={[styles.amount, settled && styles.muted]}>
              {isTheyOwe ? '+' : '−'}
              {formatMoney(entry.amount)}
            </Text>
            <Text style={[styles.direction, { color: isTheyOwe ? colors.oweMe : colors.iOwe }]}>
              {isTheyOwe ? 'They owe you' : 'You owe them'}
            </Text>
          </View>
          {entry.note ? (
            <Text style={[styles.note, settled && styles.muted]} numberOfLines={2}>
              {entry.note}
            </Text>
          ) : null}
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Right-side actions */}
        <View style={styles.actions}>
          {canEdit && (
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.5 }]}
            >
              <Text style={styles.editText}>✎</Text>
            </Pressable>
          )}

          {settled ? (
            <View style={styles.settledChip}>
              <Text style={styles.settledText}>Settled</Text>
              {onArchive && !entry.archived ? (
                <Pressable onPress={onArchive} hitSlop={8}>
                  <Text style={styles.archiveLink}>Archive</Text>
                </Pressable>
              ) : entry.archived ? (
                <Text style={styles.archivedLabel}>Archived</Text>
              ) : null}
            </View>
          ) : (
            <Pressable
              onPress={handleSettle}
              style={({ pressed }) => [styles.settleBtn, pressed && styles.settlePressed]}
            >
              <Text style={styles.settleText}>Settle</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SwipeableRow>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowSettled: {
      backgroundColor: colors.settledBg,
      borderColor: 'transparent',
    },
    archived: {
      opacity: 0.7,
    },
    main: {
      flex: 1,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    amount: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    direction: {
      fontSize: 13,
      fontWeight: '500',
    },
    note: {
      fontSize: 15,
      color: colors.text,
      marginTop: spacing.xs,
    },
    date: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    muted: {
      color: colors.settled,
      textDecorationLine: 'line-through',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginLeft: spacing.sm,
    },
    editBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    editText: {
      fontSize: 16,
      color: colors.textMuted,
    },
    settleBtn: {
      backgroundColor: colors.oweMeBg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
    },
    settlePressed: {
      opacity: 0.7,
    },
    settleText: {
      color: colors.oweMe,
      fontWeight: '600',
      fontSize: 14,
    },
    settledChip: {
      alignItems: 'flex-end',
    },
    settledText: {
      fontSize: 13,
      color: colors.settled,
      fontWeight: '600',
    },
    archiveLink: {
      fontSize: 12,
      color: colors.accent,
      marginTop: spacing.xs,
    },
    archivedLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
}
