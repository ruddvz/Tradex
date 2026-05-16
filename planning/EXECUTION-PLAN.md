# Execution Plan

> Phase-based roadmap. Check off slices as you ship them.
> Agents reference this file to find their current slice id.
> Format: `[ ]` pending · `[x]` done · `[~]` partial/blocked

---

## How to Use This File

1. **At session start:** Scan for the current unchecked slice in the active phase
2. **After shipping:** Mark the slice `[x]`
3. **When blocked:** Mark `[~]` and add a note explaining the block
4. **Adding work:** Add new slices at the bottom of the relevant phase
5. **Slice ids:** Use format `Phase.Slice` (e.g. `1.1`, `2.3`)

---

## Phase 0 — Project Setup

> Delivered-work manifest (slices + Plan0 prompt + Plan0 UI): **`planning/PHASE0-INVENTORY.md`**

- [x] **0.1** Initialize Claude Company OS
- [x] **0.2** Fill in `skills/core/company.md` with Tradex details (preset)
- [x] **0.3** Fill in `skills/project/architecture.md` with Tradex data model and API map
- [x] **0.4** Tune `skills/project/workflows.md` further if new commands are added
- [x] **0.5** Align execution plan with `NEXT_STEPS.md` (this file)

---

## Phase 1 — Auth and real database

> **Goal:** Multi-user Tradex with PostgreSQL. See `NEXT_STEPS.md` Phase 1.

- [x] **1.1** JWT auth endpoints + `User` model + `get_current_user`
- [x] **1.2** Replace in-memory stores with SQLAlchemy queries
- [x] **1.3** Login/signup UI + `App.tsx` guard + Settings logout

---

## Phase 2 — Trade screenshots

> **Goal:** `POST /api/v1/trades/{id}/screenshot` + Journal drawer uploads. See NEXT_STEPS Phase 2.

- [x] **2.1** Backend multipart upload + storage path
- [x] **2.2** Journal `TradeDrawer` before/after upload UI

---

## Phase 3 — MT5 sync (real)

> **Goal:** Sidebar sync calls backend; Settings stores credentials. See NEXT_STEPS Phase 3.

- [x] **3.1** JSON `POST /sync/mt5` + saved-credentials fallback; demo imports sample trades when MT5 unavailable
- [x] **3.2** `GET`/`PUT /settings/mt5` (Fernet-at-rest) + `Mt5SyncModal` + Settings MT5 form

---

## Phase 4 — Daily email reports

> **Goal:** Celery + email service + Settings toggle. See NEXT_STEPS Phase 4.

- [x] **4.1** `email_service.py` + HTML daily digest; SMTP env (optional in dev)
- [x] **4.2** Celery worker + beat (`app/celery_app.py`) — daily UTC hour configurable
- [x] **4.3** `GET`/`PUT /settings/notifications`; `POST /notifications/send-daily` (cron secret / DEBUG)
- [x] **4.4** Settings UI persists toggles; `users.notification_prefs` JSON column

---

## Phase 5 — PWA and mobile nav

> **Goal:** manifest, service worker, bottom nav. See NEXT_STEPS Phase 5.

- [x] **5.1** VitePWA manifest + service worker + `index.html` manifest / theme-color
- [x] **5.2** Offline UX — `navigateFallback` for SPA + offline strip copy in `Layout`
- [x] **5.3** Mobile bottom nav — five slots per NEXT_STEPS (Home, Journal, Playbooks, Prop, Settings)

---

## Phase 6 — Action Center (manual tasks)

> Product spec: `planning/TRADEX-SETUP-AND-ACTION-CENTER-PLAN.md`

- [x] **6.1** `ManualTask` model + `/api/v1/manual-tasks` CRUD + seed on register + `POST .../generate-defaults`
- [x] **6.2** Action Center UI (tabs, filters, drawer) + sidebar + mobile Tasks entry
- [x] **6.3** `GET /api/v1/setup/health` + setup health summary in Action Center

---

## Phase 7 — Live dashboard data (Sprint 1 shell)

> **Goal:** Logged-in shell loads trades, analytics, notebook, challenges, and AI insights from the API; demo badge when logged out.

- [x] **7.1** Zustand `hydrateFromApi` + `dataSource` + Header Live/Demo badge + sign-out reset
- [x] **7.2** Notebook create/update/delete via API when authenticated
- [x] **7.3** Playbooks use **journal-derived** cards when `dataSource === 'live'`; demo mock + manual create when logged out / demo

---

## Done (Summary)

| Phase | Slices | Shipped | Date |
|-------|--------|---------|------|
| Phase 0 | 5 | 5 | see CHANGELOG |
| Phase 1 | 3 | 3 | see CHANGELOG |
| Phase 2 | 2 | 2 | see CHANGELOG |
| Phase 3 | 2 | 2 | see CHANGELOG |

---

## Notes

- Slice ids are referenced in `planning/CHANGELOG.md` entries — keep them stable
- Product-level detail lives in **`NEXT_STEPS.md`**; keep this file in sync when phases shift
- **`planning/PHASE0-INVENTORY.md`** — canonical inventory for Phase 0 and Plan0-related work (commits, branches, improvements)
- **`planning/Plan0.md`** — optional pixel-perfect UI/PWA playbook (frontend polish); not a substitute for roadmap slices
