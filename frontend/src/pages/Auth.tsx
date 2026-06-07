import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { LogIn, UserPlus } from 'lucide-react';
import { getToken, migrateLegacyToken, refreshAccessToken, setToken } from '../lib/auth';
import { useStore } from '../store/useStore';
import { TxCard } from '../components/ui/TxCard';
import { TxInput } from '../components/ui/TxInput';
import { TxButton } from '../components/ui/TxButton';
import { TxSegmentedControl } from '../components/ui/TxSegmentedControl';

type Tab = 'signin' | 'signup';

export function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      migrateLegacyToken();
      if (getToken()) {
        if (!cancelled) setCheckingSession(false);
        return;
      }
      const ok = await refreshAccessToken();
      if (ok && !cancelled) navigate('/', { replace: true });
      if (!cancelled) setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (checkingSession) {
    return null;
  }

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const path = tab === 'signin' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body = tab === 'signin' ? { email, password } : { email, password, name: name || '' };
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      void useStore.getState().hydrateLiveSession();
      navigate('/', { replace: true });
    } catch {
      setError('Network error — is the API running (see vite proxy / docker-compose)?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tx-bg-0)] p-6">
      <TxCard className="w-full max-w-md" padded>
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold text-[var(--tx-text-1)]">Tradex</h1>
          <p className="text-sm text-[var(--tx-text-3)]">Trader&apos;s Performance Lab</p>
        </div>

        <TxSegmentedControl
          items={[
            { id: 'signin', label: 'Sign in' },
            { id: 'signup', label: 'Sign up' },
          ]}
          value={tab}
          onChange={(id) => {
            setTab(id as Tab);
            setError(null);
          }}
          className="mb-6"
        />

        <form onSubmit={submit} className="space-y-4">
          {tab === 'signup' && (
            <TxInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trader"
              autoComplete="name"
            />
          )}
          <TxInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <TxInput
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            helper={tab === 'signup' ? 'Minimum 8 characters' : undefined}
          />

          {error && (
            <div className="rounded-[var(--tx-r-16)] border border-[var(--tx-loss)]/40 bg-[var(--tx-loss-soft)] px-3 py-2 text-sm text-[var(--tx-loss)]">
              {error}
            </div>
          )}

          <TxButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            className={clsx('justify-center')}
          >
            {loading ? (
              'Please wait…'
            ) : tab === 'signin' ? (
              <>
                <LogIn className="h-4 w-4" /> Sign in
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create account
              </>
            )}
          </TxButton>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--tx-text-3)]">
          Your data stays separated by source: manual, MT5, paper, and backtest.
        </p>
      </TxCard>
    </div>
  );
}
