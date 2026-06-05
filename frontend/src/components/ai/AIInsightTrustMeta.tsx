import type { AIInsight } from '../../types';

export function AIInsightTrustMeta({ insight }: { insight: AIInsight }) {
  return (
    <div className="mt-2 pt-2 border-t border-surface-border/60 space-y-1 text-[10px] text-text-muted">
      {insight.dataUsed && <p>Data: {insight.dataUsed}</p>}
      {insight.confidence && (
        <p>
          Confidence: <span className="uppercase font-semibold">{insight.confidence}</span>
        </p>
      )}
      {insight.limitations && <p className="italic">{insight.limitations}</p>}
    </div>
  );
}
