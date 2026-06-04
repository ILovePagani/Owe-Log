import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import type { Direction } from '@/types/entry';

interface Props {
  value: Direction;
  onChange: (d: Direction) => void;
}

export function DirectionToggle({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange('they_owe_me')}
        style={[
          styles.pill,
          value === 'they_owe_me' && styles.pillActiveOweMe,
        ]}
      >
        <Text
          style={[
            styles.label,
            value === 'they_owe_me' && styles.labelActiveOweMe,
          ]}
        >
          They owe me
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('i_owe_them')}
        style={[
          styles.pill,
          value === 'i_owe_them' && styles.pillActiveIOwe,
        ]}
      >
        <Text
          style={[
            styles.label,
            value === 'i_owe_them' && styles.labelActiveIOwe,
          ]}
        >
          I owe them
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pillActiveOweMe: {
    backgroundColor: colors.oweMeBg,
    borderColor: colors.oweMe,
  },
  pillActiveIOwe: {
    backgroundColor: colors.iOweBg,
    borderColor: colors.iOwe,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelActiveOweMe: {
    color: colors.oweMe,
    fontWeight: '600',
  },
  labelActiveIOwe: {
    color: colors.iOwe,
    fontWeight: '600',
  },
});
