import { parseISO, format } from 'date-fns';
import { clsx } from 'clsx';
import { mockCalendar } from '../../data/mockData';

/** GitHub-style week dots — last 7 calendar days from mock data */
export function WeeklyPerformanceStrip() {
  const week = mockCalendar.slice(-7);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="section-title text-base">Weekly performance</h3>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Last 7 days
        </span>
      </div>
      <div className="flex gap-2 justify-between">
        {week.map((d) => {
          const tone = !d.isTrading ? 'muted' : d.pnl >= 0 ? 'profit' : 'loss';
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div
                className={clsx(
                  'w-full max-w-[44px] mx-auto aspect-square rounded-lg border transition-colors',
                  tone === 'muted' && 'bg-bg-input/90 border-[rgba(126,146,185,0.18)]',
                  tone === 'profit' && 'bg-success/25 border-success/40 shadow-[0_0_0_1px_rgba(45,212,163,0.28)]',
                  tone === 'loss' && 'bg-danger/20 border-danger/40 shadow-[0_0_0_1px_rgba(239,95,95,0.32)]'
                )}
                title={
                  d.isTrading
                    ? `${format(parseISO(d.date), 'MMM d')}: ${d.pnl >= 0 ? '+' : ''}$${d.pnl.toFixed(0)}`
                    : `${format(parseISO(d.date), 'MMM d')}: no trades`
                }
              />
              <span className="text-[10px] font-medium text-text-muted truncate w-full text-center">
                {format(parseISO(d.date), 'EEE')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
