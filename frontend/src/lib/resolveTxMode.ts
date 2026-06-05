import type { TxMode } from '../components/status/TxModePill';

/** Map app store state to TxMode pill. */
export function resolveTxMode(input: {
  dataMode: 'demo' | 'live';
  paperModeActive?: boolean;
  liveReadinessPassed?: boolean;
  liveBlocked?: boolean;
}): TxMode {
  if (input.dataMode === 'demo') return 'demo';
  if (input.liveBlocked) return 'liveBlocked';
  if (input.paperModeActive) return 'paper';
  if (!input.liveReadinessPassed) return 'liveLocked';
  return 'liveReady';
}
