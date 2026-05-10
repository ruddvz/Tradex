import { Navigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { getToken } from '../../lib/auth';
import { authUiEnabled, requireLogin } from '../../lib/featureFlags';

/** When `requireLogin` is set, blocks the shell until a JWT exists (must enable auth UI). */
export function ProtectedLayout() {
  if (import.meta.env.DEV && requireLogin && !authUiEnabled) {
    console.warn(
      '[Tradex] VITE_REQUIRE_LOGIN is true but VITE_AUTH_UI_ENABLED is false — enable auth UI or users cannot sign in.'
    );
  }
  if (requireLogin && !getToken()) {
    return <Navigate to="/auth" replace />;
  }
  return <Layout />;
}
