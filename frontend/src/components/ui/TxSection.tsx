import { clsx } from 'clsx';

interface TxSectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TxSection({ title, subtitle, action, children, className }: TxSectionProps) {
  return (
    <section className={clsx('space-y-3', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold text-[var(--tx-text-1)]">{title}</h2>}
            {subtitle && <p className="text-xs text-[var(--tx-text-3)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
