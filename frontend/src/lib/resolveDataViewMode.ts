import type { DataViewMode } from '../components/ui/DataModeBadge';

export function resolveDataViewMode(opts: {
  dataMode: 'demo' | 'live';
  paperModeActive: boolean;
  pageOverride?: DataViewMode;
}): DataViewMode {
  if (opts.pageOverride) return opts.pageOverride;
  if (opts.dataMode === 'demo') return 'demo';
  if (opts.paperModeActive) return 'paper';
  return 'live_journal';
}
