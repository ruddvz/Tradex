import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { getToken } from '../lib/auth';
import { authUiEnabled } from '../lib/featureFlags';
import { clsx } from 'clsx';

export function PaperTrading() {
  const navigate = useNavigate();
  const { paperAccounts, createPaperAccount, refreshPaperAccountsFromApi } = useStore();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const token = getToken();

  const onCreate = async () => {
    if (!token) {
      showToast(authUiEnabled ? 'Sign in to create a paper account.' : 'Save an API session token first.');
      return;
    }
    setBusy(true);
    try {
      const ok = await createPaperAccount({
        name: `Practice ${paperAccounts.length + 1}`,
      });
      if (ok) showToast('Paper account created');
      else showToast('Could not create account — check API logs');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Paper trading"
        subtitle="Simulated accounts — no live execution"
        showDateRange={false}
      />

      <div className="page-shell px-5 py-6 space-y-6">
        {!token && (
          <div className="card p-5 border border-amber-500/25 bg-amber-500/5">
            <p className="text-sm text-text-secondary">
              {authUiEnabled ? (
                <>
                  <button
                    type="button"
                    className="text-analytics font-semibold hover:underline"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in
                  </button>{' '}
                  to create paper accounts stored on the API.
                </>
              ) : (
                'Enable auth UI or set a Bearer token session to use paper accounts with the API.'
              )}
            </p>
          </div>
        )}

        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-analytics/15 border border-analytics/25">
                <Landmark className="w-6 h-6 text-analytics" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Accounts</h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Sprint 4 shell — orders, fills, and journal tagging for simulated fills come next.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={busy || !token}
              onClick={() => void onCreate()}
              className="btn-primary self-start sm:self-center inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New paper account
            </button>
          </div>

          {paperAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface/40 px-4 py-10 text-center">
              <p className="text-sm text-text-muted">No paper accounts yet.</p>
              {token && (
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-analytics hover:underline"
                  disabled={busy}
                  onClick={() => void onCreate()}
                >
                  Create your first practice account
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-2">
              {paperAccounts.map((a) => (
                <li
                  key={a.id}
                  className={clsx(
                    'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3',
                    a.isActive ? 'border-analytics/30 bg-analytics/5' : 'border-surface-border bg-surface/50 opacity-80'
                  )}
                >
                  <div>
                    <p className="font-medium text-text-primary">{a.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {a.currency} · starting balance {a.startingBalance.toLocaleString()}
                      {!a.isActive && ' · inactive'}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border',
                      a.isActive
                        ? 'border-analytics/40 text-analytics bg-analytics/10'
                        : 'border-surface-border text-text-muted'
                    )}
                  >
                    {a.isActive ? 'Active' : 'Off'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {token && (
            <p className="text-xs text-text-muted mt-4">
              <button type="button" className="text-analytics hover:underline" onClick={() => void refreshPaperAccountsFromApi()}>
                Refresh list
              </button>
              {' · '}
              Header shows a Paper mode chip when any account here is active.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
