import { TrendingUp, TrendingDown, BarChart3, Target, Zap, Brain, Clock, Award, ArrowUpRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/ui/StatCard';
import { EquityCurve } from '../components/charts/EquityCurve';
import { PnLCalendar } from '../components/charts/PnLCalendar';
import { WinRateDonut } from '../components/charts/WinRateDonut';
import { SessionHeatmap } from '../components/charts/SessionHeatmap';
import { PnLBarChart } from '../components/charts/PnLBarChart';
import { PnlBadge, DirectionBadge, Badge, GradeBadge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export function Dashboard() {
  const { metrics, trades, aiInsights, dismissInsight } = useStore();
  const recentTrades = trades.slice(0, 8);
  const topInsight = aiInsights[0];

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        subtitle={`Last updated ${format(new Date(), 'MMM d, yyyy · h:mm a')}`}
      />

      <div className="pt-16 p-6 space-y-6">
        {/* AI Insight Banner */}
        {topInsight && (
          <div className={clsx(
            'p-4 rounded-xl border flex items-start gap-4 animate-slide-up',
            topInsight.impact === 'high' ? 'bg-brand-500/8 border-brand-500/30' :
            topInsight.impact === 'medium' ? 'bg-blue-500/8 border-blue-500/30' :
            'bg-amber-500/8 border-amber-500/30'
          )}>
            <div className="p-2 rounded-lg bg-brand-500/15 flex-shrink-0">
              <Brain className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">AI Insight</span>
                <Badge variant={topInsight.impact === 'high' ? 'profit' : topInsight.impact === 'medium' ? 'info' : 'warn'} size="xs">
                  {topInsight.impact} impact
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">{topInsight.title}</p>
              <p className="text-xs text-slate-400 line-clamp-1">{topInsight.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                View <ArrowUpRight className="w-3 h-3" />
              </button>
              <button onClick={() => dismissInsight(topInsight.id)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total P&L"
            value={`${metrics.totalPnl >= 0 ? '+' : ''}$${metrics.totalPnl.toLocaleString()}`}
            subtitle="90-day period"
            trend={12.4}
            trendLabel="vs last period"
            icon={TrendingUp}
            variant="profit"
            className="col-span-2"
            size="lg"
          />
          <StatCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.winTrades}W / ${metrics.lossTrades}L`}
            icon={Target}
            variant={metrics.winRate >= 60 ? 'profit' : metrics.winRate >= 50 ? 'info' : 'loss'}
          />
          <StatCard
            title="Profit Factor"
            value={`${metrics.profitFactor}x`}
            subtitle="Gross profit / Gross loss"
            icon={BarChart3}
            variant={metrics.profitFactor >= 2 ? 'profit' : metrics.profitFactor >= 1.5 ? 'info' : 'warn'}
          />
          <StatCard
            title="Avg R:R"
            value={`1:${metrics.avgRR}`}
            subtitle="Risk to reward"
            icon={Zap}
            variant={metrics.avgRR >= 2 ? 'profit' : 'info'}
          />
          <StatCard
            title="Max Drawdown"
            value={`${metrics.maxDrawdown.toFixed(1)}%`}
            subtitle="Peak to trough"
            icon={TrendingDown}
            variant={metrics.maxDrawdown < 5 ? 'profit' : metrics.maxDrawdown < 10 ? 'warn' : 'loss'}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total Trades" value={metrics.totalTrades} subtitle="90-day period" icon={BarChart3} />
          <StatCard title="Best Trade" value={`+$${metrics.bestTrade.toFixed(0)}`} icon={Award} variant="profit" />
          <StatCard title="Avg Hold Time" value={`${metrics.avgHoldTime}m`} subtitle="Per trade" icon={Clock} />
          <StatCard title="Expectancy" value={`$${metrics.expectancy.toFixed(0)}`} subtitle="Per trade avg" icon={Zap} variant={metrics.expectancy > 0 ? 'profit' : 'loss'} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Equity Curve - wider */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-base">Equity Curve</h3>
                <p className="section-subtitle">Balance vs Equity over time</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-400 rounded" /><span className="text-slate-500">Equity</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-400 rounded border-dashed border" /><span className="text-slate-500">Balance</span></div>
              </div>
            </div>
            <EquityCurve height={220} />
          </div>

          {/* Win Rate Donut */}
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="section-title text-base">Win Rate</h3>
              <p className="section-subtitle">Trade outcome distribution</p>
            </div>
            <WinRateDonut />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg Win</span>
                <span className="text-brand-400 font-semibold">+${metrics.avgWin.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg Loss</span>
                <span className="text-red-400 font-semibold">${metrics.avgLoss.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sharpe Ratio</span>
                <span className="text-white font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Daily P&L Bar Chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-base">Daily P&L</h3>
                <p className="section-subtitle">Last 21 trading days</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Avg Daily</div>
                <div className={clsx('text-sm font-bold', metrics.avgDailyPnl >= 0 ? 'text-brand-400' : 'text-red-400')}>
                  {metrics.avgDailyPnl >= 0 ? '+' : ''}${metrics.avgDailyPnl.toFixed(0)}
                </div>
              </div>
            </div>
            <PnLBarChart height={180} />
          </div>

          {/* P&L Calendar */}
          <div className="card p-5">
            <PnLCalendar />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Trades */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <div>
                <h3 className="section-title text-base">Recent Trades</h3>
                <p className="section-subtitle">{trades.length} total trades</p>
              </div>
              <button className="btn-secondary text-xs py-1.5">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="table-header text-left">Symbol</th>
                    <th className="table-header text-left hidden sm:table-cell">Strategy</th>
                    <th className="table-header text-right">P&L</th>
                    <th className="table-header text-center">R:R</th>
                    <th className="table-header text-center hidden md:table-cell">Grade</th>
                    <th className="table-header text-left hidden lg:table-cell">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map(trade => (
                    <tr key={trade.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {trade.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{trade.symbol}</div>
                            <DirectionBadge direction={trade.direction} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-xs text-slate-400">{trade.strategy}</span>
                      </td>
                      <td className="table-cell text-right">
                        <PnlBadge value={trade.pnl} />
                      </td>
                      <td className="table-cell text-center">
                        <span className={clsx('text-xs font-mono font-semibold', trade.rMultiple >= 1 ? 'text-brand-400' : 'text-red-400')}>
                          {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple}R
                        </span>
                      </td>
                      <td className="table-cell text-center hidden md:table-cell">
                        <GradeBadge grade={trade.grade} />
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-xs text-slate-500">{trade.session}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Session Heatmap */}
          <div className="card p-5">
            <div className="mb-4">
              <h3 className="section-title text-base">Session Heatmap</h3>
              <p className="section-subtitle">P&L by session & day</p>
            </div>
            <SessionHeatmap />
            <div className="mt-4 pt-4 border-t border-surface-border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Best Session</div>
                  <div className="text-sm font-semibold text-brand-400">London</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Best Day</div>
                  <div className="text-sm font-semibold text-brand-400">Tuesday</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak & Drawdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="text-xs text-slate-500 mb-2">Max Win Streak</div>
            <div className="text-2xl font-bold text-brand-400">{metrics.maxConsecutiveWins}</div>
            <div className="text-xs text-slate-500 mt-1">consecutive wins</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 mb-2">Max Loss Streak</div>
            <div className="text-2xl font-bold text-red-400">{metrics.maxConsecutiveLosses}</div>
            <div className="text-xs text-slate-500 mt-1">consecutive losses</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 mb-2">Trading Days</div>
            <div className="text-2xl font-bold text-white">{metrics.tradingDays}</div>
            <div className="text-xs text-slate-500 mt-1">days active</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 mb-2">Worst Trade</div>
            <div className="text-2xl font-bold text-red-400">${metrics.worstTrade.toFixed(0)}</div>
            <div className="text-xs text-slate-500 mt-1">single trade loss</div>
          </div>
        </div>

        {/* Drawdown chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Drawdown Analysis</h3>
              <p className="section-subtitle">% drawdown from equity peak</p>
            </div>
            <Badge variant="loss" size="xs">Max {metrics.maxDrawdown.toFixed(1)}%</Badge>
          </div>
          <EquityCurve showDrawdown height={160} />
        </div>
      </div>
    </div>
  );
}
