import { clsx } from 'clsx';

export interface TxTabItem {
  id: string;
  label: string;
}

interface TxTabsProps {
  items: TxTabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export function TxTabs({ items, value, onChange, variant = 'pill', className }: TxTabsProps) {
  return (
    <div
      role="tablist"
      className={clsx(
        'flex gap-1 overflow-x-auto no-scrollbar',
        variant === 'underline' && 'border-b border-[var(--tx-line-1)]',
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={clsx(
              'shrink-0 min-h-[40px] px-3 text-sm font-semibold transition-colors',
              variant === 'pill' && 'rounded-[var(--tx-r-pill)]',
              variant === 'pill' &&
                active &&
                'bg-[var(--tx-brand-soft)] text-[var(--tx-brand-text)]',
              variant === 'pill' && !active && 'text-[var(--tx-text-4)]',
              variant === 'underline' &&
                active &&
                'border-b-2 border-[var(--tx-brand)] text-[var(--tx-text-1)]',
              variant === 'underline' && !active && 'text-[var(--tx-text-4)]'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
