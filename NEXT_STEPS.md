# Tradex — Next Steps for Agent

This document describes what to build next on the Tradex trading journal platform. The codebase already has a working React + FastAPI foundation. Read this file and implement each phase in order.

---

## Current State (Already Done)

- React: **`Mt5SyncModal`** opened from header/sidebar sync; Zustand **`syncTrades`** posts JSON to **`POST /api/v1/sync/mt5`** and refreshes trades via **`GET /api/v1/trades`** when JWT present (`frontend/src/lib/auth.ts` → `tradex_access_token`)
- FastAPI: **`GET`/`PUT /api/v1/settings/mt5`** — MT5 trading password stored encrypted (**Fernet**, key from `SECRET_KEY`); **`POST /api/v1/sync/mt5`** accepts JSON body and merges with saved credentials; without a live MT5 terminal, demo sample trades are still imported
- **JWT auth** as before; trades/notebook/challenges remain **in-memory per user** until Phase 1.2 persistence

---

## Phase 1 — Authentication & Real Database

**Goal:** Make the app multi-user with real persistent data.

### Tasks

1. **Add user auth to the backend** ✓ *(slice 1.1 — see `backend/app/api/v1/routes.py`, `backend/app/models/user.py`)*
   - Dependencies: `python-jose`, **bcrypt** (already in requirements.txt)
   - Create a `users` table: `id`, `email`, `hashed_password`, `name`, `plan` (`free`/`pro`), `created_at`
   - Add `POST /api/v1/auth/register` — create user, return JWT token
   - Add `POST /api/v1/auth/login` — verify password, return JWT token
   - Add `GET /api/v1/auth/me` — return current user from token
   - Protect all existing routes with `Depends(get_current_user)`
   - Files: `backend/app/api/v1/routes.py`, `backend/app/api/deps.py`, `backend/app/core/security.py`, `backend/app/database.py`

2. **Connect PostgreSQL**
   - Replace the in-memory `_trades`, `_notebook`, `_challenges` lists in `routes.py` with real SQLAlchemy DB queries
   - The `Trade` model already exists in `backend/app/models/trade.py`
   - `User` model: **`backend/app/models/user.py`** ✓
   - Add `NotebookEntry` and `PropChallenge` models
   - `get_db` / engine: **`backend/app/database.py`** ✓ *(NEXT_STEPS previously suggested `core/database.py`; canonical path is `app/database.py`)*
   - File to edit: `backend/app/api/v1/routes.py`

3. **Add login/signup UI to frontend**
   - Create `frontend/src/pages/Auth.tsx` with two tabs: Sign In / Sign Up
   - Use same dark design system (see `frontend/src/index.css` for classes like `.card`, `.input`, `.btn-primary`)
   - On successful login, store JWT in localStorage and redirect to `/`
   - Add an auth check in `frontend/src/App.tsx` — if no token, redirect to `/auth`
   - Add logout button to the Settings page

---

## Phase 2 — Trade Screenshot Upload

**Goal:** Let traders attach chart screenshots to their trades.

### Tasks

1. **Backend: file upload endpoint**
   - Add `POST /api/v1/trades/{id}/screenshot` that accepts a multipart image file
   - Save to `backend/uploads/screenshots/{user_id}/{trade_id}.png`
   - Return the file URL, store it in the `Trade.screenshot_url` column
   - Install `aiofiles` (already in requirements.txt)

2. **Frontend: screenshot section in trade drawer**
   - The trade drawer is in `frontend/src/pages/Journal.tsx` — component `TradeDrawer`
   - Add a "Before/After" screenshot upload section at the bottom of the drawer
   - Two upload zones side by side: "Before Trade" and "After Trade"
   - Show thumbnail preview once uploaded
   - Use a simple `<input type="file" accept="image/*">` with drag-and-drop styling

---

## Phase 3 — Real MT5 Sync Button

**Goal:** Make the "Sync MT5" button in the UI actually call the backend.

### Tasks

1. **Frontend: connect sync button to API** ✓ *(Phase 3 — `openMt5SyncModal`, `components/mt5/Mt5SyncModal.tsx`, store `syncTrades` + `refreshTradesFromApi`)*

2. **Settings page: save MT5 credentials** ✓ *(encrypted `mt5_password_encrypted` on `User`; `GET`/`PUT /api/v1/settings/mt5`)*

---

## Phase 4 — Daily Email Report

**Goal:** Send traders a daily P&L summary email.

### Tasks

1. **Backend: email service**
   - Create `backend/app/services/email_service.py`
   - Use `sendgrid` or `smtplib` to send HTML emails
   - Email template should show: today's P&L, win rate, number of trades, equity
   - Add `POST /api/v1/notifications/send-daily` endpoint (protected, called by a cron job)

2. **Celery beat task**
   - Add a Celery beat schedule in `backend/app/celery_app.py`
   - Run `send_daily_reports` task every day at 8 PM user local time
   - Only send to users who have `dailyReport: true` in their notification settings

3. **Settings toggle**
   - The "Daily Report" toggle already exists in `frontend/src/pages/Settings.tsx`
   - Wire it to `PUT /api/v1/settings/notifications` API call

---

## Phase 5 — Mobile PWA

**Goal:** Make the app installable on iPhone and Android.

### Tasks

1. **Add PWA manifest**
   - Create `frontend/public/manifest.json` with app name "Tradex", icons, theme color `#0b0f16`
   - Add `<link rel="manifest">` to `frontend/index.html`
   - Create app icons at 192×192 and 512×512 (dark background, white chart line logo)

2. **Add service worker**
   - Install `vite-plugin-pwa` in frontend: `npm install vite-plugin-pwa`
   - Configure in `frontend/vite.config.ts` to cache the shell and static assets
   - Offline fallback page: show a "You're offline — cached data shown" banner

3. **Mobile nav improvements**
   - Add a bottom navigation bar on mobile (screens < 640px) as an alternative to the sidebar
   - Show 5 icons: Dashboard, Journal, Playbooks, PropFirm, Settings
   - The sidebar should be hidden on mobile and replaced with this bottom bar
   - Edit `frontend/src/components/layout/Layout.tsx` and `Sidebar.tsx`

---

## File Map (Key Files to Edit)

| What to change | File |
|---|---|
| Backend routes + auth | `backend/app/api/v1/routes.py` |
| Database connection | `backend/app/core/database.py` (create this) |
| Trade model | `backend/app/models/trade.py` |
| AI insights | `backend/app/services/ai_service.py` |
| Frontend state | `frontend/src/store/useStore.ts` |
| Dashboard page | `frontend/src/pages/Dashboard.tsx` |
| Journal page + drawer | `frontend/src/pages/Journal.tsx` |
| Settings page | `frontend/src/pages/Settings.tsx` |
| Sidebar | `frontend/src/components/layout/Sidebar.tsx` |
| App routing | `frontend/src/App.tsx` |
| Styles/design system | `frontend/src/index.css` + `tailwind.config.js` |

---

## Design Rules (Do Not Change)

- Dark theme only — background is `bg-dark-400` (`#0b0f16`)
- Primary color is `brand-500` = `#10b981` (emerald green)
- All cards use the `.card` class
- Buttons use `.btn-primary` or `.btn-secondary`
- Form inputs use the `.input` class
- Keep the collapsible sidebar structure
- All new pages must include the `<Header title="..." />` component at the top

---

## How to Run Locally

```bash
# Frontend (demo mode, no backend needed)
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Full stack
docker-compose up -d
# → http://localhost (UI)  |  http://localhost:8000/docs (API)
```
