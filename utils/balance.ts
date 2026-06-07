import type { Entry, PersonSummary } from '@/types/entry';

/** Signed amount for net balance (unsettled, non-archived only) */
export function entrySignedAmount(entry: Entry): number {
  if (entry.settledAt || entry.archived) return 0;
  return entry.direction === 'they_owe_me' ? entry.amount : -entry.amount;
}

export function normalizePersonKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Format currency for display — symbol defaults to '$' */
export function formatMoney(amount: number, symbol = '$'): string {
  const abs = Math.abs(amount);
  const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(2);
  return `${symbol}${formatted}`;
}

/** Label for net balance on home / person header */
export function balanceLabel(netBalance: number, symbol = '$'): string {
  if (netBalance === 0) return 'Even';
  if (netBalance > 0) return `Owes you ${formatMoney(netBalance, symbol)}`;
  return `You owe ${formatMoney(netBalance, symbol)}`;
}

/** One-line share text */
export function shareSummaryText(displayName: string, netBalance: number, symbol = '$'): string {
  if (netBalance === 0) return `You and ${displayName} are even.`;
  if (netBalance > 0) return `${displayName} owes you ${formatMoney(netBalance, symbol)} total.`;
  return `You owe ${displayName} ${formatMoney(Math.abs(netBalance), symbol)} total.`;
}

/** Build home-screen summaries from all entries */
export function computeSummaries(entries: Entry[], includeSettled = false): PersonSummary[] {
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
    .filter((p) => includeSettled || p.unsettledCount > 0 || p.netBalance !== 0)
    .sort((a, b) => {
      // Active entries first, then by absolute balance
      const aActive = a.unsettledCount > 0 || a.netBalance !== 0;
      const bActive = b.unsettledCount > 0 || b.netBalance !== 0;
      if (aActive !== bActive) return aActive ? -1 : 1;
      return Math.abs(b.netBalance) - Math.abs(a.netBalance);
    });
}
