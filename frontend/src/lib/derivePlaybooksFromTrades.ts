import { format } from 'date-fns';
import type { Playbook, Trade } from '../types';

function stableId(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  }
  return `pb-derived-${Math.abs(h)}`;
}

/**
 * Build playbook cards from live journal trades (strategy field), for when there is no playbooks API yet.
 */
export function derivePlaybooksFromTrades(trades: Trade[]): Playbook[] {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const key = (t.strategy || '').trim() || 'Unlabeled';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const out: Playbook[] = [];
  const today = format(new Date(), 'yyyy-MM-dd');

  for (const [name, list] of groups) {
    if (list.length === 0) continue;
    const sorted = [...list].sort(
      (a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
    );
    const wins = sorted.filter((t) => t.status === 'WIN');
    const losses = sorted.filter((t) => t.status === 'LOSS');
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profit = sorted.reduce((s, t) => s + t.pnl, 0);
    const profitFactor =
      grossLoss < 0.01 ? (grossWin > 0 ? 99 : 0) : Math.min(99, grossWin / grossLoss);
    const avgRR = sorted.reduce((s, t) => s + (t.rMultiple || 0), 0) / sorted.length;
    const winRate = Math.round((wins.length / sorted.length) * 1000) / 10;

    let cum = 0;
    const performance = sorted.slice(-40).map((t) => {
      cum += t.pnl;
      return { date: t.entryTime.slice(0, 10), pnl: Math.round(cum * 100) / 100 };
    });

    out.push({
      id: stableId(name),
      name,
      type: 'strategy',
      winRate,
      trades: sorted.length,
      profit: Math.round(profit * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgRR: Math.round(avgRR * 100) / 100,
      description:
        name === 'Unlabeled'
          ? `${sorted.length} trades without a strategy tag — add tags in the journal to split playbooks.`
          : `Auto-built from ${sorted.length} journal trades with strategy "${name}".`,
      rules: [
        `Source: live journal (${sorted.length} trades)`,
        `Net P&L: $${profit.toFixed(2)}`,
        `Wins / losses: ${wins.length} / ${losses.length}`,
      ],
      tags: ['journal-derived', name === 'Unlabeled' ? 'unlabeled' : name.toLowerCase().slice(0, 24)],
      performance: performance.length > 0 ? performance : [{ date: today, pnl: 0 }],
      createdAt: today,
      updatedAt: today,
    });
  }

  out.sort((a, b) => b.profit - a.profit);
  return out;
}
