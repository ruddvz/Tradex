import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  variant?: 'default' | 'profit' | 'loss' | 'info' | 'warn';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const variantMap = {
  default: { icon: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/10', value: 'text-white' },
  profit:  { icon: 'text-brand-400', bg: 'bg-brand-400/10', border: 'border-brand-500/20', value: 'text-brand-400' },
  loss:    { icon: 'text-red-400',   bg: 'bg-red-400/10',   border: 'border-red-500/20',   value: 'text-red-400'   },
  info:    { icon: 'text-blue-400',  bg: 'bg-blue-400/10',  border: 'border-blue-500/20',  value: 'text-blue-400'  },
  warn:    { icon: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20', value: 'text-amber-400' },
};

export function StatCard({ title, value, subtitle, trend, trendLabel, icon: Icon, iconColor, variant = 'default', className, size = 'md' }: StatCardProps) {
  const v = variantMap[variant];
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div className={clsx('card p-5 animate-fade-in flex flex-col justify-between min-h-[116px]', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-400 font-medium">{title}</span>
        {Icon && (
          <div className={clsx('p-2 rounded-lg', v.bg)}>
            <Icon className={clsx('w-4 h-4', iconColor || v.icon)} />
          </div>
        )}
      </div>

      <div className={clsx(
        'font-bold',
        size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl',
        v.value
      )}>
        {value}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center justify-between mt-2">
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          {trend !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 text-xs font-medium',
              isPositiveTrend ? 'text-brand-400' : 'text-red-400'
            )}>
              {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositiveTrend ? '+' : ''}{trend}% {trendLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
