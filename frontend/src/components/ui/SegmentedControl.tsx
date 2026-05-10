import { clsx } from 'clsx';

export type SegmentedItem = {
  id: string;
  label: string;
};

interface SegmentedControlProps {
  items: SegmentedItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  /** Use purple active state (e.g. AI-related) */
  variant?: 'default' | 'ai';
}

/** Pill-style tab control for Reports (Ui.md §10.5). */
export function SegmentedControl({
  items,
  value,
  onChange,
  className,
  variant = 'default',
}: SegmentedControlProps) {
  return (
    <div
      className={clsx(
        'flex flex-wrap gap-1.5 p-1 rounded-2xl border border-surface-border bg-dark-300/50',
        className
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-base min-h-[40px] sm:min-h-[44px]',
              active && variant === 'default' && 'bg-brand-500/20 text-brand-400 border border-brand-500/35 shadow-glow-sm',
              active && variant === 'ai' && 'bg-ai/20 text-ai border border-ai/35',
              !active && 'text-slate-500 hover:text-slate-200 border border-transparent'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
