import { Bell, Octagon, Plus, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';
import { TxIconButton } from '../ui/TxIconButton';
import { AccountSelector } from './AccountSelector';
import { DataSourceBadge } from '../status/DataSourceBadge';
import { TxButton } from '../ui/TxButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showDateRange?: boolean;
  action?: React.ReactNode;
  onAddTrade?: () => void;
  compact?: boolean;
}

const KILL_SWITCH_ROUTES = ['/paper-trading', '/paper', '/risk'];

export function Header({
  title,
  subtitle,
  showDateRange = true,
  action,
  onAddTrade,
  compact = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarOpen,
    aiInsights,
    dataMode,
    botStatus,
    triggerKillSwitch,
    resumePaperTrading,
    lastMt5Sync,
  } = useStore();

  const showKillSwitch =
    dataMode === 'live' && KILL_SWITCH_ROUTES.some((p) => location.pathname.startsWith(p));

  const desktopAction =
    action ??
    (onAddTrade ? (
      <TxButton size="md" variant="primary" onClick={onAddTrade}>
        <Plus className="h-4 w-4" />
        Add Trade
      </TxButton>
    ) : null);

  return (
    <header
      className={clsx(
        'no-print header-safe fixed top-0 right-0 z-30',
        'bg-[rgba(3,6,17,0.82)] backdrop-blur-xl border-b border-[var(--tx-line-1)]',
        'left-0',
        sidebarOpen ? 'md:left-[var(--tx-sidebar-w)]' : 'md:left-[var(--tx-sidebar-w-collapsed)]'
      )}
    >
      <div className="flex items-center gap-2 px-[var(--tx-page-x)] md:px-5 min-h-[52px]">
        <div className="flex-1 min-w-0 py-1">
          <h1 className="text-lg md:text-xl font-bold text-[var(--tx-text-1)] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && !compact && (
            <p className="text-xs text-[var(--tx-text-3)] truncate hidden sm:block">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showKillSwitch && (
            <TxIconButton
              icon={Octagon}
              label={botStatus?.kill_switch_active ? 'Resume paper bot' : 'Activate kill switch'}
              variant={botStatus?.kill_switch_active ? 'danger' : 'warning'}
              size="md"
              className="hidden sm:inline-flex"
              onClick={() =>
                void (botStatus?.kill_switch_active ? resumePaperTrading() : triggerKillSwitch())
              }
            />
          )}

          <div className="relative">
            <TxIconButton icon={Bell} label="Notifications" variant="glass" size="md" />
            {aiInsights.length > 0 && (
              <span className="pointer-events-none absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--tx-profit)] border-2 border-[var(--tx-bg-0)]" />
            )}
          </div>

          <TxIconButton
            icon={Settings}
            label="Settings"
            variant="glass"
            size="md"
            onClick={() => navigate('/settings')}
          />
        </div>
      </div>

      {!compact && (
        <div className="hidden md:flex items-center gap-3 px-5 pb-3 flex-wrap">
          <AccountSelector />
          {lastMt5Sync?.demo_fallback_used && (
            <DataSourceBadge source="demo" className="!text-amber-200" />
          )}
          {dataMode === 'live' && <DataSourceBadge source="live" />}
          {showDateRange && (
            <span className="text-xs text-[var(--tx-text-4)]">Use page toolbar for date range.</span>
          )}
          <div className="ml-auto">{desktopAction}</div>
        </div>
      )}
    </header>
  );
}
