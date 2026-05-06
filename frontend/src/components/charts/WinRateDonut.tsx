import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

const COLORS = ['#10b981', '#ef4444', '#64748b'];

const CustomLabel = ({ cx, cy, value }: any) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={22} fontWeight={700}>
    {value}%
  </text>
);

export function WinRateDonut() {
  const { metrics } = useStore();

  const data = [
    { name: 'Win', value: metrics.winTrades },
    { name: 'Loss', value: metrics.lossTrades },
    { name: 'BE', value: metrics.breakevenTrades },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
            label={<CustomLabel value={metrics.winRate.toFixed(0)} cx={0} cy={0} />}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs shadow-card">
                <span className="text-white font-semibold">{payload[0].name}: {payload[0].value} trades</span>
              </div>
            ) : null}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-slate-400">{d.name}: <span className="text-white font-medium">{d.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
