import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DatePickerField, todayDateString } from '@/components/DatePickerField';
import { DirectionToggle } from '@/components/DirectionToggle';
import { useEntries } from '@/context/EntriesContext';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, type ColorPalette } from '@/constants/theme';
import type { Direction } from '@/types/entry';

export default function AddEntryScreen() {
  const router = useRouter();
  const { name: prefillName, id: editId } = useLocalSearchParams<{
    name?: string;
    id?: string;
  }>();

  const { addEntry, updateEntry, getEntry } = useEntries();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isEdit = !!editId;
  const existingEntry = editId ? getEntry(editId) : undefined;

  // Form state — pre-filled when editing
  const [displayName, setDisplayName] = useState(
    existingEntry?.displayName ?? prefillName ?? ''
  );
  const [amountText, setAmountText] = useState(
    existingEntry ? String(existingEntry.amount) : ''
  );
  const [note, setNote] = useState(existingEntry?.note ?? '');
  const [direction, setDirection] = useState<Direction>(
    existingEntry?.direction ?? 'they_owe_me'
  );
  const [entryDate, setEntryDate] = useState<string>(
    existingEntry?.entryDate ?? todayDateString()
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const name = displayName.trim();
    const amount = parseFloat(amountText.replace(/,/g, ''));

    if (!name) {
      Alert.alert('Name needed', 'Who is this tab with?');
      return;
    }
    if (!amountText || Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Amount needed', 'Enter a positive amount.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editId) {
        await updateEntry(editId, { displayName: name, amount, note, direction, entryDate });
      } else {
        await addEntry({ displayName: name, amount, note, direction, entryDate });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Override the layout's static title based on mode */}
      <Stack.Screen options={{ title: isEdit ? 'Edit tab' : 'New tab' }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Person</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Jake"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={amountText}
            onChangeText={setAmountText}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Date</Text>
          <DatePickerField value={entryDate} onChange={setEntryDate} />

          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Dinner, Uber, etc."
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <Text style={styles.label}>Direction</Text>
          <DirectionToggle value={direction} onChange={setDirection} />

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.savePressed,
              saving && styles.saveDisabled,
            ]}
          >
            <Text style={styles.saveText}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save tab'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1 },
    scroll: {
      padding: spacing.md,
      paddingBottom: spacing.xl * 2,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 17,
      color: colors.text,
    },
    noteInput: {
      minHeight: 72,
      textAlignVertical: 'top',
    },
    saveBtn: {
      marginTop: spacing.xl,
      backgroundColor: colors.accent,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    savePressed: { opacity: 0.85 },
    saveDisabled: { opacity: 0.6 },
    saveText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600',
    },
  });
}
