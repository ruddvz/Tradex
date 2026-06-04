import type { AppMode } from '../components/status/ModeBadge';

export function resolveAppMode(opts: {
  dataMode: 'demo' | 'live';
  paperModeActive: boolean;
}): AppMode {
  if (opts.dataMode === 'demo') return 'demo';
  if (opts.paperModeActive) return 'paper';
  return 'live_journal';
}
