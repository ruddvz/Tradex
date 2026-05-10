import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Brain,
  Clock,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { HeroMetricCard } from '../components/cards/HeroMetricCard';
import { StatCard } from '../components/ui/StatCard';
import { EquityCurve } from '../components/charts/EquityCurve';
import { PnLCalendar } from '../components/charts/PnLCalendar';
import { WinRateDonut } from '../components/charts/WinRateDonut';
import { SessionHeatmap } from '../components/charts/SessionHeatmap';
import { PnLBarChart } from '../components/charts/PnLBarChart';
import { WeeklyPerformanceStrip } from '../components/dashboard/WeeklyPerformanceStrip';
import { TradingConsistencyCard } from '../components/dashboard/TradingConsistencyCard';
import { PnlBadge, DirectionBadge, Badge, GradeBadge } from '../components/ui/Badge';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { useIsMobile } from '../hooks/useBreakpoint';
import type { AIInsight } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { metrics, trades, aiInsights, dismissInsight } = useStore();
  const recentActivity = trades.slice(0, 3);
  const topInsight = aiInsights[0];
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const consistencyScore = Math.min(
    100,
    Math.max(
      35,
      Math.round(metrics.winRate * 0.65 + Math.min(metrics.profitFactor, 3) * 12 + (metrics.expectancy > 0 ? 8 : 0))
    )
  );
  const consistencyCopy =
    metrics.winRate >= 58
      ? 'Strong — win rate and expectancy align with your playbook.'
      : 'Focus on repeating high-setup sessions and reducing impulse trades.';

  const handleDismissInsight = (insight: AIInsight) => {
    setDismissingId(insight.id);
    setTimeout(() => dismissInsight(insight.id), 300);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Home"
        subtitle="Overview of your trading performance"
        showDateRange={false}
      />

      <div className="page-shell px-5 py-6 space-y-7 md:space-y-8">
        <HeroMetricCard
          value={`${metrics.totalPnl >= 0 ? '+' : ''}$${metrics.totalPnl.toLocaleString()}`}
          trend={12.4}
          trendLabel="vs last period"
          pnlNonNegative={metrics.totalPnl >= 0}
          sparklineHeight={isMobile ? 112 : 128}
        />

        {topInsight && (
          <div
            className={clsx(
              'p-4 rounded-[18px] border flex items-start gap-4 transition-all duration-300',
              topInsight.impact === 'high'
                ? 'bg-success/8 border-success/30'
                : topInsight.impact === 'medium'
                  ? 'bg-analytics/8 border-analytics/30'
                  : 'bg-warning/10 border-warning/35',
              dismissingId === topInsight.id && 'opacity-0 scale-95 pointer-events-none'
            )}
          >
            <div className="p-2 rounded-xl bg-ai/15 border border-ai/25 flex-shrink-0">
              <Brain className="w-5 h-5 text-ai" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-ai uppercase tracking-wider">AI insight</span>
                <Badge
                  variant={
                    topInsight.impact === 'high'
                      ? 'profit'
                      : topInsight.impact === 'medium'
                        ? 'info'
                        : 'warn'
                  }
                  size="xs"
                >
                  {topInsight.impact} impact
                </Badge>
              </div>
              <p className="text-sm font-semibold text-text-primary mb-0.5">{topInsight.title}</p>
              <p className="text-xs text-text-secondary line-clamp-2">{topInsight.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                className="text-xs text-success hover:text-success/90 font-medium flex items-center gap-1"
              >
                View <ArrowUpRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleDismissInsight(topInsight)}
                className="text-text-muted hover:text-text-secondary text-xs min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            subtitle="Gross profit / loss"
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Trades" value={metrics.totalTrades} subtitle="In range" icon={BarChart3} size="sm" />
          <StatCard
            title="Best Trade"
            value={`+$${metrics.bestTrade.toFixed(0)}`}
            icon={Award}
            variant="profit"
            size="sm"
          />
          <StatCard title="Avg Hold Time" value={`${metrics.avgHoldTime}m`} subtitle="Per trade" icon={Clock} size="sm" />
          <StatCard
            title="Expectancy"
            value={`$${metrics.expectancy.toFixed(0)}`}
            subtitle="Per trade avg"
            icon={Zap}
            variant={metrics.expectancy > 0 ? 'profit' : 'loss'}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2 min-h-[280px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-base">Equity curve</h3>
                <p className="section-subtitle">Balance vs equity — primary performance view</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-success rounded-full" />
                  <span className="text-text-muted">Equity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-analytics rounded border border-dashed border-analytics/50" />
                  <span className="text-text-muted">Balance</span>
                </div>
              </div>
            </div>
            <EquityCurve height={isMobile ? 180 : 240} />
          </div>

          <div className="card p-5">
            <div className="mb-4">
              <h3 className="section-title text-base">Win rate</h3>
              <p className="section-subtitle">Outcome distribution</p>
            </div>
            <WinRateDonut />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Avg win</span>
                <span className="text-success font-semibold">+${metrics.avgWin.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Avg loss</span>
                <span className="text-danger font-semibold">${metrics.avgLoss.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Sharpe ratio</span>
                <span className="text-text-primary font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <TradingConsistencyCard score={consistencyScore} subtitle={consistencyCopy} />
          </div>
          <div className="card p-5">
            <WeeklyPerformanceStrip />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-base">Daily P&L</h3>
                <p className="section-subtitle">Last 21 trading days</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-muted">Avg daily</div>
                <div
                  className={clsx(
                    'text-sm font-bold tabular-nums',
                    metrics.avgDailyPnl >= 0 ? 'text-success' : 'text-danger'
                  )}
                >
                  {metrics.avgDailyPnl >= 0 ? '+' : ''}${metrics.avgDailyPnl.toFixed(0)}
                </div>
              </div>
            </div>
            <PnLBarChart height={isMobile ? 140 : 180} />
          </div>

          <div className="card p-5">
            <PnLCalendar />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(126,146,185,0.14)]">
              <div>
                <h3 className="section-title text-base">Recent activity</h3>
                <p className="section-subtitle">{trades.length} trades in journal</p>
              </div>
              <button type="button" className="btn-secondary text-xs py-2 px-3 min-h-0" onClick={() => navigate('/journal')}>
                View all
              </button>
            </div>
            <div className="p-5 space-y-4">
              {recentActivity.map(trade => (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => navigate('/journal')}
                  className="w-full text-left rounded-[18px] border border-[rgba(126,146,185,0.14)] bg-[rgba(16,24,42,0.35)] p-4 hover:border-success/25 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-text-primary">{trade.symbol}</span>
                        <DirectionBadge direction={trade.direction} />
                      </div>
                      <p className="text-[12px] text-text-muted mt-1">
                        {format(parseISO(trade.entryTime), 'MMM d · h:mm a')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <PnlBadge value={trade.pnl} />
                      <div className="mt-1">
                        <GradeBadge grade={trade.grade} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                    <span>
                      R:R{' '}
                      <span
                        className={clsx(
                          'font-mono font-semibold',
                          trade.rMultiple >= 1 ? 'text-success' : 'text-danger'
                        )}
                      >
                        {trade.rMultiple >= 0 ? '+' : ''}
                        {trade.rMultiple}R
                      </span>
                    </span>
                    <span className="hidden sm:inline">{trade.strategy}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4">
              <h3 className="section-title text-base">Session heatmap</h3>
              <p className="section-subtitle">P&L by session & day</p>
            </div>
            <SessionHeatmap />
            <div className="mt-4 pt-4 border-t border-[rgba(126,146,185,0.14)]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-text-muted mb-1">Best session</div>
                  <div className="text-sm font-semibold text-success">London</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted mb-1">Best day</div>
                  <div className="text-sm font-semibold text-success">Tuesday</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-5 min-h-[100px]">
            <div className="text-xs text-text-muted mb-2">Max win streak</div>
            <div className="text-2xl font-bold text-success">{metrics.maxConsecutiveWins}</div>
            <div className="text-xs text-text-muted mt-1">Consecutive wins</div>
          </div>
          <div className="card p-5 min-h-[100px]">
            <div className="text-xs text-text-muted mb-2">Max loss streak</div>
            <div className="text-2xl font-bold text-danger">{metrics.maxConsecutiveLosses}</div>
            <div className="text-xs text-text-muted mt-1">Consecutive losses</div>
          </div>
          <div className="card p-5 min-h-[100px]">
            <div className="text-xs text-text-muted mb-2">Trading days</div>
            <div className="text-2xl font-bold text-text-primary">{metrics.tradingDays}</div>
            <div className="text-xs text-text-muted mt-1">Days active</div>
          </div>
          <div className="card p-5 min-h-[100px]">
            <div className="text-xs text-text-muted mb-2">Worst trade</div>
            <div className="text-2xl font-bold text-danger">${metrics.worstTrade.toFixed(0)}</div>
            <div className="text-xs text-text-muted mt-1">Single trade loss</div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title text-base">Drawdown analysis</h3>
              <p className="section-subtitle">Drawdown % from equity peak</p>
            </div>
            <Badge variant="loss" size="xs">
              Max {metrics.maxDrawdown.toFixed(1)}%
            </Badge>
          </div>
          <EquityCurve showDrawdown height={isMobile ? 140 : 160} />
        </div>
      </div>
    </div>
  );
}
