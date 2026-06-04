import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ title, body, icon, actions, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-dashed border-surface-border bg-surface/40 px-6 py-10 text-center',
        className
      )}
    >
      {icon && <div className="flex justify-center mb-3 text-text-muted">{icon}</div>}
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {body && <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">{body}</p>}
      {actions && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
