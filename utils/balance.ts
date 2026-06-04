import type { Entry, PersonSummary } from '@/types/entry';

/** Signed amount for net balance (unsettled, non-archived only) */
export function entrySignedAmount(entry: Entry): number {
  if (entry.settledAt || entry.archived) return 0;
  return entry.direction === 'they_owe_me' ? entry.amount : -entry.amount;
}

export function normalizePersonKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Format currency for display */
export function formatMoney(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
  return `$${formatted}`;
}

/** Label for net balance on home / person header */
export function balanceLabel(netBalance: number): string {
  if (netBalance === 0) return 'Even';
  if (netBalance > 0) return `Owes you ${formatMoney(netBalance)}`;
  return `You owe ${formatMoney(netBalance)}`;
}

/** One-line share text for stretch / copy */
export function shareSummaryText(displayName: string, netBalance: number): string {
  if (netBalance === 0) return `You and ${displayName} are even.`;
  if (netBalance > 0) return `${displayName} owes you ${formatMoney(netBalance)} total.`;
  return `You owe ${displayName} ${formatMoney(netBalance)} total.`;
}

/** Build home-screen summaries from all entries */
export function computeSummaries(entries: Entry[]): PersonSummary[] {
  const map = new Map<
    string,
    { displayName: string; balance: number; count: number; last: string }
  >();

  for (const entry of entries) {
    const key = entry.personName;
    const existing = map.get(key) ?? {
      displayName: entry.displayName,
      balance: 0,
      count: 0,
      last: entry.createdAt,
    };

    existing.balance += entrySignedAmount(entry);
    if (!entry.settledAt && !entry.archived) {
      existing.count += 1;
    }
    if (entry.createdAt > existing.last) {
      existing.last = entry.createdAt;
      existing.displayName = entry.displayName;
    }
    map.set(key, existing);
  }

  return [...map.entries()]
    .map(([personKey, data]) => ({
      personKey,
      displayName: data.displayName,
      netBalance: data.balance,
      unsettledCount: data.count,
      lastActivity: data.last,
    }))
    .filter((p) => p.unsettledCount > 0 || p.netBalance !== 0)
    .sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));
}
