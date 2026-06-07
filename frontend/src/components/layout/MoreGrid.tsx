import type { LucideIcon } from 'lucide-react';
import { MorePageLink } from './MorePageLink';

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

export function MoreGrid({ sections }: { sections: MoreGridSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.06em] text-[var(--tx-text-4)]">
            {section.title}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map((item) => (
              <MorePageLink
                key={item.path}
                path={item.path}
                label={item.label}
                description={item.subtitle}
                icon={item.icon}
                status={item.status}
                statusTone={item.statusTone}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
