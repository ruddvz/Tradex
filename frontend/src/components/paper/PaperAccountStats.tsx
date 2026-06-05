import { clsx } from 'clsx';
import type { PaperAccount } from '../../types';
import { fetchPaperViolations, type PaperViolationRow } from '../../lib/api/risk';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function PaperAccountStats({
  account,
  openPositions,
  recentFills,
}: {
  account: PaperAccount;
  openPositions: number;
  recentFills: number;
}) {
  const [violations, setViolations] = useState<PaperViolationRow[]>([]);
  const balance = account.balance ?? account.startingBalance;
  const equity = account.equity ?? balance;
  const unrealized = Math.round((equity - balance) * 100) / 100;

  useEffect(() => {
    let cancelled = false;
    void fetchPaperViolations(3)
      .then((rows) => {
        if (!cancelled) setViolations(rows.filter((v) => v.paper_account_id === account.id));
      })
      .catch(() => {
        if (!cancelled) setViolations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [account.id]);

  const stats = [
    { label: 'Virtual balance', value: `$${balance.toLocaleString()}`, sub: account.currency },
    { label: 'Equity', value: `$${equity.toLocaleString()}`, sub: 'mark-to-market' },
    {
      label: 'Unrealized P&L',
      value: `${unrealized >= 0 ? '+' : ''}$${unrealized.toLocaleString()}`,
      sub: 'open positions',
      tone: unrealized >= 0 ? 'profit' : 'loss',
    },
    { label: 'Open positions', value: String(openPositions), sub: `${recentFills} recent fills` },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-surface-border bg-surface/30 p-3">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">{s.label}</p>
            <p
              className={clsx(
                'text-lg font-bold mt-0.5',
                s.tone === 'profit' && 'text-success',
                s.tone === 'loss' && 'text-loss',
                !s.tone && 'text-text-primary'
              )}
            >
              {s.value}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-surface-border bg-surface/20 px-3 py-2 text-[11px] text-text-muted">
        Fill assumptions: spread ×{account.fillSpreadMultiplier ?? 1}, slippage factor{' '}
        {account.fillSlippageFactor ?? 0.5}, commission ${account.fillCommissionPerLot ?? 3.5}/lot —
        simulated, not broker quotes.
      </div>
      {violations.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-xs">
          <span className="text-warn font-semibold">Last violation: </span>
          {violations[0].reason}{' '}
          <Link to="/risk" className="text-analytics hover:underline ml-1">
            Risk Center →
          </Link>
        </div>
      )}
    </div>
  );
}
