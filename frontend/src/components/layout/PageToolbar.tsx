import { clsx } from 'clsx';
import { SlidersHorizontal } from 'lucide-react';
import { TxChip } from '../ui/TxChip';
import { TxIconButton } from '../ui/TxIconButton';

interface PageToolbarProps {
  children?: React.ReactNode;
  onFilter?: () => void;
  filterLabel?: string;
  chips?: Array<{ id: string; label: string; selected?: boolean; onClick: () => void }>;
  trailing?: React.ReactNode;
  className?: string;
}

/** Mobile-first toolbar — date ranges and filters live here, not in the header. */
export function PageToolbar({
  children,
  onFilter,
  filterLabel = 'Filters',
  chips,
  trailing,
  className,
}: PageToolbarProps) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 px-[var(--tx-page-x)] md:px-[var(--tx-page-x-desktop)]',
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {onFilter && (
          <TxIconButton
            icon={SlidersHorizontal}
            label={filterLabel}
            variant="glass"
            size="md"
            onClick={onFilter}
          />
        )}
        {chips?.map((chip) => (
          <TxChip key={chip.id} selected={chip.selected} onClick={chip.onClick}>
            {chip.label}
          </TxChip>
        ))}
        {children}
        {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
      </div>
    </div>
  );
}
