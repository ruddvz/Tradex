import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { TxCard } from '../ui/TxCard';

export interface ReportMetricItem {
  label: string;
  value: string;
  up: boolean;
  icon: LucideIcon;
}

interface ReportMetricGridProps {
  items: ReportMetricItem[];
}

export function ReportMetricGrid({ items }: ReportMetricGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((row) => (
        <TxCard key={row.label}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">{row.label}</span>
            <row.icon className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className={clsx('text-xl font-bold', row.up ? 'text-brand-400' : 'text-red-400')}>
            {row.value}
          </div>
        </TxCard>
      ))}
    </div>
  );
}
