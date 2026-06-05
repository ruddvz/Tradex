import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { DataModeBadge } from '../components/ui/DataModeBadge';
import { useStore } from '../store/useStore';
import { computeMetrics } from '../lib/metricsFromTrades';
import { EmptyState } from '../components/common/EmptyState';

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

function fmtMoney(n: number) {
  return `${n >= 0 ? '+' : ''}$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function PerformanceCompare() {
  const { trades, metrics, dataMode, paperAccounts } = useStore();

  const journalTrades = useMemo(
    () => trades.filter((t) => !t.source || !['paper', 'backtest'].includes(t.source)),
    [trades]
  );
  const paperTrades = useMemo(() => trades.filter((t) => t.source === 'paper'), [trades]);
  const journalMetrics = useMemo(() => computeMetrics(journalTrades), [journalTrades]);
  const paperMetrics = useMemo(() => computeMetrics(paperTrades), [paperTrades]);

  const rows = [
    { label: 'Win rate', journal: fmtPct(journalMetrics.winRate), paper: fmtPct(paperMetrics.winRate), backtest: '—' },
    {
      label: 'Profit factor',
      journal: journalMetrics.profitFactor.toFixed(2),
      paper: paperMetrics.profitFactor.toFixed(2),
      backtest: '—',
    },
    {
      label: 'Max drawdown',
      journal: fmtPct(journalMetrics.maxDrawdownPercent),
      paper: fmtPct(paperMetrics.maxDrawdownPercent),
      backtest: 'Run backtest',
    },
    { label: 'Avg R', journal: journalMetrics.avgRR.toFixed(2), paper: paperMetrics.avgRR.toFixed(2), backtest: '—' },
    { label: 'Trades', journal: String(journalMetrics.totalTrades), paper: String(paperMetrics.totalTrades), backtest: '—' },
    { label: 'Net P&L', journal: fmtMoney(journalMetrics.totalPnl), paper: fmtMoney(paperMetrics.totalPnl), backtest: '—' },
  ];

  const hasAny = journalTrades.length > 0 || paperTrades.length > 0 || paperAccounts.length > 0;

  return (
    <div className="min-h-screen">
      <Header
        title="Performance compare"
        subtitle="Backtest vs paper vs imported journal — spot when simulation diverges"
        showDateRange={false}
      />
      <div className="page-shell p-6 space-y-6 pb-28 md:pb-6">
        <DataModeBadge mode={dataMode === 'demo' ? 'demo' : 'live_journal'} showDescription />
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-amber-100/90">
          Backtest column shows placeholders until you select a run on the Backtests page. Paper and journal metrics
          are computed from your trade history — not live broker data.
        </div>

        {!hasAny && dataMode === 'demo' && (
          <EmptyState
            title="Demo comparison preview"
            body="Sign in and add journal or paper trades to compare performance across modes."
            actions={
              <Link to="/auth" className="btn-primary text-sm">
                Sign in
              </Link>
            }
          />
        )}

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase text-text-muted">
                <th className="p-3">Metric</th>
                <th className="p-3">Imported journal</th>
                <th className="p-3">Paper</th>
                <th className="p-3">Backtest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-surface-border/60">
                  <td className="p-3 font-medium text-text-primary">{r.label}</td>
                  <td className="p-3 text-text-secondary">{r.journal}</td>
                  <td className="p-3 text-analytics">{r.paper}</td>
                  <td className="p-3 text-purple-200">
                    {r.backtest === 'Run backtest' ? (
                      <Link to="/backtests" className="hover:underline">
                        Run backtest →
                      </Link>
                    ) : (
                      r.backtest
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dataMode === 'live' && metrics.totalTrades === 0 && paperTrades.length === 0 && (
          <EmptyState
            title="No trades to compare yet"
            body="Import MT5 history, close paper positions, or run a backtest to populate this table."
            actions={
              <>
                <Link to="/journal" className="btn-primary text-sm">
                  Journal
                </Link>
                <Link to="/paper-trading" className="btn-secondary text-sm">
                  Paper trading
                </Link>
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
