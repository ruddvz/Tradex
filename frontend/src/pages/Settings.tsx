import { Link, Shield, Bell, Database, User, CheckCircle2, RefreshCw, Trash2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { PageDataTrustBar } from '../components/ui/PageDataTrustBar';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { clearToken, getToken } from '../lib/auth';
import { authUiEnabled } from '../lib/featureFlags';
import { fetchRiskProfiles, updateRiskProfile, type RiskProfileRow } from '../lib/api/risk';
import {
  fetchMt5Settings,
  fetchNotificationSettings,
  updateMt5Settings,
  updateNotificationSettings,
} from '../lib/api/settings';
import { fetchImportBatches, type ImportBatch } from '../lib/api/imports';

const brokers = [
  { name: 'Exness', logo: 'EX', connected: true },
  { name: 'IC Markets', logo: 'IC', connected: false },
  { name: 'XM', logo: 'XM', connected: false },
  { name: 'Pepperstone', logo: 'PP', connected: false },
  { name: 'FTMO', logo: 'FT', connected: false },
];

export function Settings() {
  const navigate = useNavigate();
  const {
    account,
    syncTrades,
    isSyncing,
    openMt5SyncModal,
    hydrateLiveSession,
    tradingAccounts,
    createTradingAccount,
    dataMode,
  } = useStore();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    drawdownAlerts: true,
    dailyReport: false,
  });
  const [connectedBrokers, setConnectedBrokers] = useState(['Exness']);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('demo');
  const [newAccountBalance, setNewAccountBalance] = useState('10000');
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [mt5Server, setMt5Server] = useState('');
  const [mt5Login, setMt5Login] = useState('');
  const [mt5Password, setMt5Password] = useState('');
  const [mt5HasPassword, setMt5HasPassword] = useState(false);
  const [mt5Loading, setMt5Loading] = useState(true);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [importsLoading, setImportsLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = getToken();
      if (!token) {
        setMt5Loading(false);
        return;
      }
      setMt5Loading(true);
      try {
        const data = await fetchMt5Settings();
        setMt5Server(data.server ?? '');
        setMt5Login(data.login ?? '');
        setMt5HasPassword(Boolean(data.has_password));
      } catch {
        /* demo / offline */
      } finally {
        setMt5Loading(false);
      }
    })();
  }, []);

  const mt5Configured = Boolean(mt5Server.trim() && mt5Login.trim()) && mt5HasPassword;

  const saveMt5Settings = async () => {
    const token = getToken();
    if (!token) return;
    const body: Record<string, string> = {
      server: mt5Server.trim(),
      login: mt5Login.trim(),
    };
    if (mt5Password.trim()) body.password = mt5Password.trim();
    try {
      const data = await updateMt5Settings(body);
      setMt5HasPassword(Boolean(data.has_password));
    } catch {
      showToast('Could not save MT5 settings', 'warning');
      return;
    }
    setMt5Password('');
    showToast('MT5 settings saved');
  };

  const disconnectMt5 = async () => {
    const token = getToken();
    if (!token) return;
    try {
      await updateMt5Settings({ server: '', login: '', password: '' });
    } catch {
      showToast('Could not clear MT5 credentials', 'warning');
      return;
    }
    setMt5Server('');
    setMt5Login('');
    setMt5Password('');
    setMt5HasPassword(false);
    showToast('MT5 credentials cleared');
  };

  const runSyncFromSettings = async () => {
    const r = await syncTrades();
    if (r.ok) {
      showToast(
        r.status === 'demo'
          ? (r.message ?? 'Demo trades imported (MT5 not available in this environment).')
          : 'Sync complete.'
      );
      return;
    }
    showToast(r.detail ?? 'Sync failed');
    if ((r.detail ?? '').includes('Missing MT5')) openMt5SyncModal();
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    void fetchNotificationSettings()
      .then((data) => {
        setNotifications({
          email: Boolean(data.email),
          push: Boolean(data.push),
          drawdownAlerts: Boolean(data.drawdownAlerts),
          dailyReport: Boolean(data.dailyReport),
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    void (async () => {
      const token = getToken();
      if (!token) return;
      setImportsLoading(true);
      try {
        setImportBatches(await fetchImportBatches());
      } catch {
        /* optional */
      } finally {
        setImportsLoading(false);
      }
    })();
  }, []);

  const persistNotifications = async (next: typeof notifications) => {
    const token = getToken();
    if (!token) return;
    try {
      await updateNotificationSettings(next);
      showToast('Notifications saved');
    } catch {
      showToast('Could not save notifications', 'warning');
    }
  };

  const toggleBroker = (name: string) => {
    const wasConnected = connectedBrokers.includes(name);
    setConnectedBrokers((prev) =>
      wasConnected ? prev.filter((b) => b !== name) : [...prev, name]
    );
    showToast(wasConnected ? `${name} disconnected` : `${name} connected`);
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Configure your trading environment" />

      <PageDataTrustBar />

      <div className="page-shell p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Account */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">Account Profile</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-dark-300 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-lg font-bold text-white">
                T
              </div>
              <div>
                <div className="font-semibold text-white">Trader Pro</div>
                <div className="text-sm text-slate-400">trader@email.com</div>
              </div>
              <div className="ml-auto">
                <Badge variant="profit">Pro Plan</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Display Name</label>
                <input className="input" defaultValue="Trader Pro" />
              </div>
              <div>
                <label className="label">Base Currency</label>
                <select className="select">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>INR</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => showToast('Settings saved successfully')}
            >
              Save Changes
            </button>
            {getToken() && (
              <button
                type="button"
                className="btn-secondary mt-3 w-full sm:w-auto"
                onClick={() => {
                  clearToken();
                  void hydrateLiveSession();
                  useStore.getState().clearPaperState();
                  showToast(authUiEnabled ? 'Signed out' : 'API session cleared');
                  navigate('/', { replace: true });
                }}
              >
                {authUiEnabled ? 'Sign out' : 'Clear saved API session'}
              </button>
            )}
          </div>

          {/* Trading accounts */}
          {getToken() && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-brand-400" />
                <h3 className="font-semibold text-white">Trading Accounts</h3>
                <Badge variant="info" size="xs">
                  {tradingAccounts.length} linked
                </Badge>
              </div>
              {dataMode === 'live' && tradingAccounts.length > 0 && (
                <ul className="mb-4 space-y-2 text-sm text-slate-300">
                  {tradingAccounts.map((a) => (
                    <li
                      key={a.id}
                      className="flex justify-between gap-2 rounded-lg border border-surface-border px-3 py-2"
                    >
                      <span className="font-medium text-white">{a.name}</span>
                      <span className="text-slate-400 capitalize">
                        {a.account_type} · ${a.current_balance.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="label">Account name</label>
                  <input
                    className="input"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="FTMO 100K"
                  />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value)}
                  >
                    <option value="demo">Demo</option>
                    <option value="live">Live</option>
                    <option value="prop">Prop</option>
                    <option value="paper">Paper</option>
                  </select>
                </div>
                <div>
                  <label className="label">Starting balance</label>
                  <input
                    className="input"
                    type="number"
                    min={100}
                    value={newAccountBalance}
                    onChange={(e) => setNewAccountBalance(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn-primary mt-4"
                disabled={creatingAccount || !newAccountName.trim()}
                onClick={async () => {
                  const bal = parseFloat(newAccountBalance);
                  if (!newAccountName.trim() || Number.isNaN(bal) || bal <= 0) {
                    showToast('Enter a valid name and balance', 'warning');
                    return;
                  }
                  setCreatingAccount(true);
                  const ok = await createTradingAccount({
                    name: newAccountName.trim(),
                    account_type: newAccountType,
                    starting_balance: bal,
                  });
                  setCreatingAccount(false);
                  if (ok) {
                    setNewAccountName('');
                    showToast('Trading account created');
                  } else {
                    showToast('Could not create account', 'warning');
                  }
                }}
              >
                {creatingAccount ? 'Creating…' : 'Create trading account'}
              </button>
            </div>
          )}

          {/* MT5 Connection */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Link className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">MT5 Auto-Sync</h3>
              {mt5Configured ? (
                <Badge variant="profit" size="xs">
                  Credentials saved
                </Badge>
              ) : (
                <Badge variant="warn" size="xs">
                  Not configured
                </Badge>
              )}
            </div>

            <p className="text-sm text-slate-500 mb-4">
              The trading password is encrypted at rest. Sync uses saved credentials, or open the
              sync dialog from the header / sidebar to enter details once.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label" htmlFor="settings-mt5-server">
                  Server
                </label>
                <input
                  id="settings-mt5-server"
                  className="input"
                  value={mt5Server}
                  onChange={(e) => setMt5Server(e.target.value)}
                  placeholder="Broker-Demo"
                  disabled={mt5Loading}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="label" htmlFor="settings-mt5-login">
                  Login
                </label>
                <input
                  id="settings-mt5-login"
                  className="input"
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                  placeholder="Account number"
                  disabled={mt5Loading}
                  inputMode="numeric"
                  autoComplete="username"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="settings-mt5-password">
                  Password
                </label>
                <input
                  id="settings-mt5-password"
                  type="password"
                  className="input"
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                  placeholder={
                    mt5HasPassword
                      ? 'Leave blank to keep current saved password'
                      : 'Main trading password'
                  }
                  disabled={mt5Loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="p-4 bg-dark-300 rounded-xl mb-4 border border-surface-border">
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-slate-500">Demo balance: </span>
                  <span className="text-white font-medium">
                    ${account.balance.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Demo equity: </span>
                  <span className="text-brand-400 font-medium">
                    ${account.equity.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={saveMt5Settings}
                  disabled={mt5Loading}
                  className="btn-secondary text-sm"
                >
                  Save MT5 credentials
                </button>
                <button
                  type="button"
                  onClick={runSyncFromSettings}
                  disabled={isSyncing || mt5Loading}
                  className="btn-primary text-sm inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  type="button"
                  onClick={disconnectMt5}
                  disabled={mt5Loading}
                  className="btn-danger text-sm inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear saved credentials
                </button>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-400 mb-3">Connect Another Broker</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {brokers.map((b) => {
                const connected = connectedBrokers.includes(b.name);
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => toggleBroker(b.name)}
                    className={clsx(
                      'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-left',
                      connected
                        ? 'border-brand-500/30 bg-brand-500/5'
                        : 'border-surface-border bg-dark-300 hover:bg-surface-light'
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-light flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {b.logo}
                    </div>
                    <span className="text-sm text-slate-300">{b.name}</span>
                    {connected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  key: 'email',
                  label: 'Email Notifications',
                  desc: 'Daily performance summary via email',
                },
                { key: 'push', label: 'Push Notifications', desc: 'Real-time trade sync alerts' },
                {
                  key: 'drawdownAlerts',
                  label: 'Drawdown Alerts',
                  desc: 'Alert when drawdown exceeds threshold',
                },
                {
                  key: 'dailyReport',
                  label: 'Daily Report',
                  desc: 'End-of-day performance report',
                },
              ].map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between p-3 bg-dark-300 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{n.label}</div>
                    <div className="text-xs text-slate-500">{n.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const key = n.key as keyof typeof notifications;
                      setNotifications((prev) => {
                        const next = { ...prev, [key]: !prev[key] };
                        void persistNotifications(next);
                        return next;
                      });
                    }}
                    className={clsx(
                      'relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0',
                      notifications[n.key as keyof typeof notifications]
                        ? 'bg-brand-500'
                        : 'bg-surface-border'
                    )}
                  >
                    <div
                      className={clsx(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow',
                        notifications[n.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risk profile (paper / future execution) */}
          <RiskProfileSettings showToast={showToast} />

          {/* Import history */}
          <div className="card p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-400" />
                <h3 className="font-semibold text-white">Import History</h3>
              </div>
              <button
                type="button"
                className="btn-secondary text-xs min-h-[44px] px-3"
                disabled={!getToken() || importsLoading}
                onClick={() => {
                  setImportsLoading(true);
                  void fetchImportBatches()
                    .then(setImportBatches)
                    .catch(() => showToast('Could not load imports', 'warning'))
                    .finally(() => setImportsLoading(false));
                }}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', importsLoading && 'animate-spin')} />
                Refresh
              </button>
            </div>
            {!getToken() ? (
              <p className="text-sm text-slate-500">Sign in to view MT5 and CSV import batches.</p>
            ) : importBatches.length === 0 ? (
              <p className="text-sm text-slate-500">
                No imports yet. Run MT5 sync or upload CSV candles from Backtests.
              </p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {importBatches.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-surface-border bg-dark-300/50 px-3 py-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={b.status === 'completed' ? 'profit' : 'warn'} size="xs">
                        {b.source}
                      </Badge>
                      <span className="text-slate-400">{b.status}</span>
                      {b.started_at && (
                        <span className="text-slate-500 ml-auto">{b.started_at.slice(0, 16)}</span>
                      )}
                    </div>
                    <p className="text-slate-300">
                      +{b.records_inserted} new · {b.records_skipped_duplicate} skipped dup ·{' '}
                      {b.records_seen} seen
                      {b.records_failed > 0 ? ` · ${b.records_failed} failed` : ''}
                    </p>
                    {b.warnings.length > 0 && (
                      <p className="text-amber-200/90 mt-1">{b.warnings.join(' ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Data */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">Data Management</h3>
            </div>
            <div className="space-y-2">
              <button className="btn-secondary w-full justify-center">
                <Database className="w-4 h-4" /> Export All Data (CSV)
              </button>
              <button className="btn-secondary w-full justify-center">
                <Database className="w-4 h-4" /> Export Trade History (PDF)
              </button>
              <button className="btn-danger w-full justify-center">
                <Trash2 className="w-4 h-4" /> Delete All Trade Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskProfileSettings({ showToast }: { showToast: (msg: string) => void }) {
  const [profiles, setProfiles] = useState<RiskProfileRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    max_risk_per_trade_percent: 1,
    max_daily_loss_percent: 5,
    max_open_positions: 5,
    max_positions_per_symbol: 2,
    require_stop_loss: true,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = getToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const rows = await fetchRiskProfiles();
        if (cancelled) return;
        setProfiles(rows);
        const first = rows[0];
        if (first) {
          setActiveId(first.id);
          setForm({
            max_risk_per_trade_percent: first.max_risk_per_trade_percent,
            max_daily_loss_percent: first.max_daily_loss_percent,
            max_open_positions: first.max_open_positions,
            max_positions_per_symbol: first.max_positions_per_symbol,
            require_stop_loss: first.require_stop_loss,
          });
        }
      } catch {
        if (!cancelled) showToast('Could not load risk profiles');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const saveRisk = async () => {
    if (!activeId) {
      showToast('Sign in to save risk profile');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateRiskProfile(activeId, form);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast('Risk profile saved');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-brand-400" />
        <h3 className="font-semibold text-white">Risk profile</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Limits apply to paper orders and future automation. Journal-only trading is not blocked
        here.
      </p>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : !getToken() ? (
        <p className="text-sm text-slate-500">Sign in to edit your risk profile.</p>
      ) : profiles.length === 0 ? (
        <p className="text-sm text-slate-500">
          No profile yet — register or refresh to seed defaults.
        </p>
      ) : (
        <>
          {profiles.length > 1 && (
            <div className="mb-4">
              <label className="label">Profile</label>
              <select
                className="input w-full"
                value={activeId ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  setActiveId(id);
                  const row = profiles.find((p) => p.id === id);
                  if (row) {
                    setForm({
                      max_risk_per_trade_percent: row.max_risk_per_trade_percent,
                      max_daily_loss_percent: row.max_daily_loss_percent,
                      max_open_positions: row.max_open_positions,
                      max_positions_per_symbol: row.max_positions_per_symbol,
                      require_stop_loss: row.require_stop_loss,
                    });
                  }
                }}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max risk per trade %</label>
              <input
                type="number"
                step="0.1"
                className="input w-full"
                value={form.max_risk_per_trade_percent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_risk_per_trade_percent: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label className="label">Max daily loss %</label>
              <input
                type="number"
                step="0.1"
                className="input w-full"
                value={form.max_daily_loss_percent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_daily_loss_percent: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label className="label">Max open positions</label>
              <input
                type="number"
                className="input w-full"
                value={form.max_open_positions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_open_positions: Number(e.target.value) }))
                }
              />
            </div>
            <div>
              <label className="label">Max per symbol</label>
              <input
                type="number"
                className="input w-full"
                value={form.max_positions_per_symbol}
                onChange={(e) =>
                  setForm((f) => ({ ...f, max_positions_per_symbol: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.require_stop_loss}
              onChange={(e) => setForm((f) => ({ ...f, require_stop_loss: e.target.checked }))}
            />
            Require stop loss on paper orders
          </label>
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={saving}
            onClick={() => void saveRisk()}
          >
            {saving ? 'Saving…' : 'Save risk profile'}
          </button>
        </>
      )}
    </div>
  );
}
