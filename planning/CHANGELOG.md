# CHANGELOG

> **Session-handoff log.** Every agent MUST append an entry after every commit
> so the next agent (or human) can pick up instantly without re-deriving state.
>
> **Read this file at session start** (alongside `planning/ACTIVE.md` and
> `planning/EXECUTION-PLAN.md`). The most recent entry is the starting point.

---

## 2026-06-04 — cursor/post-plan-completion-b0b9 — Phase 9: post-plan backlog
- Commit: (pending)
- Files touched: `backend/app/models/{paper_violation,playbook}.py`, `backend/app/services/{risk_engine,paper_execution,paper_equity,playbook_stats}.py`, `backend/app/api/v1/{playbooks_api,risk,paper_legacy_api,paper_accounts}.py`, `backend/alembic/versions/f7a8b9c0d1e2_*.py`, `frontend/src/lib/api/{playbooks,risk}.ts`, `frontend/src/lib/mergePlaybooks.ts`, `frontend/src/store/useStore.ts`, `frontend/src/pages/{Playbooks,Settings}.tsx`, `planning/{ACTIVE,EXECUTION-PLAN,CHANGELOG}.md`
- Tests added / changed: 2 (`test_paper_violations.py`, `test_playbooks_api.py` stats)
- Build: pass (frontend build; backend unit tests for risk/violations/stats)
- Status: done
- Next up: Plan0 manual device QA (human)
- Notes: Phase 9.1–9.6. Legacy `/paper/*` returns Deprecation headers. Playbooks merge API + journal-derived.

## 2026-06-05 — cursor/p2-plan-complete-32fb — P2: httpOnly auth, EXIF strip, metrics parity
- Commit: (pending)
- Files touched: `backend/app/core/{auth_cookies,security,config,upload_validation}.py`, `backend/app/api/{deps,v1/auth_api,v1/trades_api}.py`, `backend/tests/{test_auth_refresh,test_metrics_parity}.py`, `frontend/src/lib/{auth,api/client}.ts`, `frontend/src/components/auth/{ProtectedLayout,AuthBootstrap}.tsx`, `frontend/src/pages/{Auth,Settings}.tsx`, `scripts/docker-verify.sh`, `planning/{ACTIVE,CURRENT-STATE-AND-NEXT-WORK,CHANGELOG}.md`
- Tests added / changed: 5 (`test_auth_refresh`, `test_metrics_parity`)
- Build: pass (`./scripts/verify.sh`)
- Status: done
- Next up: human Docker + device QA only
- Notes: Access token in memory + httpOnly cookies; refresh on 401; legacy localStorage migrated once.

## 2026-06-05 — cursor/audit-plan-complete-32fb — P2: security headers, rate limits, upload validation
- Commit: d92dbda (feat: P2 security — rate limits, security headers, upload magic-byte check)
- Files touched: `middleware/security.py`, `middleware/rate_limit.py`, `core/upload_validation.py`, `trades_api.py`, `main.py`, `planning/ACTIVE.md`
- Tests added / changed: 3 (`test_upload_validation.py`)
- Build: pass (48 pytest)
- Status: done
- Next up: httpOnly auth refactor OR Docker manual verify (human)
- Notes: Auth login/register limited to 20 req/min/IP in-memory.

## 2026-06-05 — cursor/audit-plan-complete-32fb — P1: import batches, CSV candles, strategy versions, OOS
- Commit: 1fc8b5a (feat: P1 backlog — import batches, CSV candles, strategy versions, OOS warnings)
- Files touched: `import_batch`, `strategy_version`, `candle_dataset` models, migration `b2c3d4e5f6a7`, `imports_api`, `csv_provider`, `sync_api` batch wiring, `backtests.py` CSV upload + OOS, `strategy_runner` versions, Settings Import History, Backtests CSV/OOS UI
- Tests added / changed: 4 (`test_csv_provider`, `test_strategy_versions`, migration head update)
- Build: pass (`./scripts/verify.sh` — 45 pytest, lint, build, e2e x3)
- Status: done
- Next up: **P2** — production security hardening (`planning/ACTIVE.md`)
- Notes: Alembic uses batch_alter_table for SQLite FK columns. Backtests accept CSV with columns timestamp,open,high,low,close.

## 2026-06-05 — cursor/audit-plan-complete-32fb — Audit P0: verify, docs, CI, safety
- Commit: 404ee6b (feat: complete audit P0 — verify, harden safety, reconcile docs, add CI)
- Files touched: `backend/tests/{test_live_disabled,test_mt5_fallback,test_config_production}.py`, `backend/app/services/ai_trust.py`, `backend/app/core/config.py`, `backend/app/main.py`, `backend/requirements-ci.txt`, `backend/pyproject.toml`, `.github/workflows/{frontend-ci,backend-ci,security}.yml`, `scripts/verify.sh`, `frontend/.prettierrc`, `planning/{CURRENT-STATE-AND-NEXT-WORK,DEVICE-QA,ACTIVE,NEXT_STEPS,ROADMAP-2026-Q2}.md`, formatting across frontend/backend
- Tests added / changed: 25+ (live disabled, MT5 fallback x3, config production x3, AI trust parametrized)
- Build: pass (`./scripts/verify.sh` — 41 pytest, lint, build, SW, e2e x3)
- Status: done
- Next up: **P1.2** — Import batches (`planning/CURRENT-STATE-AND-NEXT-WORK.md`)
- Notes: Fixed verify.sh e2e path (cd to ROOT). Prettier + black + ruff CI. PageDataTrustBar on Journal/Reports/Calculator/Playbooks/PropFirm/Settings/ActionCenter.

## 2026-06-05 — cursor/phases-11-15-a3a6 — Phases 11–15: roadmap complete
- Commit: ccf4900 (feat: complete Phases 11–15 — paper realism, trust layers, e2e QA)
- Files touched: paper lifecycle/fill config, PaperTrading cockpit, PerformanceCompare, DashboardStatusStrip, AI trust, Backtests assumptions, e2e/, scripts/verify.sh, planning
- Tests added / changed: 4 (`test_paper_order_lifecycle`, `test_ai_trust`, Playwright e2e x3)
- Build: pass (`./scripts/verify.sh` — 16 pytest, lint, build, SW, e2e)
- Status: done
- Next up: optional Plan0 manual device QA
- Notes: Paper orders: submitted → accepted → filled/rejected. Per-account fill assumptions migration `a1b2c3d4e5f6`.

## 2026-06-05 — cursor/phase-10-stabilization-a3a6 — Phase 10: stabilization after Phase 9
- Commit: b6f9eed (feat: Phase 10 stabilization — data modes, Risk Center, planning cleanup)
- Files touched: Phase 9 merge + `DataModeBadge.tsx`, `RiskCenter.tsx`, `resolveDataViewMode.ts`, `Journal.tsx` source filters, `sync_api.py` demo_mt5_sample, `risk.py` GET /profile, planning `ROADMAP-2026-Q2.md`, `EXECUTION-PLAN.md`, `ACTIVE.md`, `README.md`, `NEXT_STEPS.md`
- Tests added / changed: 0 (12 backend pytest pass; frontend build pass)
- Build: pass
- Status: done
- Next up: **11.1** — Paper order lifecycle states
- Notes: Merged `cursor/post-plan-completion-b0b9` (PR #32 equivalent). Fixed migration bootstrap test for revision `f7a8b9c0d1e2`.

## 2026-06-04 — cursor/audit-complete-plan-parallel-b0b9 — Phase 6 + 7 completion (parallel)
- Commit: (pending)
- Files touched: `frontend/src/lib/api/{client,settings,sync,paperAccounts,trades,accounts}.ts`, `useStore.ts`, `Header.tsx`, `AccountSelector.tsx`, `TradeSourceBadge.tsx`, `Journal.tsx`, `PaperTrading.tsx`, `Settings.tsx`, `Dashboard.tsx`, `Playbooks.tsx`, `Layout.tsx`, `planning/{ACTIVE,EXECUTION-PLAN}.md`
- Tests added / changed: 0 (frontend build)
- Build: pass
- Status: done
- Next up: merge audit PR stack; optional Plan0 QA
- Notes: EXECUTION-PLAN Phases 6.1–6.5 and 7.1–7.3 marked complete. Live mode no longer falls back to mock chart data when API returns empty series.

## 2026-06-04 — cursor/audit-phase-8-2-parallel-b0b9 — Phase 8.2: Docker migrations + API validation UX
- Commit: c875ef1 (feat: Phase 8.2 Alembic-only init_db and Docker migrate entrypoint)
- Files touched: `backend/app/{database,migrations}.py`, `backend/docker-entrypoint.sh`, `backend/Dockerfile`, `docker-compose.yml`, `backend/MIGRATIONS.md`, `backend/tests/test_migrations_bootstrap.py`, `frontend/src/lib/api/client.ts`, `planning/{ACTIVE,EXECUTION-PLAN,CHANGELOG}.md`
- Tests added / changed: 1 (`test_migrations_bootstrap.py`)
- Build: pass (pytest migrations x2)
- Status: done
- Next up: **6.1** — API client layer polish
- Notes: Removed create_all + ad-hoc ALTER helpers. Compose sets `ALEMBIC_AUTO_STAMP=true` for legacy volumes. `detailMessage` joins FastAPI 422 field errors.

## 2026-06-04 — cursor/audit-phase-8-1-parallel-b0b9 — Phase 8.1: Alembic initial + route modularization
- Commit: 4f3cfa0 (feat: Phase 8.1 Alembic initial schema and full API route split)
- Files touched: `backend/alembic/versions/6bcb32ddfb52_initial_schema.py`, `backend/alembic/env.py`, `backend/MIGRATIONS.md`, `backend/app/api/v1/{auth,accounts,paper_legacy,ai,notebook,challenges,settings,sync,api_serializers}.py`, `routes.py`, `backend/tests/test_alembic_migrations.py`
- Tests added / changed: 1 (`test_alembic_migrations.py`)
- Build: pass (compileall + pytest)
- Status: done
- Next up: **8.2** — Docker Compose migrate step; retire ad-hoc ALTER when covered by Alembic
- Notes: Fixed missing `trading_account_to_dict` / `paper_account_to_dict` via `api_serializers.py`. `routes.py` is now a thin router aggregator.

## 2026-06-04 — cursor/audit-pwa-trades-routes-b0b9 — Phase 5 + 8.0 + journal API
- Commit: 3f1d38c (feat: iPhone PWA polish, journal API saves, split trades/analytics routes)
- Files touched: frontend PWA (index.html, vite, Layout, MobileNav, IosInstallBanner, useIsStandalone, index.css, icons), `frontend/src/lib/api/trades.ts`, `useStore.ts`, `Journal.tsx`, `backend/app/api/v1/api_common.py`, `trades_api.py`, `analytics_api.py`, `routes.py`, `backend/alembic/*`
- Tests added / changed: 0 (compileall + frontend build)
- Build: pass
- Status: done
- Next up: **8.1** — first Alembic revision from SQLAlchemy models
- Notes: iPhone-focused PWA (safe-area, 180px apple-touch-icon, install banner). Trades/analytics extracted from monolithic routes.py. Journal drawer saves notes/session/emotion via PATCH in live mode.

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

## 2026-06-04 — cursor/audit-phase-6-parallel-b0b9 — 6.2 live surface polish
- Commit: (see git log)
- Files touched: `frontend/src/lib/metricsFromTrades.ts`, `frontend/src/pages/{Reports,Calculator,Journal,Paper,Dashboard}.tsx`, `frontend/src/data/mockData.ts`, `planning/*`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** PWA polish
- Notes: Reports uses API metrics when live; Calculator seeds balance/risk from account; Journal empty state for live zero trades.

## 2026-06-04 — cursor/audit-phase-f-g-parallel-b0b9 — F strategy runner + G live readiness
- Commit: (see git log)
- Files touched: strategy_run model, strategy_runner, broker_base, live_readiness services/APIs, StrategyRunsPanel, LiveReadiness page, planning docs
- Tests added / changed: 1 (`test_strategy_runner.py`)
- Build: pass
- Status: done
- Next up: **6.2** — remaining mock-only surfaces when authenticated
- Notes: Paper-only strategy ticks; live execution remains disabled.

## 2026-06-04 — cursor/audit-phase-e-settings-live-b0b9 — E + risk settings + live playbooks
- Commit: (see git log)
- Files touched: `backend/app/models/{strategy,backtest}.py`, `backend/app/services/backtesting.py`, `backend/app/api/v1/backtests.py`, `backend/app/api/v1/risk.py`, `backend/app/database.py`, `backend/tests/test_backtesting.py`, `frontend/src/pages/Backtests.tsx`, `frontend/src/lib/api/{backtests,risk}.ts`, `frontend/src/store/useStore.ts`, `frontend/src/pages/{Settings,Playbooks,PropFirm}.tsx`, `frontend/src/App.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `planning/{CHANGELOG,ACTIVE,EXECUTION-PLAN}.md`
- Tests added / changed: 2 (`test_backtesting.py`)
- Build: pass (`python3 -m compileall app`, `npm run lint`, `npm run build`)
- Status: done
- Next up: **Phase F** — strategy runner in paper mode (audit §10)
- Notes: Backtests use synthetic candles (`data_label: synthetic_demo`). Playbooks derive from journal `strategy` when live. Risk PATCH applies to paper/future execution limits.

## 2026-05-16 — main — merge: open PR stack (#18–#22) into main
- Commit: (see git log)
- Files touched: cumulative from `cursor/action-center-manual-tasks-12fb`, `cursor/setup-health-live-data-12fb`, `cursor/pwa-phase5-playbooks-12fb`, `cursor/implement-p0-parallel-7a9e`, `cursor/paper-trading-mvp-12fb` (see merge commits on `main`)
- Tests added / changed: 0
- Build: pass (`python3 -m compileall app`, `npm run lint`, `npm run build`)
- Status: done
- Next up: **8.2** — Paper orders/fills + journal `source=paper` (see `planning/ACTIVE.md`)
- Notes: PR #21 + #22 reconciled in `routes.py` (MT5 sync metadata + `paper-accounts` router), `useStore` (`hydrateLiveSession` + paper accounts), `Header` (Live/Demo + Paper mode), `Sidebar` (Paper + Paper Trading + Action Center). Register seeds manual tasks and primary `TradingAccount`.

## 2026-05-16 — cursor/paper-trading-mvp-12fb — feat: Phase 8.1 paper accounts + Paper Trading page
- Commit: (see git log)
- Files touched: `backend/app/models/paper_account.py`, `backend/app/schemas/paper_account.py`, `backend/app/api/v1/paper_accounts.py`, `backend/app/api/v1/routes.py`, `backend/app/database.py`, `frontend/src/{App.tsx,store/useStore.ts,types/index.ts,lib/paperAccountsApi.ts,pages/PaperTrading.tsx,components/layout/{Layout,Header,Sidebar}.tsx,pages/Settings.tsx}`, `planning/{CHANGELOG,ACTIVE,EXECUTION-PLAN}.md`
- Tests added / changed: 0
- Build: pass frontend (`npm run lint`, `npm run build`); backend `python3 -m py_compile` on new modules
- Status: done
- Next up: **8.2** — Paper orders/fills stub + journal `source=paper` (or **5** PWA per `ACTIVE.md`)
- Notes: `GET`/`POST /api/v1/paper-accounts` require Bearer auth. Header shows **Paper mode** when any returned account has `is_active`. Sign-out clears paper state in Zustand. Table `paper_accounts` created via `create_all` on startup.

## 2026-05-16 — cursor/implement-p0-parallel-7a9e — docs: CHANGELOG commit pointer for P0 slice
- Commit: eacece0 (docs: record commit sha in CHANGELOG for P0 slice)
- Files touched: `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: Same as previous entry — Reports/Settings live wiring; backend tests.
- Notes: Cosmetic follow-up to set `Commit:` line for the main P0 commit `5d504c0`.

## 2026-05-16 — cursor/implement-p0-parallel-7a9e — feat: P0 live stack (trading accounts, trade source, MT5 guard, paper, API client + hydrate)
- Commit: 5d504c0 (feat: live trading accounts, MT5 demo guard, paper MVP, frontend hydrate)
- Files touched: `backend/app/api/v1/routes.py`, `backend/app/models/{trade,trading_account,paper}.py`, `backend/app/services/{mt5_sync,trade_codec,paper_service}.py`, `backend/app/{database,core/config}.py`, `backend/.env.example`, `frontend/src/lib/api/*`, `frontend/src/store/useStore.ts`, `frontend/src/{App,components/layout/*,pages/*,types,mount points}.tsx` (see git diff), `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`python3 -m compileall app`, `npm run lint`, `npm run build` in `frontend/`)
- Status: done
- Next up: Wire remaining pages (Reports, Settings account picker) to `account_id` / live metrics where still mock-local; add backend tests for accounts + MT5 503 path.
- Notes: `Layout` runs `hydrateLiveSession` in parallel with `document.fonts.ready`. Demo MT5 samples require `DEBUG=true` and `ALLOW_DEMO_MT5_FALLBACK=true`. `trade_to_api_dict` now exposes `source`.

## 2026-05-16 — cursor/pwa-phase5-playbooks-12fb — feat: PWA offline fallback, mobile nav, journal playbooks
- Commit: (see git log)
- Files touched: `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/components/layout/{Layout,MobileNav}.tsx`, `frontend/src/pages/Playbooks.tsx`, `frontend/src/lib/derivePlaybooksFromTrades.ts`, `planning/{ACTIVE,EXECUTION-PLAN,CHANGELOG}.md`, `NEXT_STEPS.md`
- Tests added / changed: 0
- Build: pass frontend (`npm run lint`, `npm run build`)
- Status: done
- Next up: **P1** — Paper trading MVP (models + page shell) per `planning/ACTIVE.md`
- Notes: Workbox `navigateFallback` uses Vite `base` for GitHub Pages. Mobile dock is five items per NEXT_STEPS; sidebar still lists Action Center and Reports on md+. Live playbooks group by `strategy`; New Playbook disabled until a playbooks API exists.

## 2026-05-16 — cursor/setup-health-live-data-12fb — feat: setup health API + live store hydration
- Commit: (see git log)
- Files touched: `backend/app/services/setup_health.py`, `backend/app/api/v1/setup.py`, `backend/app/api/v1/routes.py`, `frontend/src/lib/liveApi.ts`, `frontend/src/store/useStore.ts`, `frontend/src/components/layout/{Layout,Header}.tsx`, `frontend/src/pages/{ActionCenter,Auth,Settings,PropFirm,Journal}.tsx`, `frontend/src/components/notebook/NoteEditor.tsx`, `planning/{ACTIVE,EXECUTION-PLAN,CHANGELOG}.md`, `NEXT_STEPS.md`
- Tests added / changed: 0
- Build: pass frontend (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** — PWA Phase 5 polish, or **7.3** — Playbooks / mock labeling
- Notes: `GET /api/v1/setup/health` checks DB ping, Redis ping, OpenAI key, MT5 saved creds, and flags weak default `SECRET_KEY`. Layout hydrates on route change + online event; sign-out calls `resetToDemo`. Notebook mutations call REST when Bearer present.

## 2026-05-16 — cursor/action-center-manual-tasks-12fb — feat: Action Center manual tasks + product plan doc
- Commit: (see git log)
- Files touched: `backend/app/models/manual_task.py`, `backend/app/schemas/manual_task.py`, `backend/app/services/manual_tasks_seed.py`, `backend/app/api/v1/manual_tasks.py`, `backend/app/api/v1/routes.py`, `backend/app/database.py`, `frontend/src/pages/ActionCenter.tsx`, `frontend/src/components/tasks/*`, `frontend/src/{App.tsx,types/index.ts}`, `frontend/src/components/layout/{Sidebar,MobileNav}.tsx`, `planning/{TRADEX-SETUP-AND-ACTION-CENTER-PLAN.md,ACTIVE.md,EXECUTION-PLAN.md,CHANGELOG.md}`
- Tests added / changed: 0 (backend `pip install` blocked by MetaTrader5 wheel in this environment; `py_compile` on new modules OK)
- Build: pass frontend (`npm run lint`, `npm run build`)
- Status: done
- Next up: **6.3** — `GET /api/v1/setup/health` + Action Center health strip (or **5** PWA if prioritizing mobile shell)
- Notes: New users get default checklist rows on `POST /auth/register`; `POST /api/v1/manual-tasks/generate-defaults` is idempotent by task title. Mobile bottom nav replaces Calc slot with Tasks → Action Center.

## 2026-05-16 — cursor/full-repo-audit-plan-7a9e — docs: execution plan section references wording
- Commit: (see git log)
- Files touched: `planning/EXECUTION-PLAN.md`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: n/a
- Status: done
- Next up: **5** — PWA / mobile (`NEXT_STEPS.md` Phase 5) **or** **6.1** — API client layer (`EXECUTION-PLAN.md` Phase 6) if prioritizing P0 stabilization
- Notes: Replaced Unicode section-sign references with plain "section(s)" in Phase 6–8 blurbs.

## 2026-05-16 — cursor/full-repo-audit-plan-7a9e — docs: full repository audit + execution phases 6–8
- Commit: (see git log)
- Files touched: `planning/FULL-REPOSITORY-AUDIT-AND-IMPROVEMENT-PLAN.md`, `planning/{ACTIVE,EXECUTION-PLAN,CHANGELOG}.md`
- Tests added / changed: 0
- Build: n/a (planning docs only)
- Status: done
- Next up: **5** — PWA / mobile (`NEXT_STEPS.md` Phase 5) **or** **6.1** — API client layer (`EXECUTION-PLAN.md` Phase 6) if prioritizing P0 stabilization
- Notes: Single canonical audit doc (positioning, P0 tasks, paper-first, security, testing, UI vision); Known Issues row 2 elevated to P0 with Phase 6 pointer; EXECUTION-PLAN adds Phase 5 slices + Phases 6–8+.

## 2026-05-10 — cursor/phase4-daily-email-4e43 — feat: Phase 4 daily email + Celery + notification prefs
- Commit: (see git log)
- Files touched: `backend/app/models/user.py`, `backend/app/database.py`, `backend/app/core/config.py`, `backend/app/services/email_service.py`, `backend/app/celery_app.py`, `backend/app/tasks/notifications.py`, `backend/app/api/v1/routes.py`, `backend/.env.example`, `docker-compose.yml`, `frontend/src/pages/Settings.tsx`, `planning/{CHANGELOG,ACTIVE,EXECUTION-PLAN}.md`
- Tests added / changed: 0
- Build: pass frontend (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** — PWA / mobile (`NEXT_STEPS.md` Phase 5)
- Notes: `notification_prefs` JSON on users; SMTP optional in dev; Celery worker + beat services; `POST /notifications/send-daily` guarded.

## 2026-05-10 — cursor/ui-md-full-tabs-fab-4e43 — feat: Ui.md Journal / Reports / Prop / Calculator
- Commit: (see git log)
- Files touched: `frontend/tailwind.config.js`, `frontend/src/index.css`, `frontend/src/data/mockData.ts`, `frontend/src/components/ui/{ProgressRing,SegmentedControl}.tsx`, `frontend/src/components/calculator/RiskPath.tsx`, `frontend/src/components/journal/JournalTradeCard.tsx`, `frontend/src/pages/{Journal,Reports,PropFirm,Calculator}.tsx`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** — PWA (`NEXT_STEPS.md` Phase 5)
- Notes: Chip filters + grouped journal cards + FAB; Reports tabs + range metrics; Prop ring + Calculator risk path; merged branch resolves conflicts with PR #15 design-system (chip + tokens unified).

## 2026-05-10 — cursor/design-system-ui-4e43 — fix: Header profile on mobile → Settings
- Commit: (see git log)
- Files touched: `frontend/src/components/layout/Header.tsx`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** — PWA (`NEXT_STEPS.md` Phase 5)
- Notes: Mobile avatar navigates to `/settings`.

## 2026-05-10 — cursor/design-system-ui-4e43 — feat: premium OS shell + Home hero (`planning/Ui.md`)
- Commit: (see git log)
- Files touched: `frontend/tailwind.config.js`, `frontend/index.html`, `frontend/src/index.css`, `frontend/src/lib/tokens.ts`, `frontend/src/components/cards/HeroMetricCard.tsx`, `frontend/src/components/dashboard/{WeeklyPerformanceStrip,TradingConsistencyCard}.tsx`, `frontend/src/components/layout/{Header,MobileNav,Layout,Sidebar}.tsx`, `frontend/src/components/ui/StatCard.tsx`, `frontend/src/components/charts/EquityCurve.tsx`, `frontend/src/pages/Dashboard.tsx`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **5** — PWA (`NEXT_STEPS.md` Phase 5)
- Notes: Semantic palette, `.app-bg`, glass cards, floating dock, Home hero.

## 2026-05-10 — main — merge: PR #13 + PR #14 → `main` (fast-forward)
- Commit: (see git log) — tip includes `b2a7326`
- Files touched: same as `cursor/hidden-auth-flags-pwa-icons-26d7` slice (feature flags, Auth, icons, `index.css`, `env.sample`)
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **4** — Daily email reports (`NEXT_STEPS.md` Phase 4)
- Notes: GitHub PRs #13 and #14 merged into `main`; single fast-forward (no extra merge commit). Default build: auth UI off, no login gate; see `frontend/env.sample`.

## 2026-05-10 — cursor/hidden-auth-flags-pwa-icons-26d7 — feat: optional auth flags + PWA PNG icons
- Commit: (see git log)
- Files touched: `frontend/src/lib/featureFlags.ts`, `frontend/src/vite-env.d.ts`, `frontend/src/App.tsx`, `frontend/src/pages/{Auth,Settings}.tsx`, `frontend/src/components/auth/ProtectedLayout.tsx`, `frontend/index.html`, `frontend/env.sample`, `frontend/public/{pwa-192.png,pwa-512.png,pwa-512-maskable.png,apple-touch-icon.png}`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **4** — Daily email reports (`NEXT_STEPS.md` Phase 4)
- Notes: Default personal build: `/auth` hidden (`VITE_AUTH_UI_ENABLED` unset/false), shell never gated (`VITE_REQUIRE_LOGIN`). Restore sign-in UI + optional JWT gate via `.env`. PNG app icons generated from `favicon.svg` (maskable on `#0b0f16`). Settings shows session clear only when a JWT exists.

## 2026-05-10 — cursor/remove-auth-gate-ios-viewport-26d7 — feat: remove login gate; iOS-friendly viewport/CSS
- Commit: (see git log)
- Files touched: `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/src/pages/Settings.tsx`, removed `frontend/src/pages/Auth.tsx`, removed `frontend/src/components/auth/ProtectedLayout.tsx`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **4** — Daily email reports (`NEXT_STEPS.md` Phase 4)
- Notes: Main app is reachable without JWT; `/auth` redirects to `/`. Removed Settings **Sign out** (no login UI). `lib/auth.ts` remains for optional Bearer calls (MT5, Journal API). Inputs use 16px (`text-base`) and global tweaks (`text-size-adjust`, `touch-action: manipulation`) to reduce iOS Safari zoom-on-focus.

## 2026-05-08 — cursor/fix-data-router-scroll-restoration-bcd4 — fix: use data router for ScrollRestoration
- Commit: (see git log)
- Files touched: `frontend/src/App.tsx`, `planning/CHANGELOG.md`
- Tests added / changed: 0
- Build: pass (`npm run lint`, `npm run build`)
- Status: done
- Next up: **4** — Daily email reports (`NEXT_STEPS.md` Phase 4)
- Notes: `ScrollRestoration` in React Router v7 uses `useMatches` and requires `createBrowserRouter` + `RouterProvider`, not `BrowserRouter`. Root layout wraps `ScrollRestoration` + `Outlet`; protected shell is a pathless parent with `index` for dashboard.

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
