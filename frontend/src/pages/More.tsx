import {
  FlaskConical,
  ShieldCheck,
  BarChart3,
  GitCompare,
  Brain,
  Target,
  Calculator,
  NotebookPen,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { ModeHeaderStrip } from '../components/layout/ModeHeaderStrip';
import { MoreGrid, type MoreGridSection } from '../components/layout/MoreGrid';
import { TxPage } from '../components/ui/TxPage';
import { useStore } from '../store/useStore';

const sections: MoreGridSection[] = [
  {
    title: 'Automation',
    items: [
      {
        path: '/backtests',
        label: 'Backtests',
        subtitle: 'Strategy experiments on historical data',
        icon: FlaskConical,
      },
      {
        path: '/live-readiness',
        label: 'Live Readiness',
        subtitle: 'Checklist before any live enablement',
        icon: ShieldCheck,
        status: 'Locked',
        statusTone: 'warning',
      },
      {
        path: '/action-center',
        label: 'Action Center',
        subtitle: 'Tasks and manual review queue',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Performance',
    items: [
      {
        path: '/reports',
        label: 'Reports',
        subtitle: 'P&L, strategies, psychology, sessions',
        icon: BarChart3,
      },
      {
        path: '/reports/compare',
        label: 'Compare',
        subtitle: 'Side-by-side performance views',
        icon: GitCompare,
      },
      {
        path: '/playbooks',
        label: 'Playbooks',
        subtitle: 'Pattern insights from your journal',
        icon: Brain,
      },
    ],
  },
  {
    title: 'Planning',
    items: [
      {
        path: '/propfirm',
        label: 'Prop Firm',
        subtitle: 'Challenge rules and drawdown limits',
        icon: Target,
      },
      {
        path: '/calculator',
        label: 'Calculator',
        subtitle: 'Position size and R:R math',
        icon: Calculator,
      },
      {
        path: '/notebook',
        label: 'Notebook',
        subtitle: 'Session notes and prep',
        icon: NotebookPen,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        path: '/settings',
        label: 'Settings',
        subtitle: 'Data sources, notifications, PWA install',
        icon: Settings,
      },
    ],
  },
];

export function More() {
  const { dataMode } = useStore();
  const liveReadiness = sections[0].items.find((i) => i.path === '/live-readiness');
  if (liveReadiness) {
    liveReadiness.status = dataMode === 'demo' ? 'Demo' : 'Locked';
    liveReadiness.statusTone = 'warning';
  }

  return (
    <div className="min-h-screen">
      <Header title="More" subtitle="Secondary tools and settings" showDateRange={false} compact />
      <ModeHeaderStrip />
      <TxPage title="More" subtitle="Automation, performance, planning, and account">
        <div className="rounded-[var(--tx-r-20)] border border-[var(--tx-line-1)] bg-[var(--tx-surface-1)] px-4 py-3 text-sm text-[var(--tx-text-2)]">
          {dataMode === 'demo' ? 'Demo data' : 'Live journal'} · Live execution disabled · Risk
          monitoring active
        </div>
        <MoreGrid sections={sections} />
      </TxPage>
    </div>
  );
}
