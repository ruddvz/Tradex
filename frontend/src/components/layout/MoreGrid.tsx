import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export type MoreGridItem = {
  path: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  status?: string;
  statusTone?: 'profit' | 'loss' | 'warning' | 'neutral';
};

export type MoreGridSection = {
  title: string;
  items: MoreGridItem[];
};

const STATUS: Record<NonNullable<MoreGridItem['statusTone']>, string> = {
  profit: 'text-[var(--tx-profit)] bg-[var(--tx-profit-soft)]',
  loss: 'text-[var(--tx-loss)] bg-[var(--tx-loss-soft)]',
  warning: 'text-[var(--tx-warning)] bg-[var(--tx-warning-soft)]',
  neutral: 'text-[var(--tx-text-3)] bg-[var(--tx-surface-2)]',
};

export function MoreGrid({ sections }: { sections: MoreGridSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.06em] text-[var(--tx-text-4)]">
            {section.title}
          </h2>
          <div className="overflow-hidden rounded-[var(--tx-radius-md)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] divide-y divide-[var(--tx-line-1)]">
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3.5 min-h-[60px] active:bg-[var(--tx-surface-2)] transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tx-radius-sm)] bg-[var(--tx-surface-2)]">
                  <item.icon className="h-5 w-5 text-[var(--tx-text-2)]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--tx-text-1)]">{item.label}</p>
                  <p className="text-xs text-[var(--tx-text-3)]">{item.subtitle}</p>
                </div>
                {item.status && (
                  <span
                    className={clsx(
                      'shrink-0 rounded-[var(--tx-radius-pill)] px-2 py-0.5 text-[10px] font-bold',
                      STATUS[item.statusTone ?? 'neutral']
                    )}
                  >
                    {item.status}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tx-text-4)]" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
