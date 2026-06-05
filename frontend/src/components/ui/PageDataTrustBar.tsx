import { clsx } from 'clsx';
import { DataModeBadge, RealExecutionDisabledNotice } from './DataModeBadge';
import { resolveDataViewMode } from '../../lib/resolveDataViewMode';
import { useStore } from '../../store/useStore';

/** Inline trust strip for pages that need explicit mode labelling below the header. */
export function PageDataTrustBar({ className }: { className?: string }) {
  const { dataMode, paperModeActive } = useStore();
  const viewMode = resolveDataViewMode({ dataMode, paperModeActive });

  return (
    <div className={clsx('px-5 pt-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <DataModeBadge mode={viewMode} showDescription />
        <RealExecutionDisabledNotice className="sm:max-w-md" />
      </div>
    </div>
  );
}
