import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type ColorPalette } from '@/constants/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_H = 48;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

function daysInMonth(month: number, year: number): number {
  // month is 1-indexed
  return new Date(year, month, 0).getDate();
}

export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const now = new Date();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(year !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Drum wheel column ────────────────────────────────────────────────────────

interface WheelProps {
  items: string[];
  initialIndex: number;
  onSelect: (index: number) => void;
  colors: ColorPalette;
}

function WheelColumn({ items, initialIndex, onSelect, colors }: WheelProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to the initially selected item when this column mounts / remounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    }, 60);
    return () => clearTimeout(timeout);
  }, []); // only on mount — parent uses key to force remount when needed

  return (
    <View style={{ flex: 1, height: PICKER_H }}>
      {/* Highlight bar behind the center row */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: ITEM_H * 2,
          left: 4,
          right: 4,
          height: ITEM_H,
          borderRadius: radius.sm,
          backgroundColor: colors.background,
          zIndex: 1,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(Math.max(0, Math.min(items.length - 1, idx)));
        }}
        // Catch slow drags that don't trigger momentum
        onScrollEndDrag={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(Math.max(0, Math.min(items.length - 1, idx)));
        }}
      >
        {items.map((label, index) => (
          <Pressable
            key={index}
            style={{ height: ITEM_H, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => {
              scrollRef.current?.scrollTo({ y: index * ITEM_H, animated: true });
              onSelect(index);
            }}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Public field component ───────────────────────────────────────────────────

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export function DatePickerField({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 11 }, (_, i) => String(currentYear - 5 + i)),
    [currentYear]
  );

  // Picker state — re-synced from props each time the modal opens
  const [monthIdx, setMonthIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [yearIdx, setYearIdx] = useState(5);

  const selectedYear = parseInt(years[yearIdx], 10);
  const days = useMemo(
    () => Array.from({ length: daysInMonth(monthIdx + 1, selectedYear) }, (_, i) => String(i + 1)),
    [monthIdx, selectedYear]
  );

  // Clamp day when month/year changes reduce available days
  const safeDay = Math.min(dayIdx, days.length - 1);

  const handleOpen = () => {
    const [y, m, d] = value.split('-').map(Number);
    const yr = years.indexOf(String(y));
    setMonthIdx(m - 1);
    setDayIdx(d - 1);
    setYearIdx(yr >= 0 ? yr : 5);
    setOpen(true);
  };

  const handleConfirm = () => {
    const year = parseInt(years[yearIdx], 10);
    const month = monthIdx + 1;
    const day = safeDay + 1;
    onChange(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    );
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
      >
        <Text style={styles.fieldText}>{formatDateDisplay(value)}</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tap-away backdrop */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Date</Text>

          <View style={styles.wheelsRow}>
            {/* Month — key forces remount only when modal opens (via `open`) */}
            <WheelColumn
              key={`month-${open}`}
              items={MONTHS}
              initialIndex={monthIdx}
              onSelect={setMonthIdx}
              colors={colors}
            />
            {/* Day — key remounts when month or year changes so clamp + scroll reset work */}
            <WheelColumn
              key={`day-${monthIdx}-${yearIdx}-${open}`}
              items={days}
              initialIndex={safeDay}
              onSelect={setDayIdx}
              colors={colors}
            />
            <WheelColumn
              key={`year-${open}`}
              items={years}
              initialIndex={yearIdx}
              onSelect={setYearIdx}
              colors={colors}
            />
          </View>

          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fieldPressed: { opacity: 0.7 },
    fieldText: {
      fontSize: 17,
      color: colors.text,
    },
    chevron: {
      fontSize: 22,
      color: colors.textMuted,
      marginTop: -2,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl + spacing.md,
    },
    sheetTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    wheelsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    confirmBtn: {
      backgroundColor: colors.accent,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    confirmText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600',
    },
  });
}
