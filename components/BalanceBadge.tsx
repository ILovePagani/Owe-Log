import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { balanceLabel } from '@/utils/balance';

interface Props {
  netBalance: number;
  compact?: boolean;
}

export function BalanceBadge({ netBalance, compact }: Props) {
  const isPositive = netBalance > 0;
  const isNegative = netBalance < 0;
  const isEven = netBalance === 0;

  const bg = isEven
    ? colors.settledBg
    : isPositive
      ? colors.oweMeBg
      : colors.iOweBg;
  const fg = isEven ? colors.settled : isPositive ? colors.oweMe : colors.iOwe;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, compact && styles.compact]}>
      <Text style={[styles.text, { color: fg }, compact && styles.textCompact]}>
        {balanceLabel(netBalance)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textCompact: {
    fontSize: 13,
  },
});
