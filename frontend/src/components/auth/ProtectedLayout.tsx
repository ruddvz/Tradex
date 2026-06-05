import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { getToken, migrateLegacyToken, refreshAccessToken } from '../../lib/auth';
import { authUiEnabled, requireLogin } from '../../lib/featureFlags';
import { RouteFallback } from '../layout/RouteFallback';

/** When `requireLogin` is set, blocks the shell until a session exists (must enable auth UI). */
export function ProtectedLayout() {
  const [ready, setReady] = useState(!requireLogin);
  const [authed, setAuthed] = useState(!requireLogin);

  useEffect(() => {
    if (import.meta.env.DEV && requireLogin && !authUiEnabled) {
      console.warn(
        '[Tradex] VITE_REQUIRE_LOGIN is true but VITE_AUTH_UI_ENABLED is false — enable auth UI or users cannot sign in.'
      );
    }

    if (!requireLogin) return;

    let cancelled = false;
    void (async () => {
      migrateLegacyToken();
      if (getToken()) {
        if (!cancelled) {
          setAuthed(true);
          setReady(true);
        }
        return;
      }
      const ok = await refreshAccessToken();
      if (!cancelled) {
        setAuthed(ok);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <RouteFallback />;
  }

  if (requireLogin && !authed && !getToken()) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout />;
}
