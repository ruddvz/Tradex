import { ChevronRight, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import type { ManualTask } from '../../types';
import { TaskProgress } from './TaskProgress';

const priorityStyles: Record<string, string> = {
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  high: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  medium: 'text-slate-300 border-surface-border bg-dark-300/80',
  low: 'text-slate-500 border-surface-border bg-dark-300/50',
};

const categoryLabel: Record<string, string> = {
  initial_setup: 'Initial setup',
  security: 'Security',
  broker_connection: 'Broker / data',
  paper_trading: 'Paper mode',
  risk: 'Risk setup',
  journal_cleanup: 'Journal cleanup',
  strategy_testing: 'Strategy testing',
  pwa_setup: 'PWA',
  maintenance: 'Maintenance',
  critical_issues: 'Critical issues',
};

interface TaskCardProps {
  task: ManualTask;
  onOpen: () => void;
  onContinue?: () => void;
}

export function TaskCard({ task, onOpen, onContinue }: TaskCardProps) {
  const checklist = task.checklist || [];
  const doneSteps = checklist.filter((c) => c.completed).length;
  const totalSteps = checklist.length;
  const p = (task.priority || 'medium').toLowerCase();
  const badge = priorityStyles[p] || priorityStyles.medium;
  const cat = categoryLabel[task.category] || task.category;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="card-hover rounded-2xl border border-surface-border bg-surface/80 p-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/40"
    >
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            badge
          )}
        >
          {p === 'critical' && <AlertTriangle className="w-3 h-3" />}
          {p}
        </span>
        <span className="text-[11px] text-slate-500">
          {cat}
          {task.status === 'blocked' ? ' · Blocked' : ''}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1 pr-6">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}
      {totalSteps > 0 && (
        <TaskProgress completed={doneSteps} total={totalSteps} className="mb-3" />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-600 capitalize">
          {String(task.status).replace(/_/g, ' ')}
        </span>
        <div className="flex items-center gap-2">
          {onContinue && task.status !== 'done' && task.status !== 'skipped' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-brand-500/15 border border-brand-500/30 px-3 py-1.5 text-xs font-semibold text-brand-400 hover:bg-brand-500/25 transition-colors"
            >
              Continue
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
