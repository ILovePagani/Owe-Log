import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type ColorPalette } from '@/constants/theme';
import type { Entry } from '@/types/entry';
import { formatMoney } from '@/utils/balance';

interface Props {
  entry: Entry;
  onSettle: () => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntryRow({ entry, onSettle, onArchive, onEdit, onDelete }: Props) {
  const { colors } = useTheme();
  const { symbol } = useCurrency();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const settled = !!entry.settledAt;
  const isTheyOwe = entry.direction === 'they_owe_me';

  const handleSettle = () => {
    if (settled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettle();
  };

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const options: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [];

    if (onEdit) {
      options.push({ text: 'Edit', onPress: onEdit });
    }
    if (onDelete) {
      options.push({
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete entry?',
            'This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]
          );
        },
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Options', undefined, options);
  };

  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.row, settled && styles.rowSettled, entry.archived && styles.archived]}>
      <View style={styles.main}>
        <View style={styles.top}>
          <Text style={[styles.amount, settled && styles.muted]}>
            {isTheyOwe ? '+' : '−'}
            {formatMoney(entry.amount, symbol)}
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

      <View style={styles.actions}>
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

        {(onEdit || onDelete) && (
          <Pressable
            onPress={handleMenu}
            hitSlop={8}
            style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.menuDots}>⋮</Text>
          </Pressable>
        )}
      </View>
    </View>
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
      gap: spacing.xs,
      marginLeft: spacing.sm,
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
    menuBtn: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
    },
    menuDots: {
      fontSize: 20,
      color: colors.textMuted,
      lineHeight: 22,
    },
  });
}
