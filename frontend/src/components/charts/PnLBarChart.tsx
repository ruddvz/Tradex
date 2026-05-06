import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { mockDailyStats } from '../../data/mockData';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const pnl = payload[0].value;
  const isProfit = pnl >= 0;
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-3 shadow-card text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className={`font-bold ${isProfit ? 'text-brand-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}${pnl.toFixed(2)}
      </p>
      <p className="text-slate-500 text-xs">{payload[0]?.payload?.trades} trades</p>
    </div>
  );
};

export function PnLBarChart({ height = 180 }: { height?: number }) {
  const data = mockDailyStats.slice(-21).map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={10}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,53,80,0.6)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <ReferenceLine y={0} stroke="#2a3550" strokeWidth={1} />
        <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
