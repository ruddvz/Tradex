/** Shared numeric / currency formatters for cockpit UI. */

export function formatPnl(value: number, currency = '$'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${currency}${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function sampleSizeLabel(count: number): string {
  if (count >= 80) return `Strong signal: ${count} trades`;
  if (count >= 20) return `Based on ${count} trades`;
  if (count >= 5) return `Weak signal: only ${count} examples`;
  return `Insufficient data: ${count} trades`;
}
