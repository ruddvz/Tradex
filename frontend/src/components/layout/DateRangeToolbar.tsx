import { useStore } from '../../store/useStore';
import { PageToolbar } from './PageToolbar';
import { TxSegmentedControl } from '../ui/TxSegmentedControl';

const RANGES = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'all', label: 'All' },
] as const;

export function DateRangeToolbar({ className }: { className?: string }) {
  const { selectedDateRange, setDateRange } = useStore();
  return (
    <PageToolbar className={className}>
      <TxSegmentedControl
        items={[...RANGES]}
        value={selectedDateRange}
        onChange={(id) => setDateRange(id as (typeof RANGES)[number]['id'])}
        className="min-w-0 flex-1"
      />
    </PageToolbar>
  );
}
