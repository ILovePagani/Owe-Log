import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadEntries, saveEntries } from '@/storage/entries';
import type { Direction, Entry } from '@/types/entry';
import { computeSummaries, normalizePersonKey } from '@/utils/balance';
import { createId } from '@/utils/id';

interface AddEntryInput {
  displayName: string;
  amount: number;
  note: string;
  direction: Direction;
}

interface UpdateEntryInput {
  amount: number;
  note: string;
  direction: Direction;
}

interface EntriesContextValue {
  entries: Entry[];
  summaries: ReturnType<typeof computeSummaries>;
  allSummaries: ReturnType<typeof computeSummaries>;
  loading: boolean;
  personNames: string[];
  addEntry: (input: AddEntryInput) => Promise<void>;
  updateEntry: (id: string, input: UpdateEntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteAllEntriesForPerson: (personKey: string) => Promise<void>;
  settleEntry: (id: string) => Promise<void>;
  archiveEntry: (id: string) => Promise<void>;
  unarchiveEntry: (id: string) => Promise<void>;
  getEntriesForPerson: (personKey: string) => Entry[];
}

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: Entry[]) => {
    setEntries(next);
    await saveEntries(next);
  }, []);

  const addEntry = useCallback(
    async (input: AddEntryInput) => {
      const displayName = input.displayName.trim();
      const personName = normalizePersonKey(displayName);
      const entry: Entry = {
        id: createId(),
        personName,
        displayName: displayName || personName,
        amount: Math.abs(input.amount),
        note: input.note.trim(),
        direction: input.direction,
        createdAt: new Date().toISOString(),
        settledAt: null,
        archived: false,
      };
      await persist([entry, ...entries]);
    },
    [entries, persist]
  );

  const updateEntry = useCallback(
    async (id: string, input: UpdateEntryInput) => {
      const next = entries.map((e) =>
        e.id === id
          ? {
              ...e,
              amount: Math.abs(input.amount),
              note: input.note.trim(),
              direction: input.direction,
            }
          : e
      );
      await persist(next);
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const next = entries.filter((e) => e.id !== id);
      await persist(next);
    },
    [entries, persist]
  );

  const deleteAllEntriesForPerson = useCallback(
    async (personKey: string) => {
      const next = entries.filter((e) => e.personName !== personKey);
      await persist(next);
    },
    [entries, persist]
  );

  const settleEntry = useCallback(
    async (id: string) => {
      const next = entries.map((e) =>
        e.id === id ? { ...e, settledAt: new Date().toISOString() } : e
      );
      await persist(next);
    },
    [entries, persist]
  );

  const archiveEntry = useCallback(
    async (id: string) => {
      const next = entries.map((e) =>
        e.id === id ? { ...e, archived: true } : e
      );
      await persist(next);
    },
    [entries, persist]
  );

  const unarchiveEntry = useCallback(
    async (id: string) => {
      const next = entries.map((e) =>
        e.id === id ? { ...e, archived: false } : e
      );
      await persist(next);
    },
    [entries, persist]
  );

  const getEntriesForPerson = useCallback(
    (personKey: string) =>
      entries
        .filter((e) => e.personName === personKey)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries]
  );

  const summaries = useMemo(() => computeSummaries(entries, false), [entries]);
  const allSummaries = useMemo(() => computeSummaries(entries, true), [entries]);

  const personNames = useMemo(() => {
    const names = new Set<string>();
    for (const e of entries) {
      names.add(e.displayName);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      summaries,
      allSummaries,
      loading,
      personNames,
      addEntry,
      updateEntry,
      deleteEntry,
      deleteAllEntriesForPerson,
      settleEntry,
      archiveEntry,
      unarchiveEntry,
      getEntriesForPerson,
    }),
    [
      entries,
      summaries,
      allSummaries,
      loading,
      personNames,
      addEntry,
      updateEntry,
      deleteEntry,
      deleteAllEntriesForPerson,
      settleEntry,
      archiveEntry,
      unarchiveEntry,
      getEntriesForPerson,
    ]
  );

  return (
    <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
  );
}

export function useEntries(): EntriesContextValue {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider');
  return ctx;
}
