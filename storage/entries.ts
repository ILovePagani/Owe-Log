import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Entry } from '@/types/entry';

const STORAGE_KEY = '@owe_log_entries_v1';

export async function loadEntries(): Promise<Entry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
