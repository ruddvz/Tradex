import { useCallback, useEffect, useMemo, useState } from 'react';
import { subDays, parseISO, isAfter } from 'date-fns';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDrawer } from '../components/tasks/TaskDrawer';
import { getToken } from '../lib/auth';
import type { ManualTask } from '../types';
import { clsx } from 'clsx';

const TAB_ITEMS = [
  { id: 'setup', label: 'Setup' },
  { id: 'trading_review', label: 'Trading review' },
  { id: 'paper', label: 'Paper mode' },
  { id: 'risk', label: 'Risk' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'errors', label: 'Errors' },
] as const;

const TAB_CATEGORIES: Record<(typeof TAB_ITEMS)[number]['id'], string[]> = {
  setup: ['initial_setup', 'security', 'broker_connection', 'pwa_setup', 'strategy_testing'],
  trading_review: ['journal_cleanup'],
  paper: ['paper_trading'],
  risk: ['risk'],
  maintenance: ['maintenance'],
  errors: ['critical_issues'],
};

const FILTER_ITEMS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'setup_f', label: 'Setup' },
  { id: 'paper_f', label: 'Paper' },
  { id: 'risk_f', label: 'Risk' },
  { id: 'done', label: 'Done' },
];

function inTab(task: ManualTask, tab: (typeof TAB_ITEMS)[number]['id']) {
  return TAB_CATEGORIES[tab].includes(task.category);
}

function applyChipFilter(tasks: ManualTask[], chip: string): ManualTask[] {
  if (chip === 'all') return tasks;
  if (chip === 'critical') return tasks.filter((t) => t.priority === 'critical');
  if (chip === 'blocked') return tasks.filter((t) => t.status === 'blocked');
  if (chip === 'done') return tasks.filter((t) => t.status === 'done' || t.status === 'skipped');
  if (chip === 'setup_f') return tasks.filter((t) => TAB_CATEGORIES.setup.includes(t.category));
  if (chip === 'paper_f') return tasks.filter((t) => t.category === 'paper_trading');
  if (chip === 'risk_f') return tasks.filter((t) => t.category === 'risk');
  return tasks;
}

function statCard(title: string, value: string | number, hint?: string) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface/80 p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ActionCenter() {
  const navigate = useNavigate();
  const token = getToken();
  const [tab, setTab] = useState<(typeof TAB_ITEMS)[number]['id']>('setup');
  const [chip, setChip] = useState('all');
  const [tasks, setTasks] = useState<ManualTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerTask, setDrawerTask] = useState<ManualTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!token) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/manual-tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as ManualTask[];
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount and token-scoped refetch
    void loadTasks();
  }, [loadTasks]);

  const tabbed = useMemo(() => tasks.filter((t) => inTab(t, tab)), [tasks, tab]);
  const visible = useMemo(() => applyChipFilter(tabbed, chip), [tabbed, chip]);

  const weekStart = subDays(new Date(), 7);
  const completedThisWeek = tasks.filter((t) => {
    if (!t.completed_at) return false;
    if (t.status !== 'done' && t.status !== 'skipped') return false;
    try {
      return isAfter(parseISO(t.completed_at), weekStart);
    } catch {
      return false;
    }
  }).length;

  const terminal = (s: string) => s === 'done' || s === 'skipped';
  const setupProgress =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((t) => terminal(t.status)).length / tasks.length) * 100
        );

  const criticalOpen = tasks.filter(
    (t) => t.priority === 'critical' && !terminal(t.status)
  ).length;
  const blockedOpen = tasks.filter((t) => t.status === 'blocked').length;

  const openDrawer = (t: ManualTask) => {
    setDrawerTask(t);
    setDrawerOpen(true);
  };

  const continueTask = (t: ManualTask) => {
    const payload = t.action_payload || {};
    if (t.action_type === 'internal_route' && typeof payload.route === 'string') {
      navigate(payload.route);
      return;
    }
    openDrawer(t);
  };

  const runGenerateDefaults = async () => {
    if (!token) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/v1/manual-tasks/generate-defaults', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) void loadTasks();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Action Center"
        subtitle="Finish setup, review problems, and keep your trading system safe."
        showDateRange={false}
      />

      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-28 md:pb-8">
        {!token && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
            Sign in to load your saved checklist. Demo browsing still works, but tasks stay on the server per account.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCard('Setup progress', `${setupProgress}%`, 'Done or skipped vs total')}
          {statCard('Critical tasks', criticalOpen, 'Still open')}
          {statCard('Blocked', blockedOpen, 'Needs attention')}
          {statCard('Completed (7d)', completedThisWeek, 'Done or skipped this week')}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SegmentedControl
            items={TAB_ITEMS.map((x) => ({ id: x.id, label: x.label }))}
            value={tab}
            onChange={(id) => setTab(id as (typeof TAB_ITEMS)[number]['id'])}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!token || seeding}
              onClick={() => void runGenerateDefaults()}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-dark-300 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-surface-light disabled:opacity-40"
            >
              <ClipboardList className="w-4 h-4 text-brand-400" />
              {seeding ? 'Syncing…' : 'Sync defaults'}
            </button>
            <button
              type="button"
              disabled={!token || loading}
              onClick={() => void loadTasks()}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-dark-300 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-surface-light disabled:opacity-40"
            >
              <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 mb-2">Filter</p>
          <SegmentedControl items={FILTER_ITEMS} value={chip} onChange={setChip} className="max-w-full" />
        </div>

        {loading ? (
          <div className="text-sm text-slate-500 py-12 text-center">Loading tasks…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border p-10 text-center text-slate-500 text-sm">
            No tasks in this view. Try another tab, clear filters, or sync defaults if you just signed up.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visible.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onOpen={() => openDrawer(t)}
                onContinue={() => continueTask(t)}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDrawer
        task={drawerTask}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerTask(null);
        }}
        token={token}
        onUpdated={() => {
          void loadTasks();
        }}
      />
    </div>
  );
}
