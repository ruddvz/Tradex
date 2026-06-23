import { TxCard } from '../ui/TxCard';

const ASSUMPTIONS = [
  'Simulated market fills at reference price',
  'Slippage model: conservative spread + 0.1 pip',
  'Commission: per-lot estimate',
  'Data source: paper account reference quotes',
  'Latency: instant fill (not live broker latency)',
];

export function PaperAssumptionsCard() {
  return (
    <TxCard title="Paper assumptions" subtitle="Simulation transparency — not live execution">
      <ul className="space-y-2 text-sm text-[var(--tx-text-3)]">
        {ASSUMPTIONS.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-[var(--tx-warning)]">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </TxCard>
  );
}

export function ExecutionLogCard({
  rows,
}: {
  rows: { time: string; message: string; rejected?: boolean }[];
}) {
  return (
    <TxCard title="Execution log" subtitle="Signals, fills, and rejections">
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--tx-text-3)]">No simulated orders yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {rows.map((row, i) => (
            <li
              key={`${row.time}-${i}`}
              className="rounded-[var(--tx-r-10)] border border-[var(--tx-line-1)] px-3 py-2 text-xs"
            >
              <span className="text-[var(--tx-text-4)]">{row.time}</span>
              <p className={row.rejected ? 'text-[var(--tx-warning)]' : 'text-[var(--tx-text-2)]'}>
                {row.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </TxCard>
  );
}
