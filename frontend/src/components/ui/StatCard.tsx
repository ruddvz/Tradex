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
  default: { icon: 'text-text-muted', bg: 'bg-slate-400/10', border: 'border-slate-400/10', value: 'text-text-primary' },
  profit:  { icon: 'text-success', bg: 'bg-success/10', border: 'border-success/25', value: 'text-success' },
  loss:    { icon: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/25', value: 'text-danger' },
  info:    { icon: 'text-analytics', bg: 'bg-analytics/10', border: 'border-analytics/25', value: 'text-analytics' },
  warn:    { icon: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', value: 'text-warning' },
};

export function StatCard({ title, value, subtitle, trend, trendLabel, icon: Icon, iconColor, variant = 'default', className, size = 'md' }: StatCardProps) {
  const v = variantMap[variant];
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div className={clsx('card p-5 animate-fade-in flex flex-col justify-between min-h-[116px]', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-text-secondary font-medium">{title}</span>
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
          {subtitle && <span className="text-xs text-text-muted">{subtitle}</span>}
          {trend !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 text-xs font-medium',
              isPositiveTrend ? 'text-success' : 'text-danger'
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
