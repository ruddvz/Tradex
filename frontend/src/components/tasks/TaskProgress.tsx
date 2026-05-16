import { clsx } from 'clsx';

interface TaskProgressProps {
  completed: number;
  total: number;
  className?: string;
}

export function TaskProgress({ completed, total, className }: TaskProgressProps) {
  const pct = total <= 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Progress</span>
        <span className="text-slate-400 font-medium">
          {completed}/{total} steps · {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-dark-300 overflow-hidden border border-surface-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
