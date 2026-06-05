import { DataSourceBadge, type DataSource } from './DataSourceBadge';

/** Map journal trade `source` to badge variant. */
export function TradeSourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  const s = source.toLowerCase();
  let variant: DataSource = 'manual';
  if (s === 'demo_mt5_sample' || s === 'demo') variant = 'demo';
  else if (s.includes('mt5') || s === 'mt5_live' || s === 'mt5_demo') variant = 'mt5';
  else if (s === 'paper') variant = 'paper';
  else if (s.includes('backtest')) variant = 'backtest';
  return <TradeSourceBadgeInner source={variant} raw={source} />;
}

function TradeSourceBadgeInner({ source, raw }: { source: DataSource; raw: string }) {
  if (raw === 'demo_mt5_sample') {
    return (
      <span className="inline-flex items-center gap-1">
        <DataSourceBadge source="demo" />
        <span className="text-[9px] text-amber-300/90 uppercase font-semibold">MT5 sample</span>
      </span>
    );
  }
  if (raw === 'mt5_demo') {
    return (
      <span className="inline-flex items-center gap-1">
        <DataSourceBadge source="mt5" />
        <span className="text-[9px] text-amber-300/90 uppercase font-semibold">demo import</span>
      </span>
    );
  }
  return <DataSourceBadge source={source} />;
}
