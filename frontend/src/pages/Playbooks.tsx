import { useState, useMemo } from 'react';
import { Brain, Target, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { CreatePlaybookModal } from '../components/playbooks/CreatePlaybookModal';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../store/useStore';
import { Badge, PnlBadge } from '../components/ui/Badge';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { clsx } from 'clsx';
import type { Playbook } from '../types';
import { derivePlaybooksFromTrades } from '../lib/derivePlaybooksFromTrades';

function PlaybookCard({ pb, onClick }: { pb: Playbook; onClick: () => void }) {
  return (
    <div className="card-hover p-5 cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{pb.name}</h3>
            <Badge variant="neutral" size="xs">{pb.type}</Badge>
          </div>
        </div>
        <Badge variant={pb.winRate >= 65 ? 'profit' : pb.winRate >= 55 ? 'info' : 'warn'}>
          {pb.winRate}% WR
        </Badge>
      </div>

      <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pb.description}</p>

      {/* Mini sparkline */}
      <div className="h-12 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pb.performance.slice(-10)}>
            <Line type="monotone" dataKey="pnl" stroke={pb.profit >= 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-surface-border">
        <div className="text-center">
          <div className="text-sm font-bold text-brand-400">+${(pb.profit / 1000).toFixed(1)}K</div>
          <div className="text-[10px] text-slate-500">Total Profit</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">{pb.trades}</div>
          <div className="text-[10px] text-slate-500">Trades</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-blue-400">{pb.profitFactor}x</div>
          <div className="text-[10px] text-slate-500">Profit Factor</div>
        </div>
      </div>
    </div>
  );
}

function PlaybookDetail({ pb, onClose }: { pb: Playbook; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-card-hover animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-blue-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">{pb.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="neutral" size="xs">{pb.type}</Badge>
                <Badge variant={pb.winRate >= 65 ? 'profit' : 'info'} size="xs">{pb.winRate}% Win Rate</Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Win Rate', value: `${pb.winRate}%`, color: 'text-brand-400' },
              { label: 'Trades', value: pb.trades, color: 'text-white' },
              { label: 'Profit Factor', value: `${pb.profitFactor}x`, color: 'text-blue-400' },
              { label: 'Avg R:R', value: `1:${pb.avgRR}`, color: 'text-amber-400' },
            ].map(m => (
              <div key={m.label} className="bg-dark-300 rounded-lg p-3 text-center">
                <div className={clsx('text-xl font-bold', m.color)}>{m.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Performance Chart */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Performance History</h4>
            <div className="h-40 bg-dark-300 rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pb.performance}>
                  <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Tooltip
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-surface border border-surface-border rounded-lg p-2 text-xs">
                        <span className={payload[0].value as number >= 0 ? 'text-brand-400' : 'text-red-400'}>
                          {(payload[0].value as number) >= 0 ? '+' : ''}${(payload[0].value as number)?.toFixed(0)}
                        </span>
                      </div>
                    ) : null}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-400" /> Trading Rules
            </h4>
            <ol className="space-y-2">
              {pb.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-dark-300 rounded-lg">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{rule}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Description */}
          <div className="p-4 bg-dark-300 rounded-xl">
            <p className="text-sm text-slate-300">{pb.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {pb.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-surface-light rounded-lg text-xs text-slate-400 border border-surface-border">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Playbooks() {
  const { showToast } = useToast();
  const { playbooks, aiInsights, trades, dataSource, hydrateFromApi } = useStore();
  const [selected, setSelected] = useState<Playbook | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const psychInsights = aiInsights.filter(i => i.type === 'psychology' || i.type === 'pattern');

  const displayPlaybooks = useMemo(
    () => (dataSource === 'live' ? derivePlaybooksFromTrades(trades) : playbooks),
    [dataSource, trades, playbooks]
  );

  const handleAIGenerate = async () => {
    if (dataSource === 'live') {
      setGenerating(true);
      try {
        await hydrateFromApi();
        showToast('Insights and trades refreshed from the API.');
      } finally {
        setGenerating(false);
      }
      return;
    }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false);
    showToast('AI analysis complete — 2 new insights generated');
  };

  const symbolStats = Array.from(new Set(trades.map(t => t.symbol))).map(sym => {
    const symTrades = trades.filter(t => t.symbol === sym);
    const wins = symTrades.filter(t => t.status === 'WIN');
    return {
      symbol: sym,
      trades: symTrades.length,
      winRate: Math.round(wins.length / symTrades.length * 100),
      pnl: symTrades.reduce((s, t) => s + t.pnl, 0),
    };
  }).sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="min-h-screen">
      <Header title="AI Playbooks" subtitle="Pattern detection & performance intelligence" />

      <div className="page-shell p-6 space-y-6">
        {createOpen && <CreatePlaybookModal onClose={() => setCreateOpen(false)} />}
        {/* AI Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1">
              <Sparkles className="w-5 h-5 text-brand-400 shrink-0" />
              <span className="font-semibold text-white">AI Pattern Engine</span>
              <Badge variant="profit" size="xs">
                Active
              </Badge>
            </div>
            <button
              type="button"
              disabled={generating}
              onClick={handleAIGenerate}
              className="btn-secondary text-sm shrink-0 justify-center"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Analysis
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Analyzed {trades.length} trades to surface your most profitable patterns. Updated continuously as you trade.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-brand-400">{displayPlaybooks.length}</div>
              <div className="text-xs text-slate-500">Active Playbooks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{psychInsights.length}</div>
              <div className="text-xs text-slate-500">AI Insights</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{trades.length}</div>
              <div className="text-xs text-slate-500">Trades Analyzed</div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title text-base">AI Insights</h2>
            <Badge variant="info" size="xs">{aiInsights.length} active</Badge>
          </div>
          <div className="space-y-3">
            {aiInsights.map(insight => (
              <div key={insight.id} className={clsx(
                'p-4 rounded-xl border',
                insight.type === 'warning' ? 'bg-red-500/5 border-red-500/20' :
                insight.type === 'achievement' ? 'bg-amber-500/5 border-amber-500/20' :
                insight.type === 'psychology' ? 'bg-purple-500/5 border-purple-500/20' :
                'bg-brand-500/5 border-brand-500/20'
              )}>
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'p-2 rounded-lg flex-shrink-0',
                    insight.type === 'warning' ? 'bg-red-500/15' :
                    insight.type === 'achievement' ? 'bg-amber-500/15' :
                    insight.type === 'psychology' ? 'bg-purple-500/15' :
                    'bg-brand-500/15'
                  )}>
                    <Brain className={clsx('w-4 h-4',
                      insight.type === 'warning' ? 'text-red-400' :
                      insight.type === 'achievement' ? 'text-amber-400' :
                      insight.type === 'psychology' ? 'text-purple-400' :
                      'text-brand-400'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{insight.title}</span>
                      <Badge
                        variant={insight.impact === 'high' ? 'loss' : insight.impact === 'medium' ? 'warn' : 'neutral'}
                        size="xs"
                      >
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{insight.description}</p>
                    <div className="p-2 bg-black/20 rounded-lg">
                      <span className="text-xs font-medium text-brand-400">→ {insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playbook Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h2 className="section-title text-base">My Playbooks</h2>
              {dataSource === 'live' ? (
                <Badge variant="info" size="xs">
                  From journal
                </Badge>
              ) : (
                <Badge variant="neutral" size="xs">
                  Demo sample
                </Badge>
              )}
            </div>
            <button
              type="button"
              className="btn-primary text-sm shrink-0 disabled:opacity-40 disabled:pointer-events-none"
              disabled={dataSource === 'live'}
              title={
                dataSource === 'live'
                  ? 'Read-only while using live data — saved playbooks API comes later.'
                  : undefined
              }
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" /> New Playbook
            </button>
          </div>
          {dataSource === 'live' && displayPlaybooks.length === 0 && (
            <div className="rounded-xl border border-dashed border-surface-border p-6 text-sm text-slate-500 mb-3">
              No strategy groups yet. Add a <span className="text-slate-300 font-medium">strategy</span> label to
              trades in the journal — each distinct strategy becomes a playbook card here.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPlaybooks.map(pb => (
              <PlaybookCard key={pb.id} pb={pb} onClick={() => setSelected(pb)} />
            ))}
          </div>
        </div>

        {/* Symbol Performance */}
        <div>
          <h2 className="section-title text-base mb-3">Symbol Performance</h2>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="table-header text-left">Symbol</th>
                    <th className="table-header text-center">Trades</th>
                    <th className="table-header text-center">Win Rate</th>
                    <th className="table-header text-right">Net P&L</th>
                    <th className="table-header text-right hidden sm:table-cell">Win Rate Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {symbolStats.map(s => (
                    <tr key={s.symbol} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center text-[10px] font-bold text-white">
                            {s.symbol.slice(0, 2)}
                          </div>
                          <span className="font-semibold text-white">{s.symbol}</span>
                        </div>
                      </td>
                      <td className="table-cell text-center text-slate-400">{s.trades}</td>
                      <td className="table-cell text-center">
                        <Badge variant={s.winRate >= 65 ? 'profit' : s.winRate >= 50 ? 'info' : 'loss'} size="xs">
                          {s.winRate}%
                        </Badge>
                      </td>
                      <td className="table-cell text-right">
                        <PnlBadge value={s.pnl} />
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <div className="progress-bar w-32 ml-auto">
                          <div
                            className="progress-fill bg-gradient-to-r from-brand-600 to-brand-400"
                            style={{ width: `${s.winRate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selected && <PlaybookDetail pb={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
