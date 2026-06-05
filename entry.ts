/** Direction of money flow relative to you */
export type Direction = 'they_owe_me' | 'i_owe_them';

/** A single tab / IOU between you and one friend */
export interface Entry {
  id: string;
  /** Lowercase key for grouping (trimmed) */
  personName: string;
  /** Original casing for display */
  displayName: string;
  amount: number;
  note: string;
  direction: Direction;
  createdAt: string;
  /** User-selected date for the entry (YYYY-MM-DD). Falls back to createdAt if absent. */
  entryDate: string;
  settledAt: string | null;
  /** Settled entries can be archived (hidden from default views) */
  archived: boolean;
}

/** Aggregated balance for the home screen */
export interface PersonSummary {
  personKey: string;
  displayName: string;
  netBalance: number;
  unsettledCount: number;
  lastActivity: string;
}
