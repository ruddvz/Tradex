import type { Playbook } from '../types';
import type { PlaybookRow } from './api/playbooks';
import { derivePlaybooksFromTrades } from './derivePlaybooksFromTrades';
import type { Trade } from '../types';

/**
 * Merge API playbooks with journal-derived cards (skip derived names already saved).
 */
export function mergePlaybooks(saved: PlaybookRow[], trades: Trade[]): Playbook[] {
  const savedNames = new Set(saved.map((p) => p.name.toLowerCase()));
  const savedTags = new Set(
    saved.map((p) => (p.strategyTag || '').trim().toLowerCase()).filter(Boolean)
  );
  const derived = derivePlaybooksFromTrades(trades).filter((d) => {
    if (savedNames.has(d.name.toLowerCase())) return false;
    const tag = d.name === 'Unlabeled' ? 'unlabeled' : d.name.toLowerCase();
    if (savedTags.has(tag)) return false;
    return true;
  });
  return [...saved, ...derived];
}
