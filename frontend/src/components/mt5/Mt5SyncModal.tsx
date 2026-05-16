import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getToken } from '../../lib/auth';
import { useStore } from '../../store/useStore';
import { useToast } from '../ui/Toast';
import { clsx } from 'clsx';

type Mt5SettingsResponse = {
  server?: string | null;
  login?: string | null;
  has_password?: boolean;
};

export function Mt5SyncModal({ open }: { open: boolean }) {
  const { syncTrades, closeMt5SyncModal } = useStore();
  const { showToast } = useToast();
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [hasSavedPassword, setHasSavedPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch('/api/v1/settings/mt5', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as Mt5SettingsResponse;
        if (res.ok) {
          setServer(data.server ?? '');
          setLogin(data.login ?? '');
          setHasSavedPassword(Boolean(data.has_password));
          setPassword('');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeMt5SyncModal();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await syncTrades({
      server,
      login,
      password: password || undefined,
    });
    if (!res.ok) {
      showToast(res.detail ?? 'Sync failed');
      return;
    }
    const msg =
      res.import_kind === 'mt5_demo' || res.demo_fallback_used
        ? res.message ?? 'Demo sample import — not live broker data.'
        : res.status === 'demo'
          ? res.message ?? 'Demo trades imported (MT5 terminal not available here).'
          : `Sync complete${res.message ? ` — ${res.message}` : '.'}`;
    showToast(msg);
    closeMt5SyncModal();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mt5-sync-title"
      onMouseDown={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-xl border border-surface-border bg-dark-400 shadow-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 id="mt5-sync-title" className="text-lg font-semibold text-white">
            Sync MetaTrader 5
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-light hover:text-white"
            aria-label="Close"
            onClick={() => {
              closeMt5SyncModal();
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <p className="text-sm text-slate-400">
            Credentials are sent once over HTTPS and can be saved encrypted under Settings.
          </p>

          <div>
            <label className="label" htmlFor="mt5-server">
              Server
            </label>
            <input
              id="mt5-server"
              className="input"
              autoComplete="off"
              placeholder="Broker-Demo"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label" htmlFor="mt5-login">
              Login
            </label>
            <input
              id="mt5-login"
              className="input"
              inputMode="numeric"
              autoComplete="username"
              placeholder="Account number"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label" htmlFor="mt5-password">
              Password
            </label>
            <input
              id="mt5-password"
              type="password"
              className="input"
              autoComplete="current-password"
              placeholder={
                hasSavedPassword
                  ? 'Leave blank to use password saved in Settings'
                  : 'Main trading password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => {
                closeMt5SyncModal();
              }}
            >
              Cancel
            </button>
            <button type="submit" className={clsx('btn-primary flex-1')} disabled={loading}>
              Run sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
