# CHANGELOG

> **Session-handoff log.** Every agent MUST append an entry after every commit
> so the next agent (or human) can pick up instantly without re-deriving state.
>
> **Read this file at session start** (alongside `planning/ACTIVE.md` and
> `planning/EXECUTION-PLAN.md`). The most recent entry is the starting point.

---

## Entry Format (copy / paste this block)

```
## <YYYY-MM-DD HH:MM TZ> — <branch> — <slice id>: <short title>
- Commit: <short-sha> (<type>: <subject>)
- Files touched: <path1>, <path2>, ...
- Tests added / changed: <count> (<file>)
- Build: pass | fail (<reason>)
- Status: done | wip | blocked (<reason>)
- Next up: <slice id + short title> OR <explicit question for the next agent>
- Notes: <anything non-obvious — gotchas, partial state, deferred decisions>
```

## Rules every agent must follow

1. **Read at session start:** This file (latest entry), `planning/ACTIVE.md` (NEXT UP line), `planning/EXECUTION-PLAN.md` (phase checkbox state).
2. **Append an entry after every commit.** One entry per commit, newest on top. Never rewrite history.
3. **Commit every logical slice.** Don't accumulate uncommitted work — a slice = a commit = a CHANGELOG entry.
4. **Low-token handoff protocol.** When context budget is tight (~20% remaining), STOP work, commit WIP, push, and write a CHANGELOG entry with `Status: wip` and an explicit `Next up:`. Do not try to cram one more slice.
5. **`Next up:` is mandatory.** The pointer must name a slice id from `EXECUTION-PLAN.md` or a direct question for the human. Never leave it empty.
6. **No CHANGELOG ↔ amend loops.** Never `git commit --amend` solely to fix the `Commit:` line. Use `- Commit: (see git log)` for docs-only commits.

---

## Log (newest first)

## 2026-05-08 — main — merge Phase 3 MT5 into Phase 2 stack (`main`)
- Commit: 6dbe9ca (Merge branch 'cursor/phase3-mt5-sync-07ef' into main)
- Files touched: unified `POST /sync/mt5` with JSON credentials + PostgreSQL inserts via `trade_from_mt5_dict` (not in-memory `_trades`); `GET`/`PUT /settings/mt5`; conflict resolutions across listed paths
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`; backend import smoke)
- Status: done
- Next up: **4** — Daily email reports (`NEXT_STEPS.md` Phase 4)
- Notes: Feature branch Phase 3 targeted legacy in-memory trades; merged `main` keeps SQLAlchemy persistence for synced MT5 rows.

## 2026-05-08 — cursor/phase3-mt5-sync-07ef — slices 3.1 + 3.2: MT5 sync API, saved credentials, modal + Settings
- Commit: b8374f7 (feat(api+frontend): Phase 3 MT5 sync — saved credentials, JSON sync, modal UI)
- Files touched: `backend/app/core/mt5_crypto.py`, `backend/app/models/user.py`, `backend/app/database.py`, `backend/app/api/v1/routes.py`, `frontend/src/lib/{auth,mapApiTrade}.ts`, `frontend/src/store/useStore.ts`, `frontend/src/components/mt5/Mt5SyncModal.tsx`, `frontend/src/components/layout/{Layout,Header,Sidebar}.tsx`, `frontend/src/pages/Settings.tsx`, `frontend/src/types/index.ts`, `NEXT_STEPS.md`, `planning/{EXECUTION-PLAN,ACTIVE,CHANGELOG}.md`
- Tests added / changed: 0 (manual: TestClient sync + settings on SQLite)
- Build: pass (`npm run lint`, `npm run build`; backend import + TestClient)
- Status: done
- Next up: merge to `main` + align `sync_mt5` with PostgreSQL persistence
- Notes: JSON body for sync (no query-string passwords). Fernet key from `SECRET_KEY`. `ALTER TABLE` for MT5 columns on upgrade.

## 2026-05-08 — cursor/phase2-trade-screenshots-07ef — slices 2.1 + 2.2: trade screenshot upload, Journal UI, static uploads
- Commit: f6d8d5b (feat(api+frontend): slices 2.1–2.2 — trade screenshots, Journal uploads, static /uploads)
- Files touched: `backend/app/api/v1/routes.py`, `backend/app/core/config.py`, `backend/app/main.py`, `backend/app/models/trade.py`, `backend/app/services/trade_codec.py`, `frontend/src/pages/Journal.tsx`, `frontend/src/lib/mapApiTrade.ts`, `frontend/src/types/index.ts`, `frontend/vite.config.ts`, `.gitignore`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md`, `NEXT_STEPS.md`
- Tests added / changed: 0 (manual TestClient + SQLite; frontend lint + build)
- Build: pass (backend import smoke; `npm run lint`, `npm run build`)
- Status: done
- Next up: **3** — MT5 sync (real) per `NEXT_STEPS.md` Phase 3 / `EXECUTION-PLAN` Phase 3
- Notes: `POST /api/v1/trades/{id}/screenshot?slot=before|after`. `UPLOAD_ROOT`; FastAPI mounts `/uploads`. Trade model: `screenshot_before_url`, `screenshot_after_url`.

## 2026-05-08 — cursor/phase1-db-persistence-07ef — slice 1.3: Auth UI, protected shell, Settings sign out
- Commit: 0ddd464 (feat(frontend): slice 1.3 — Auth page, protected shell, Settings sign out)
- Files touched: `frontend/src/App.tsx`, `frontend/src/pages/Auth.tsx`, `frontend/src/components/auth/ProtectedLayout.tsx`, `frontend/src/lib/auth.ts`, `frontend/src/pages/Settings.tsx`, `frontend/vite.config.ts`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md`, `NEXT_STEPS.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **2.1** — Trade screenshot upload (backend) per `EXECUTION-PLAN` / `NEXT_STEPS.md` Phase 2
- Notes: Vite `server.proxy` sends `/api` → `http://127.0.0.1:8000` in dev. Token key `tradex_access_token`. Dashboard still uses `mockData` until API client wiring.

## 2026-05-08 — cursor/phase1-db-persistence-07ef — slice 1.2: PostgreSQL trades, notebook, challenges
- Commit: bc49109 (feat(api): persist trades, notebook, challenges in PostgreSQL (slice 1.2))
- Files touched: `backend/app/api/v1/routes.py`, `backend/app/database.py`, `backend/app/models/trade.py`, `backend/app/models/notebook.py`, `backend/app/models/challenge.py`, `backend/app/services/trade_codec.py`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md`, `planning/COMMITS-ON-MAIN.md`, `NEXT_STEPS.md`
- Tests added / changed: 0 (manual TestClient + SQLite)
- Build: pass (backend import + CRUD smoke)
- Status: done
- Next up: **1.3** — Auth UI + `App.tsx` guard + Settings logout
- Notes: `Trade.mt5_ticket` no longer globally unique. `PropChallenge` counter column SQL name `trades` (Python `trades_count`). **`planning/COMMITS-ON-MAIN.md`** explains fast-forward vs PR visibility.

## 2026-05-08 — cursor/plan0-final-polish-07ef — Plan0: lazy routes, route fallback, mobile nav a11y
- Commit: 2818932 (feat(frontend): Plan0 completion — lazy routes, suspense boundaries, nav a11y)
- Files touched: `frontend/src/App.tsx`, `frontend/src/components/layout/{Layout,MobileNav,RouteFallback}.tsx`, `planning/Plan0-AUDIT.md`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build` — no oversized single chunk warning; lazy splits Recharts/pages)
- Status: done
- Next up: **1.2** — Persist trades/notebook/challenges in PostgreSQL (`NEXT_STEPS.md` task 2); manual Plan0 device QA rows in `Plan0-AUDIT.md` remain human-only
- Notes: `Suspense` wraps `Outlet` in `Layout` so sidebar/mobile chrome stays mounted during chunk loads; `/landing` uses its own boundary. MobileNav: `role="navigation"`, `aria-current`, `end` on home link.

## 2026-05-08 — cursor/phase1-jwt-auth-backend-07ef — slice 1.1: JWT auth, User model, protected API
- Commit: 95b72e3 (feat(auth): JWT users table, Bearer protection, user-scoped stores)
- Files touched: `backend/app/database.py`, `backend/app/models/{base,user}.py`, `backend/app/models/trade.py`, `backend/app/core/security.py`, `backend/app/api/deps.py`, `backend/app/api/v1/routes.py`, `backend/app/main.py`, `backend/requirements.txt`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md`, `NEXT_STEPS.md`
- Tests added / changed: 0 (manual: TestClient + SQLite `DATABASE_URL`)
- Build: pass (import + auth smoke)
- Status: done
- Next up: **1.2** — SQLAlchemy persistence for trades, notebook, challenges
- Notes: Password hashing uses `bcrypt` package (replaces passlib in requirements). In-memory stores are namespaced by `user_id` until 1.2. `init_db()` creates `users` + `trades` on startup. MetaTrader5 remains Windows-only in requirements. Clients must send `Authorization: Bearer <jwt>` on protected routes (token from register/login).

## 2026-05-08 — cursor/phase0-architecture-docs-07ef — merge Plan0 UI + PHASE0-INVENTORY (single source of truth)
- Commit: cf5dbc6 (Merge branch cursor/plan0-pixel-perfect-ui-66d8 into phase0 consolidation)
- Files touched: merge `origin/cursor/plan0-pixel-perfect-ui-66d8` (frontend Plan0 implementation + `planning/Plan0-AUDIT.md`), `planning/PHASE0-INVENTORY.md`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md` (conflict resolution)
- Tests added / changed: 0
- Build: pass (`npm ci && npm run build` in `frontend/`)
- Status: done
- Next up: **1.1** — JWT auth + User model per `NEXT_STEPS.md`; merge this branch to `main` so Plan0 UI is not stranded
- Notes: `main` previously had only `planning/Plan0.md` (prompt) and misleading commit `7b367b5`; UI work lived on `cursor/plan0-pixel-perfect-ui-66d8` until this merge. See `planning/PHASE0-INVENTORY.md` for the full map.

## 2026-05-08 — cursor/plan0-pixel-perfect-ui-66d8 — Plan0 completion: boot skeleton, audit doc, safe-area polish
- Commit: 5e78eb4 (feat(frontend): finish Plan0 — boot skeleton, audit doc, safe areas)
- Files touched: `frontend/src/components/layout/{Layout,AppShellSkeleton}.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/index.css`, `frontend/src/pages/Landing.tsx`, `planning/Plan0-AUDIT.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: manual Lighthouse / device QA per `planning/Plan0-AUDIT.md`; then **1.1** per `NEXT_STEPS.md`
- Notes: Boot overlay uses `document.fonts.ready` + min 280ms; `#root` bg prevents flash; Header uses `.header-safe`; Landing nav/hero respect safe-area.

## 2026-05-08 — cursor/plan0-pixel-perfect-ui-66d8 — Plan0: pixel-perfect PWA UI + interactions
- Commit: 4a078ca (feat(frontend): implement Plan0 pixel-perfect PWA UI and interactions)
- Files touched: `frontend/index.html`, `frontend/vite.config.ts`, `frontend/src/index.css`, `frontend/src/App.tsx`, `frontend/src/store/useStore.ts`, `frontend/src/components/layout/*`, `frontend/src/components/ui/{Toast,Skeleton}.tsx`, `frontend/src/components/journal/AddTradeModal.tsx`, `frontend/src/components/playbooks/CreatePlaybookModal.tsx`, `frontend/src/components/notebook/NoteEditor.tsx`, `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/hooks/useBreakpoint.ts`, `frontend/src/pages/*`, chart tooltip typings
- Tests added / changed: 0 (manual verification via build + lint)
- Build: pass (`npm run build`, `npm run lint`)
- Status: done
- Next up: boot polish / audit doc (commit `5e78eb4`) then Phase **1.1**
- Notes: Implements `planning/Plan0.md`: mobile bottom nav, PWA meta/manifest/workbox, safe-area/header offset (`page-shell`), journal/playbooks/notebook modals, toasts, calculator RR meter, reports print export, PropFirm drawdown pulse + live days.

## 2026-05-08 — cursor/phase0-architecture-docs-07ef — slice 0.3 + 0.4: Tradex architecture skill + Plan0 workflow pointer
- Commit: ff873e6 / 3bb808f (docs: Phase 0 architecture skill + CHANGELOG sha)
- Files touched: `.claude/skills/project/architecture.md`, `.claude/skills/project/workflows.md`, `planning/EXECUTION-PLAN.md`, `planning/ACTIVE.md`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (documentation only)
- Status: done
- Next up: **1.1** — JWT auth + User model + `get_current_user` per `NEXT_STEPS.md` Phase 1
- Notes: Replaces template placeholders in `architecture.md` with Tradex stack, API table, compose diagram, and Phase 1 debt. `workflows.md` links optional UI work to `planning/Plan0.md`. Commits `7b367b5`/`520559b` on `main` added `planning/Plan0.md` (misleading message on `7b367b5` — file is the pixel-perfect UI prompt).

## 2026-05-06 — main — company-os: Tradex preset + automated setup
- Commit: (see git log)
- Files touched: `.claude/`, `planning/`, `scripts/setup.sh`, `scripts/company_os_apply.py`, `scripts/presets/tradex.env`
- Tests added / changed: 0
- Build: pass (docs/skills only)
- Status: done
- Next up: **1.1** — JWT auth + User model per NEXT_STEPS.md Phase 1
- Notes: Company OS applied from zip; use `bash scripts/setup.sh --preset tradex` to re-apply after template resets.


## 2026-05-06 — main — project-setup: initial Claude Company OS configuration
- Commit: (see git log)
- Files touched: `planning/ACTIVE.md`, `planning/EXECUTION-PLAN.md`, `.claude/skills/core/company.md`
- Tests added / changed: 0
- Build: pass
- Status: done
- Next up: Fill in `skills/core/company.md` with your company details, then start first slice
- Notes: Template initialized. All [PLACEHOLDER] values need to be filled in before first use.
