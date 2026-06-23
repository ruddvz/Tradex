import type { Trade } from '../types';

/** Columns exported to CSV, in order. Keep flat + spreadsheet-friendly. */
const COLUMNS: { key: keyof Trade; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'direction', label: 'Direction' },
  { key: 'status', label: 'Result' },
  { key: 'grade', label: 'Grade' },
  { key: 'entryTime', label: 'Entry Time' },
  { key: 'exitTime', label: 'Exit Time' },
  { key: 'entryPrice', label: 'Entry Price' },
  { key: 'exitPrice', label: 'Exit Price' },
  { key: 'lotSize', label: 'Lot Size' },
  { key: 'stopLoss', label: 'Stop Loss' },
  { key: 'takeProfit', label: 'Take Profit' },
  { key: 'pnl', label: 'PnL' },
  { key: 'pnlPercent', label: 'PnL %' },
  { key: 'rMultiple', label: 'R Multiple' },
  { key: 'riskReward', label: 'Risk/Reward' },
  { key: 'commission', label: 'Commission' },
  { key: 'swap', label: 'Swap' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'setup', label: 'Setup' },
  { key: 'session', label: 'Session' },
  { key: 'emotion', label: 'Emotion' },
  { key: 'broker', label: 'Broker' },
  { key: 'account', label: 'Account' },
  { key: 'source', label: 'Source' },
  { key: 'tags', label: 'Tags' },
  { key: 'notes', label: 'Notes' },
];

/** RFC-4180-safe cell: wrap in quotes and escape embedded quotes. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join('; ') : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Serialize trades into a CSV string with a header row. */
export function tradesToCsv(trades: Trade[]): string {
  const header = COLUMNS.map((c) => c.label).join(',');
  const rows = trades.map((t) => COLUMNS.map((c) => escapeCell(t[c.key])).join(','));
  return [header, ...rows].join('\r\n');
}

/** Trigger a client-side download of `content` as a file. */
export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Export trades to a timestamped CSV download. Returns the number of rows. */
export function exportTradesCsv(trades: Trade[]): number {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(tradesToCsv(trades), `tradex-trades-${stamp}.csv`);
  return trades.length;
}
