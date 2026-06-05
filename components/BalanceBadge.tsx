import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type ColorPalette } from '@/constants/theme';
import { balanceLabel } from '@/utils/balance';

interface Props {
  netBalance: number;
  compact?: boolean;
}

export function BalanceBadge({ netBalance, compact }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
}
