/**
 * Build-time feature flags (Vite `import.meta.env`).
 * Defaults suit a personal / offline install: open shell, no sign-in UI.
 *
 * - `VITE_AUTH_UI_ENABLED=true` — mount `/auth` (sign-in / register).
 * - `VITE_REQUIRE_LOGIN=true` — block the app until a JWT exists (pairs with auth UI).
 */

export const authUiEnabled = import.meta.env.VITE_AUTH_UI_ENABLED === 'true';

export const requireLogin = import.meta.env.VITE_REQUIRE_LOGIN === 'true';
