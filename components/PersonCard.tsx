import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { PersonSummary } from '@/types/entry';
import { formatMoney } from '@/utils/balance';
import { BalanceBadge } from './BalanceBadge';

interface Props {
  summary: PersonSummary;
  onPress: () => void;
}

export function PersonCard({ summary, onPress }: Props) {
  const { displayName, netBalance, unsettledCount } = summary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.meta}>
            {unsettledCount === 0
              ? 'All settled'
              : `${unsettledCount} open ${unsettledCount === 1 ? 'tab' : 'tabs'}`}
          </Text>
        </View>
        <Text
          style={[
            styles.amount,
            netBalance > 0 && { color: colors.oweMe },
            netBalance < 0 && { color: colors.iOwe },
            netBalance === 0 && { color: colors.settled },
          ]}
        >
          {netBalance === 0 ? 'Even' : formatMoney(netBalance)}
        </Text>
      </View>
      {netBalance !== 0 && (
        <View style={styles.badgeWrap}>
          <BalanceBadge netBalance={netBalance} compact />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  initial: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
  },
  badgeWrap: {
    marginTop: spacing.sm,
    marginLeft: 44 + spacing.md,
  },
});
