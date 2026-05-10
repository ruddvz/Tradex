import { Activity } from 'lucide-react';

interface TradingConsistencyCardProps {
  score: number;
  subtitle: string;
}

export function TradingConsistencyCard({ score, subtitle }: TradingConsistencyCardProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="section-title text-base">Trading consistency</h3>
          <p className="section-subtitle">Execution steadiness vs. your baseline</p>
        </div>
        <div className="p-2 rounded-xl bg-analytics/15 border border-analytics/25 shrink-0">
          <Activity className="w-5 h-5 text-analytics" aria-hidden />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-extrabold tabular-nums text-text-primary">{score}</span>
        <span className="text-lg text-text-muted mb-1 font-medium">/100</span>
      </div>
      <p className="text-sm text-text-secondary mt-3 leading-snug">{subtitle}</p>
    </div>
  );
}
