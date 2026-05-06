import { clsx } from 'clsx';

type BadgeVariant = 'profit' | 'loss' | 'neutral' | 'info' | 'warn' | 'purple';

const variantStyles: Record<BadgeVariant, string> = {
  profit:  'bg-brand-500/15 text-brand-400 border-brand-500/30',
  loss:    'bg-red-500/15 text-red-400 border-red-500/30',
  neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  info:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  warn:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  purple:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'xs' | 'sm';
}

export function Badge({ children, variant = 'neutral', className, size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full border font-semibold',
      size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}

export function DirectionBadge({ direction }: { direction: 'BUY' | 'SELL' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
      direction === 'BUY' ? 'bg-brand-500/20 text-brand-400' : 'bg-red-500/20 text-red-400'
    )}>
      {direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: string }) {
  const variants: Record<string, string> = {
    A: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    B: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    C: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    D: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    F: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={clsx('inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border', variants[grade] || variants.C)}>
      {grade}
    </span>
  );
}

export function PnlBadge({ value }: { value: number }) {
  const isProfit = value >= 0;
  return (
    <span className={clsx(
      'font-semibold font-mono text-sm',
      isProfit ? 'text-brand-400' : 'text-red-400'
    )}>
      {isProfit ? '+' : ''}${Math.abs(value).toFixed(2)}
    </span>
  );
}
