import { useState } from 'react';
import { X, ExternalLink, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import type { ManualTask, ManualTaskChecklistItem } from '../../types';
import { TaskProgress } from './TaskProgress';

interface TaskDrawerProps {
  task: ManualTask | null;
  open: boolean;
  onClose: () => void;
  token: string | null;
  onUpdated: () => void;
}

/** Isolated panel remounted per `task.id` so notes/checklist local state resets without effects. */
function TaskDrawerPanel({
  task,
  onClose,
  token,
  onUpdated,
}: {
  task: ManualTask;
  onClose: () => void;
  token: string | null;
  onUpdated: () => void;
}) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(() => task.notes || '');
  const [saving, setSaving] = useState(false);
  const checklist = task.checklist || [];
  const doneSteps = checklist.filter((c) => c.completed).length;

  const patchTask = async (body: Record<string, unknown>) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/manual-tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const toggleChecklist = async (itemId: string) => {
    const next: ManualTaskChecklistItem[] = checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    await patchTask({ checklist: next });
  };

  const saveNotes = async () => {
    await patchTask({ notes: notes.trim() || null });
  };

  const postAction = async (path: string) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/manual-tasks/${task.id}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const onRelated = () => {
    const payload = task.action_payload || {};
    if (task.action_type === 'internal_route' && typeof payload.route === 'string') {
      navigate(payload.route);
      onClose();
    } else if (task.action_type === 'external_url' && typeof payload.url === 'string') {
      window.open(payload.url, '_blank', 'noopener,noreferrer');
    }
  };

  const copyCommand = () => {
    const cmd = task.action_payload?.command;
    if (typeof cmd === 'string') navigator.clipboard.writeText(cmd);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close task"
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed z-[70] flex flex-col bg-surface border border-surface-border shadow-2xl transition-transform duration-300',
          'inset-y-0 right-0 w-full max-w-md translate-x-0'
        )}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-surface-border">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Action Center
            </p>
            <h2 className="text-lg font-bold text-white leading-snug">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-300 text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {task.description && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Why this matters
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
            </section>
          )}

          {checklist.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Checklist
              </h3>
              <TaskProgress completed={doneSteps} total={checklist.length} className="mb-3" />
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={!token || saving}
                      onChange={() => void toggleChecklist(item.id)}
                      className="mt-1 rounded border-surface-border bg-dark-300 text-brand-500 focus:ring-brand-500/40"
                    />
                    <span
                      className={clsx(
                        'text-sm',
                        item.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                      )}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!token}
              rows={4}
              placeholder="Capture context, blockers, or evidence…"
              className="w-full rounded-xl bg-dark-300 border border-surface-border px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <button
              type="button"
              disabled={!token || saving}
              onClick={() => void saveNotes()}
              className="mt-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              Save notes
            </button>
          </section>

          {task.action_type === 'command' && typeof task.action_payload?.command === 'string' && (
            <button
              type="button"
              onClick={() => void copyCommand()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy command
            </button>
          )}
        </div>

        <div className="p-4 border-t border-surface-border space-y-2 bg-dark-300/40">
          {task.action_type === 'internal_route' && task.action_payload && 'route' in task.action_payload && (
            <button
              type="button"
              onClick={onRelated}
              className="w-full rounded-xl bg-brand-500/15 border border-brand-500/35 py-2.5 text-sm font-semibold text-brand-400 hover:bg-brand-500/25"
            >
              Open related page
            </button>
          )}
          {task.action_type === 'external_url' && task.action_payload && 'url' in task.action_payload && (
            <button
              type="button"
              onClick={onRelated}
              className="w-full rounded-xl bg-dark-300 border border-surface-border py-2.5 text-sm font-semibold text-slate-200 hover:bg-surface-light inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open link
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!token || saving}
              onClick={() => void postAction('/complete')}
              className="rounded-xl bg-emerald-500/15 border border-emerald-500/35 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40"
            >
              Mark done
            </button>
            <button
              type="button"
              disabled={!token || saving}
              onClick={() => void patchTask({ status: 'blocked' })}
              className="rounded-xl bg-amber-500/10 border border-amber-500/30 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 disabled:opacity-40"
            >
              Blocked
            </button>
          </div>
          <button
            type="button"
            disabled={!token || saving}
            onClick={() => void postAction('/skip')}
            className="w-full rounded-xl py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            Skip for now
          </button>
        </div>
      </aside>
    </>
  );
}

export function TaskDrawer({ task, open, onClose, token, onUpdated }: TaskDrawerProps) {
  if (!open || !task) return null;
  return <TaskDrawerPanel key={task.id} task={task} onClose={onClose} token={token} onUpdated={onUpdated} />;
}
