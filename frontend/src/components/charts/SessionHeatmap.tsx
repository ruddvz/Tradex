import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

const sessions = ['London', 'New York', 'Tokyo', 'Overlap', 'Sydney'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function SessionHeatmap() {
  const { trades } = useStore();

  const heatmapData = useMemo(() => {
    const data: Record<string, Record<string, { pnl: number; count: number }>> = {};
    sessions.forEach(s => {
      data[s] = {};
      days.forEach(d => { data[s][d] = { pnl: 0, count: 0 }; });
    });

    trades.forEach(t => {
      const date = new Date(t.entryTime);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      if (data[t.session]?.[dayName]) {
        data[t.session][dayName].pnl += t.pnl;
        data[t.session][dayName].count++;
      }
    });
    return data;
  }, [trades]);

  const maxAbs = useMemo(() => {
    let max = 0;
    sessions.forEach(s => days.forEach(d => {
      const v = Math.abs(heatmapData[s][d].pnl);
      if (v > max) max = v;
    }));
    return max || 1;
  }, [heatmapData]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        {/* Header */}
        <div className="grid grid-cols-6 gap-1 mb-1">
          <div />
          {days.map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
          ))}
        </div>

        {/* Rows */}
        {sessions.map(session => (
          <div key={session} className="grid grid-cols-6 gap-1 mb-1">
            <div className="flex items-center text-xs text-slate-500 font-medium pr-2 justify-end">{session.slice(0, 3)}</div>
            {days.map(day => {
              const cell = heatmapData[session][day];
              const intensity = Math.abs(cell.pnl) / maxAbs;
              const isProfit = cell.pnl >= 0;
              return (
                <div
                  key={day}
                  className="aspect-square rounded-md flex items-center justify-center cursor-pointer relative group"
                  style={{
                    background: cell.count === 0
                      ? 'rgba(42,53,80,0.3)'
                      : isProfit
                        ? `rgba(16,185,129,${0.1 + intensity * 0.8})`
                        : `rgba(239,68,68,${0.1 + intensity * 0.8})`,
                  }}
                >
                  {cell.count > 0 && (
                    <span className="text-[10px] font-bold text-white/80">{cell.count}</span>
                  )}
                  {cell.count > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 pointer-events-none">
                      <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs whitespace-nowrap shadow-card">
                        <div className="text-slate-400">{session} · {day}</div>
                        <div className={clsx('font-semibold', isProfit ? 'text-brand-400' : 'text-red-400')}>
                          {isProfit ? '+' : ''}${cell.pnl.toFixed(0)}
                        </div>
                        <div className="text-slate-500">{cell.count} trades</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
