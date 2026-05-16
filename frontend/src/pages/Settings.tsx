import { Link, Shield, Bell, Database, User, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';
import { clearToken, getToken } from '../lib/auth';
import { authUiEnabled } from '../lib/featureFlags';

const brokers = [
  { name: 'Exness', logo: 'EX', connected: true },
  { name: 'IC Markets', logo: 'IC', connected: false },
  { name: 'XM', logo: 'XM', connected: false },
  { name: 'Pepperstone', logo: 'PP', connected: false },
  { name: 'FTMO', logo: 'FT', connected: false },
];

export function Settings() {
  const navigate = useNavigate();
  const { account, syncTrades, isSyncing, openMt5SyncModal } = useStore();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, push: true, drawdownAlerts: true, dailyReport: false });
  const [connectedBrokers, setConnectedBrokers] = useState(['Exness']);

  const [mt5Server, setMt5Server] = useState('');
  const [mt5Login, setMt5Login] = useState('');
  const [mt5Password, setMt5Password] = useState('');
  const [mt5HasPassword, setMt5HasPassword] = useState(false);
  const [mt5Loading, setMt5Loading] = useState(true);

  useEffect(() => {
    void (async () => {
      const token = getToken();
      if (!token) {
        setMt5Loading(false);
        return;
      }
      setMt5Loading(true);
      try {
        const res = await fetch('/api/v1/settings/mt5', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as {
          server?: string | null;
          login?: string | null;
          has_password?: boolean;
        };
        if (res.ok) {
          setMt5Server(data.server ?? '');
          setMt5Login(data.login ?? '');
          setMt5HasPassword(Boolean(data.has_password));
        }
      } finally {
        setMt5Loading(false);
      }
    })();
  }, []);

  const mt5Configured =
    Boolean(mt5Server.trim() && mt5Login.trim()) && mt5HasPassword;

  const saveMt5Settings = async () => {
    const token = getToken();
    if (!token) return;
    const body: Record<string, string> = {
      server: mt5Server.trim(),
      login: mt5Login.trim(),
    };
    if (mt5Password.trim()) body.password = mt5Password.trim();
    const res = await fetch('/api/v1/settings/mt5', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { has_password?: boolean };
    if (!res.ok) {
      showToast('Could not save MT5 settings');
      return;
    }
    setMt5HasPassword(Boolean(data.has_password));
    setMt5Password('');
    showToast('MT5 settings saved');
  };

  const disconnectMt5 = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/v1/settings/mt5', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ server: '', login: '', password: '' }),
    });
    if (!res.ok) {
      showToast('Could not clear MT5 credentials');
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
          ? r.message ?? 'Demo trades imported (MT5 not available in this environment).'
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
    void fetch('/api/v1/settings/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data || typeof data !== 'object') return;
        setNotifications({
          email: Boolean(data.email),
          push: Boolean(data.push),
          drawdownAlerts: Boolean(data.drawdownAlerts),
          dailyReport: Boolean(data.dailyReport),
        });
      })
      .catch(() => {});
  }, []);

  const persistNotifications = async (next: typeof notifications) => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/v1/settings/notifications', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(next),
    });
    if (res.ok) showToast('Notifications saved');
    else showToast('Could not save notifications');
  };

  const toggleBroker = (name: string) => {
    const wasConnected = connectedBrokers.includes(name);
    setConnectedBrokers(prev =>
      wasConnected ? prev.filter(b => b !== name) : [...prev, name]
    );
    showToast(wasConnected ? `${name} disconnected` : `${name} connected`);
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Configure your trading environment" />

      <div className="page-shell p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Account */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">Account Profile</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-dark-300 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-lg font-bold text-white">T</div>
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
                  useStore.getState().clearPaperState();
                  showToast(authUiEnabled ? 'Signed out' : 'API session cleared');
                  navigate('/', { replace: true });
                }}
              >
                {authUiEnabled ? 'Sign out' : 'Clear saved API session'}
              </button>
            )}
          </div>

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
              The trading password is encrypted at rest. Sync uses saved credentials, or open the sync dialog from the header / sidebar to enter details once.
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
                  <span className="text-white font-medium">${account.balance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Demo equity: </span>
                  <span className="text-brand-400 font-medium">${account.equity.toLocaleString()}</span>
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
              {brokers.map(b => {
                const connected = connectedBrokers.includes(b.name);
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => toggleBroker(b.name)}
                    className={clsx(
                      'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-left',
                      connected ? 'border-brand-500/30 bg-brand-500/5' : 'border-surface-border bg-dark-300 hover:bg-surface-light'
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
                { key: 'email', label: 'Email Notifications', desc: 'Daily performance summary via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Real-time trade sync alerts' },
                { key: 'drawdownAlerts', label: 'Drawdown Alerts', desc: 'Alert when drawdown exceeds threshold' },
                { key: 'dailyReport', label: 'Daily Report', desc: 'End-of-day performance report' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-white">{n.label}</div>
                    <div className="text-xs text-slate-500">{n.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const key = n.key as keyof typeof notifications;
                      setNotifications(prev => {
                        const next = { ...prev, [key]: !prev[key] };
                        void persistNotifications(next);
                        return next;
                      });
                    }}
                    className={clsx(
                      'relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0',
                      notifications[n.key as keyof typeof notifications] ? 'bg-brand-500' : 'bg-surface-border'
                    )}
                  >
                    <div className={clsx(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow',
                      notifications[n.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Settings */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">Risk Management Defaults</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Default Risk %', defaultValue: '1', suffix: '%' },
                { label: 'Max Daily Loss', defaultValue: '3', suffix: '%' },
                { label: 'Max Drawdown Alert', defaultValue: '10', suffix: '%' },
                { label: 'Daily Trade Limit', defaultValue: '5', suffix: 'trades' },
              ].map(s => (
                <div key={s.label}>
                  <label className="label">{s.label}</label>
                  <div className="relative">
                    <input type="number" className="input pr-12" defaultValue={s.defaultValue} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{s.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => showToast('Risk settings saved')}
            >
              Save Risk Settings
            </button>
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
