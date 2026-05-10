import { clsx } from 'clsx';

interface RiskPathProps {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  isLong: boolean;
  className?: string;
}

function fmt(n: number) {
  if (n >= 1000) return n.toFixed(0);
  if (n >= 10) return n.toFixed(2);
  return n.toFixed(5);
}

/** Horizontal SL — Entry — TP path (Ui.md §10.6). */
export function RiskPath({ entry, stopLoss, takeProfit, isLong, className }: RiskPathProps) {
  const min = Math.min(entry, stopLoss, takeProfit);
  const max = Math.max(entry, stopLoss, takeProfit);
  const span = max - min || 1;
  const pad = span * 0.1;
  const lo = min - pad;
  const hi = max + pad;
  const w = hi - lo;

  const pSL = ((stopLoss - lo) / w) * 100;
  const pE = ((entry - lo) / w) * 100;
  const pTP = ((takeProfit - lo) / w) * 100;

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span>Risk path</span>
        <span className="normal-case font-medium text-slate-600">{isLong ? 'Long' : 'Short'}</span>
      </div>
      <div className="relative h-14 rounded-2xl bg-dark-300/90 border border-surface-border overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-600/50" aria-hidden />
        {[pSL, pE, pTP].map((p, i) => (
          <div
            key={['sl', 'en', 'tp'][i]}
            className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 z-10"
            style={{ left: `${p}%` }}
          >
            <div
              className={clsx(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 shadow-lg',
                i === 0 && 'bg-danger border-danger/80',
                i === 1 && 'bg-analytics border-analytics/80',
                i === 2 && 'bg-success border-success/80'
              )}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2 text-[11px] text-slate-400">
        <span>
          <span className="text-danger font-semibold">SL</span> {fmt(stopLoss)}
        </span>
        <span>
          <span className="text-analytics font-semibold">Entry</span> {fmt(entry)}
        </span>
        <span>
          <span className="text-success font-semibold">TP</span> {fmt(takeProfit)}
        </span>
      </div>
    </div>
  );
}
