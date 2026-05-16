# Tradex — Next Steps for Agent

This document describes what to build next on the Tradex trading journal platform. The codebase already has a working React + FastAPI foundation. Read this file and implement each phase in order.

---

## Current State (Already Done)

- React SPA with **sign-in / sign-up** (`/auth`), JWT in `localStorage`, guarded shell (**1.3**); **`Mt5SyncModal`**; **`syncTrades`** → **`POST /api/v1/sync/mt5`**; **`useStore.hydrateFromApi`** loads trades, **`/analytics/metrics`**, notebook, challenges, and **`POST /ai/insights`** when a token exists; **Header** shows **Live** vs **Demo**; **Action Center** includes **`GET /api/v1/setup/health`**; **Playbooks** use **journal-derived** cards when live (slice **7.3**) and demo mocks when logged out; **PWA** uses **`navigateFallback`** + five-item **mobile nav** (Phase **5**)
- FastAPI: JWT (**1.1**), PostgreSQL trades / notebook / challenges (**1.2**), trade screenshots (**2.1–2.2**), **`GET`/`PUT /api/v1/settings/mt5`**, **`POST /api/v1/sync/mt5`**, analytics, AI insights, **`GET /api/v1/setup/health`**, manual tasks API
- **`Authorization: Bearer`** on `/api/v1/*` except `GET /health` and `POST /auth/register` / `POST /auth/login`

---

## Phase 1 — Authentication & Real Database

**Goal:** Make the app multi-user with real persistent data.

### Tasks

1. **Add user auth to the backend** ✓ *(slice 1.1)*

2. **Connect PostgreSQL** ✓ *(slice 1.2 — see `backend/app/models/notebook.py`, `challenge.py`, `services/trade_codec.py`)*
   - Replace the in-memory `_trades`, `_notebook`, `_challenges` lists in `routes.py` with real SQLAlchemy DB queries
   - The `Trade` model already exists in `backend/app/models/trade.py`
   - `User` model: **`backend/app/models/user.py`** ✓
   - Add `NotebookEntry` and `PropChallenge` models
   - `get_db` / engine: **`backend/app/database.py`** ✓ *(NEXT_STEPS previously suggested `core/database.py`; canonical path is `app/database.py`)*
   - File to edit: `backend/app/api/v1/routes.py`

3. **Add login/signup UI to frontend** ✓ *(slice 1.3 — `Auth.tsx`, `ProtectedLayout`, `lib/auth.ts`, Settings sign out, Vite `/api` proxy)*

---

## Phase 2 — Trade Screenshot Upload

**Goal:** Let traders attach chart screenshots to their trades.

### Tasks

1. **Backend: file upload endpoint** ✓ *(slice 2.1 — `?slot=before|after`, stores under `UPLOAD_ROOT/screenshots/{user_id}/`, columns `screenshot_before_url` / `screenshot_after_url`; served via `/uploads`)*

2. **Frontend: screenshot section in trade drawer** ✓ *(slice 2.2 — `ScreenshotUploadZone` in `Journal.tsx`, thumbnails, Bearer upload; Vite proxies `/uploads`)*

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
   - Bottom bar on small screens: **Home**, **Journal**, **Playbooks**, **Prop Firm**, **Settings** (`MobileNav.tsx`). Wider layouts keep the full sidebar (including Action Center, Reports, etc.).

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
