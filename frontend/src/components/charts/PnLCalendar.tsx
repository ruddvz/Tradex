import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { mockCalendar } from '../../data/mockData';
import { clsx } from 'clsx';

const CalendarDay = ({ day, data }: { day: Date; data: typeof mockCalendar[0] | undefined }) => {
  if (!data || !data.isTrading) {
    return (
      <div className="aspect-square rounded-md bg-transparent flex flex-col items-center justify-center p-0.5">
        <span className="text-[9px] text-slate-600">{format(day, 'd')}</span>
      </div>
    );
  }

  const isProfit = data.pnl >= 0;
  const intensity = Math.min(Math.abs(data.pnl) / 300, 1);
  const opacity = 0.2 + intensity * 0.7;

  return (
    <div
      className={clsx(
        'aspect-square rounded-md flex flex-col items-center justify-center p-0.5 cursor-pointer transition-all duration-200 hover:scale-110 relative group',
      )}
      style={{
        background: isProfit
          ? `rgba(16, 185, 129, ${opacity})`
          : `rgba(239, 68, 68, ${opacity})`,
        border: `1px solid ${isProfit ? `rgba(16,185,129,${opacity * 0.6})` : `rgba(239,68,68,${opacity * 0.6})`}`,
      }}
    >
      <span className="text-[9px] font-medium text-white/80">{format(day, 'd')}</span>
      <span className={clsx('text-[8px] font-bold', isProfit ? 'text-white' : 'text-white')}>
        {isProfit ? '+' : ''}{data.pnl >= 0 ? '' : '-'}${Math.abs(data.pnl).toFixed(0)}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs whitespace-nowrap shadow-card">
          <div className="text-slate-400">{format(day, 'MMM dd, yyyy')}</div>
          <div className={clsx('font-semibold', isProfit ? 'text-brand-400' : 'text-red-400')}>
            {isProfit ? '+' : ''}${data.pnl.toFixed(2)}
          </div>
          <div className="text-slate-500">{data.trades} trades</div>
        </div>
      </div>
    </div>
  );
};

export function PnLCalendar() {
  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
  const dataMap = useMemo(() => {
    const m = new Map<string, typeof mockCalendar[0]>();
    mockCalendar.forEach(d => m.set(d.date, d));
    return m;
  }, []);

  const firstDayOfWeek = getDay(days[0]);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{format(today, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-brand-500/60" />
            <span className="text-slate-500">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500/60" />
            <span className="text-slate-500">Loss</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-600 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          return (
            <CalendarDay key={dateStr} day={day} data={dataMap.get(dateStr)} />
          );
        })}
      </div>
    </div>
  );
}
