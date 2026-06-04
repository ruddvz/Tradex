import { parseISO, format } from 'date-fns';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { mockCalendar } from '../../data/mockData';

export function WeeklyPerformanceStrip() {
  const { dataMode, calendarDays } = useStore();
  const source = dataMode === 'live' && calendarDays.length > 0 ? calendarDays : mockCalendar;
  const week = source.slice(-7);

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
                  tone === 'profit' && 'bg-success/25 border-success/40',
                  tone === 'loss' && 'bg-danger/20 border-danger/40'
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
