import { useEffect } from 'react';
import { migrateLegacyToken, refreshAccessToken, getToken } from '../../lib/auth';

/** Restore cookie session on cold load when login is optional (demo shell + signed-in user). */
export function AuthBootstrap() {
  useEffect(() => {
    migrateLegacyToken();
    if (!getToken()) {
      void refreshAccessToken();
    }
  }, []);

  return null;
}
