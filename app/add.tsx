import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { DirectionToggle } from '@/components/DirectionToggle';
import { useEntries } from '@/context/EntriesContext';
import { colors, radius, spacing } from '@/constants/theme';
import type { Direction } from '@/types/entry';

export default function AddEntryScreen() {
  const router = useRouter();
  const { name: prefillName } = useLocalSearchParams<{ name?: string }>();
  const { addEntry } = useEntries();

  const [displayName, setDisplayName] = useState(prefillName ?? '');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [direction, setDirection] = useState<Direction>('they_owe_me');
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
      await addEntry({ displayName: name, amount, note, direction });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
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
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save tab'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
