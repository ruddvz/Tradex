import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface MorePageLinkProps {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  status?: string;
  statusTone?: 'profit' | 'loss' | 'warning' | 'neutral';
}

const STATUS: Record<NonNullable<MorePageLinkProps['statusTone']>, string> = {
  profit: 'text-[var(--tx-profit)] bg-[var(--tx-profit-soft)]',
  loss: 'text-[var(--tx-loss)] bg-[var(--tx-loss-soft)]',
  warning: 'text-[var(--tx-warning)] bg-[var(--tx-warning-soft)]',
  neutral: 'text-[var(--tx-text-3)] bg-[var(--tx-surface-2)]',
};

export function MorePageLink({
  path,
  label,
  description,
  icon: Icon,
  status,
  statusTone = 'neutral',
}: MorePageLinkProps) {
  return (
    <Link
      to={path}
      className={clsx(
        'flex min-h-[112px] flex-col justify-between rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)]',
        'bg-[var(--tx-surface-1)] p-4 transition-transform active:scale-[0.99]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--tx-r-14)] bg-[var(--tx-surface-2)]">
          <Icon className="h-5 w-5 text-[var(--tx-text-2)]" aria-hidden />
        </div>
        {status && (
          <span
            className={clsx(
              'rounded-[var(--tx-r-pill)] px-2 py-0.5 text-[10px] font-bold',
              STATUS[statusTone]
            )}
          >
            {status}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-5 text-[var(--tx-text-1)]">{label}</p>
          <p className="mt-0.5 text-xs leading-4 text-[var(--tx-text-3)]">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tx-text-4)]" aria-hidden />
      </div>
    </Link>
  );
}
