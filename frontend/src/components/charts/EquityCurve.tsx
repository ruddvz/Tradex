import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { mockEquityCurve } from '../../data/mockData';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; color?: string; value?: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-3 shadow-card text-sm">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">${p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

interface EquityCurveProps {
  showDrawdown?: boolean;
  height?: number;
}

export function EquityCurve({ showDrawdown = false, height = 220 }: EquityCurveProps) {
  const data = mockEquityCurve.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  }));

  const initialEquity = data[0]?.equity || 10000;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {showDrawdown ? (
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={14} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(1)}%`} domain={[0, 'dataMax + 1']} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#drawdownGrad)" strokeWidth={2} name="Drawdown %" />
        </AreaChart>
      ) : (
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2DD4A3" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#2DD4A3" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A9DFF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4A9DFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={14} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
            domain={['dataMin - 200', 'dataMax + 200']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={initialEquity} stroke="#2a3550" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="balance" stroke="#4A9DFF" fill="url(#balanceGrad)" strokeWidth={1.5} name="Balance" strokeDasharray="4 2" />
          <Area type="monotone" dataKey="equity" stroke="#2DD4A3" fill="url(#equityGrad)" strokeWidth={2.5} name="Equity" />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
