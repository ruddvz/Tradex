import { Link, Shield, Bell, Database, User, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { clsx } from 'clsx';
import { useState } from 'react';
import { clearToken } from '../lib/auth';

const brokers = [
  { name: 'Exness', logo: 'EX', connected: true },
  { name: 'IC Markets', logo: 'IC', connected: false },
  { name: 'XM', logo: 'XM', connected: false },
  { name: 'Pepperstone', logo: 'PP', connected: false },
  { name: 'FTMO', logo: 'FT', connected: false },
];

export function Settings() {
  const navigate = useNavigate();
  const { account, syncTrades, isSyncing } = useStore();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, push: true, drawdownAlerts: true, dailyReport: false });
  const [connectedBrokers, setConnectedBrokers] = useState(['Exness']);

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
            <button
              type="button"
              className="btn-secondary mt-3 w-full sm:w-auto"
              onClick={() => {
                clearToken();
                showToast('Signed out');
                navigate('/auth', { replace: true });
              }}
            >
              Sign out
            </button>
          </div>

          {/* MT5 Connection */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white">MT5 Auto-Sync</h3>
              <Badge variant="profit" size="xs">Connected</Badge>
            </div>

            <div className="p-4 bg-dark-300 rounded-xl mb-4 border border-brand-500/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{account.name}</div>
                  <div className="text-sm text-slate-400">{account.broker} · Account #PRO-10042</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
                  <span className="text-xs text-brand-400">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Balance: </span>
                  <span className="text-white font-medium">${account.balance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Equity: </span>
                  <span className="text-brand-400 font-medium">${account.equity.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => syncTrades()}
                  disabled={isSyncing}
                  className="btn-primary text-sm"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button className="btn-danger text-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
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
                    onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
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
