import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { LogIn, UserPlus } from 'lucide-react';
import { setToken, getToken } from '../lib/auth';

type Tab = 'signin' | 'signup';

export function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const path = tab === 'signin' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body =
        tab === 'signin'
          ? { email, password }
          : { email, password, name: name || '' };
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Authentication failed');
        return;
      }
      if (!data.access_token) {
        setError('No token returned');
        return;
      }
      setToken(data.access_token);
      navigate('/', { replace: true });
    } catch {
      setError('Network error — is the API running (see vite proxy / docker-compose)?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-400">
      <div className="w-full max-w-md card p-8 shadow-card-hover border border-surface-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Tradex</h1>
          <p className="text-sm text-slate-500">Trader&apos;s Performance Lab</p>
        </div>

        <div className="flex rounded-xl bg-dark-300 p-1 mb-6">
          <button
            type="button"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
              tab === 'signin' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-slate-200'
            )}
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
              tab === 'signup' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-slate-200'
            )}
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Trader"
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />
            {tab === 'signup' && (
              <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Demo UI still uses local journal data until trades are wired from the API.
        </p>
      </div>
    </div>
  );
}
