import { Navigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { getToken } from '../../lib/auth';

/** Blocks the app shell until a JWT exists (slice 1.3). */
export function ProtectedLayout() {
  if (!getToken()) {
    return <Navigate to="/auth" replace />;
  }
  return <Layout />;
}
