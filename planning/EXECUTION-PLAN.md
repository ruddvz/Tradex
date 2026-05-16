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

> **Goal:** manifest, service worker, bottom nav. See `NEXT_STEPS.md` Phase 5.  
> **Strategic context:** `planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md` — P0 stabilization may take priority over pure UI polish.

- [ ] **5.1** Manifest refinements (maskable icons, theme color, Apple touch icon)
- [ ] **5.2** Offline banner + cached shell / safe-area padding for mobile
- [ ] **5.3** Bottom-nav polish (no clash with home indicator)

---

## Phase 6 — Live data & trust (P0 stabilization)

> **Goal:** Backend as source of truth when authenticated. Acceptance criteria: **`planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md`** section 5 (P0.1–P0.3).

- [ ] **6.1** API client layer (`frontend/src/lib/api/*`) + centralized auth headers / errors
- [ ] **6.2** Replace mock-driven pages when authenticated (Dashboard, Reports, Playbooks, PropFirm, Journal consistency) + loading/error/empty states + demo labels
- [ ] **6.3** `AddTradeModal` → `POST/PUT/DELETE` trades API + server validation display + store refresh
- [ ] **6.4** `ALLOW_DEMO_MT5_FALLBACK` (default false) + production-safe MT5 errors + import `source` + UI badges
- [ ] **6.5** `Account` model + `trade.account_id` + accounts API + per-account analytics + account selector in shell

---

## Phase 7 — Paper trading MVP

> **Goal:** Virtual balance, simulated fills, rule violations, daily loss lockout. See audit section 5 (P0.5) and section 18 Phase 2.

- [ ] **7.1** Paper models + migrations (`PaperAccount`, orders, positions, fills, violations)
- [ ] **7.2** Paper engine + risk pre-checks + REST endpoints
- [ ] **7.3** Paper trading UI + store; reject oversized orders with explicit reason

---

## Phase 8+ — Strategy lab, backtest, AI coach, Risk Center

> **Detail:** `planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md` sections 6–10. Split into numbered slices when starting Phase 8.

- [ ] **8.0** Split `routes.py` into domain routers + Alembic-first migrations (audit section 12)

---

## Done (Summary)

| Phase | Slices | Shipped | Date |
|-------|--------|---------|------|
| Phase 0 | 5 | 5 | see CHANGELOG |
| Phase 1 | 3 | 3 | see CHANGELOG |
| Phase 2 | 2 | 2 | see CHANGELOG |
| Phase 3 | 2 | 2 | see CHANGELOG |
| Phase 4 | 4 | 4 | see CHANGELOG |

---

## Notes

- Slice ids are referenced in `planning/CHANGELOG.md` entries — keep them stable
- Product-level detail lives in **`NEXT_STEPS.md`**; keep this file in sync when phases shift
- **Full audit & long-range roadmap:** **`planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md`**
- **`planning/PHASE0-INVENTORY.md`** — canonical inventory for Phase 0 and Plan0-related work (commits, branches, improvements)
- **`planning/Plan0.md`** — optional pixel-perfect UI/PWA playbook (frontend polish); not a substitute for roadmap slices
