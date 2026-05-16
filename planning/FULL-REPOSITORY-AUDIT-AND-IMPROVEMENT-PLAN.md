# Tradex — Full Repository Audit & Improvement Plan

**Repository:** `https://github.com/ruddvz/Tradex`  
**Prepared for:** Rudra Patel / `ruddvz`  
**Document status:** Living roadmap — align `planning/ACTIVE.md` and `planning/EXECUTION-PLAN.md` with this file when priorities shift.

**Goal:** Evolve Tradex from a strong trading-journal MVP into a serious paper-trading, analytics, AI-coaching, and risk-controlled trading lab—without positioning it as a “money-making bot” before the foundation is trustworthy.

---

## 0. Important Positioning

Tradex should **not** be positioned as an automated profit bot yet.

**Current accurate description:**

> A premium trading journal + analytics + MT5 sync platform with AI insights, prop-firm tracking, screenshots, reports, notifications, and PWA groundwork.

**Not yet:** a validated automated paper/live bot, strategy engine with training loop, walk-forward testing, broker-safe execution controls, or production-grade risk gates.

**Recommended build order:**

1. Journal and analytics foundation  
2. Paper-trading simulator  
3. Backtesting and replay engine  
4. Strategy lab / rule engine  
5. AI assistant for review and coaching  
6. Strict risk manager  
7. Only then: optional live execution  

**Savings / capital discipline:** do not allocate savings to live bot trading until the paper system has survived sufficient testing, drawdown limits, and edge validation.

---

## 1. What Exists Today

### 1.1 Frontend

- React / TypeScript, Vite, TailwindCSS, Zustand, React Router, Recharts, Framer Motion, Lucide; PWA plugin present.  
- Screens: Landing, Auth, Dashboard, Journal, AI Playbooks, Prop Firm, Notebook, Reports, Risk Calculator, Settings.  
- Premium dark fintech direction; design-system documentation exists.

### 1.2 Backend

- FastAPI: JWT auth, PostgreSQL, SQLAlchemy, MT5 sync, screenshot upload, analytics, AI insights, notebook, prop challenges, notification preferences, daily email (Celery + Redis), Docker Compose.

### 1.3 Planning State (repo)

- Phases 1–4 largely complete per `planning/EXECUTION-PLAN.md`.  
- `planning/ACTIVE.md` lists Phase 5 next: PWA / mobile shell polish.

### 1.4 Known Product Gap

> Dashboard and most pages still use `mockData.ts`; Journal loads live trades when authenticated; broader API wiring is future work.

Treat as **P0**: the app can look complete while key surfaces show demo data.

---

## 2. Overall Verdict

### Strengths

- Polished concept and journal niche; real auth, DB, MT5 path, screenshots, reports, notifications.  
- Strong UI direction and prop-firm / playbook ideas.

### Weaknesses / Risks

- “Production-ready” appearance before data and risk engines match that bar.  
- `AddTradeModal` may persist locally instead of API when authenticated.  
- Metrics simplifications; no paper engine; limited automated tests visible.  
- `localStorage` JWT convenience vs XSS surface for a finance-minded app.  
- Dev defaults for secrets—must fail closed in production.  
- MT5 fallback that imports sample trades when MT5 is unavailable is dangerous if not clearly demo-only and gated by config.

---

## 3. Product Direction

**Target positioning:**

> A personal trading performance lab: record, simulate, analyze, improve, and eventually automate strategies with strict risk controls.

**Differentiators (examples):**

- Understand trading behavior; test safely before real money; surface emotional loss of control; prop-firm rule clarity; repeatable setups as playbooks; AI for **review**, not blind execution.

**Tagline direction:**

> **Your Trading Performance Lab. Test first. Risk later. Improve daily.**

---

## 4. Critical Rule: Paper Trading First

### Paper Mode (requirements)

- Virtual balance; simulated orders; spread/commission/slippage; max daily loss; max total drawdown; max risk per trade; max open trades; cooldown after losses; optional news blackout; session restrictions; no-trade days; journaling after paper trades; forced review after loss streaks; weekly performance report.

### Staged validation (summary)

| Stage        | Focus                          | Capital risk |
|-------------|----------------------------------|-------------|
| Backtest    | Historical edge                  | $0          |
| Replay      | Chart progression behavior       | $0          |
| Paper live  | Live-market + execution assumptions | $0      |
| Micro live  | Broker + emotional check       | Tiny        |
| Scale       | Controlled growth              | Controlled |

### Passing criteria before meaningful live capital (checklist)

- Minimum paper trade count appropriate to strategy frequency.  
- Positive expectancy after costs; drawdown within limits.  
- No rule violations for minimum trading days.  
- Stable across symbols/sessions; no single trade can destroy account.  
- No martingale / revenge logic / hidden unlogged overrides.

---

## 5. P0 Fixes — Do These First

| ID   | Item | Summary |
|------|------|---------|
| P0.1 | Live API on major screens | API client layer; Zustand/API as source of truth when authenticated; mock only for demo with visible label. |
| P0.2 | Add Trade → backend | Authenticated: `POST /api/v1/trades`, validation, refresh store; demo: local + “Demo only”. |
| P0.3 | Safe MT5 fallback | `ALLOW_DEMO_MT5_FALLBACK=false` by default; mock only when `DEBUG` + flag; production error + `source` on imports + UI badge. |
| P0.4 | Account model | Multi-account; trades `account_id`; metrics per account; prop/paper/live separation. |
| P0.5 | Paper trading MVP | Models, fills, rules, violations, endpoints; daily loss lockout. |

**Agent task mapping (from audit):**

- **Task 1** — API data source cleanup (`frontend/src/lib/api/*`, store, Dashboard, Reports, Playbooks, PropFirm, Journal).  
- **Task 2** — Backend trade creation from UI (`AddTradeModal`, Journal, trades API, routes).  
- **Task 3** — Safe MT5 fallback (config, `mt5_sync`, routes, `Mt5SyncModal`, Settings).  
- **Task 4** — Account model (models, migrations, accounts API, analytics, Settings, account selector).  
- **Task 5** — Paper trading MVP (paper models, engines, API, Paper page, store).

---

## 6. Bot / Strategy System (Later Phases)

- **Phase A:** Deterministic rule engine (`Strategy`, JSON rules, no vague prompts).  
- **Phase B:** Backtest engine + `BacktestRun` metrics and UI.  
- **Phase C:** Walk-forward / degradation visibility.  
- **Phase D:** Paper-live strategy runs with statuses (`draft` → `rejected`, etc.).  
- **Phase E:** AI as coach (summaries, overfitting warnings, checklists)—not executor.

---

## 7. Risk Engine (Build Before Live)

Global, per-strategy, and per-order rules; **Risk Center** UI: today’s risk used, daily loss room, exposure, violations, lock status, emergency disable.

---

## 8. Data Quality

- Trade `source`, `source_run_id`, `import_batch_id`, `raw_payload_json`.  
- Validation and flags for bad/missing data; duplicate ticket detection.  
- **Import Review** screen after MT5/CSV sync.

---

## 9. Analytics Improvements

- Account-based equity/drawdown; profit factor with breakevens; Sharpe on periodic returns; expectancy in $ and R; risk-of-ruin; advanced behavioral metrics.  
- AI insights grounded in computed metrics only (no “increase risk” cheerleading).

---

## 10. UI/UX Redesign Plan (Summary)

- **Shell:** Context bar (account mode, balance, daily risk, sync); desktop nav (Home, Journal, Paper, Strategies, AI Coach, Risk, Reports, Settings); mobile bottom nav consolidation.  
- **Dashboard:** “Am I performing and safe today?” — hero performance, risk strip, key metrics, one AI action, recent trades, session/symbol edge.  
- **Journal:** Source/account filters, mistake tags, planned vs actual, screenshot compare, AI post-trade review, drawer tabs.  
- **Paper, Strategy Lab, AI Coach, Prop Firm, Risk Calculator, Reports, Settings:** See original audit sections 10.4–10.10 for layout bullets.

---

## 11. Security

- Production: require strong `SECRET_KEY`, reject defaults; `NOTIFICATIONS_CRON_SECRET` when not DEBUG; no hardcoded prod DB passwords in examples.  
- Prefer httpOnly cookies + refresh rotation for web; CSP; sanitize inputs.  
- Dedicated encryption key for broker secrets + rotation story; audit credential events.  
- Uploads: magic-byte verification, EXIF strip, random filenames, authenticated serving if needed.  
- API: rate limits on auth, lockout, password reset, audit logs, request IDs, error tracking.

---

## 12. Backend Architecture

- Split `routes.py` into domain routers (`auth`, `trades`, `analytics`, …).  
- Alembic migrations as source of truth (reduce `create_all` + ad-hoc ALTER).  
- Service layer: `trade_service`, `account_service`, `paper_engine`, `risk_engine`, etc.; repositories later.

---

## 13. Frontend Architecture

- Typed API modules under `frontend/src/lib/api/`.  
- Split Zustand or use slices; TanStack Query for server state.  
- Loading / error / empty / offline / demo states on every page.

---

## 14. PWA

- Manifest, icons, theme, offline page, banner, cache versioning, install prompt, safe-area padding.  
- Offline: label cached data; queue sync; avoid stale-as-live.

---

## 15. Testing

- Backend: auth, trade CRUD, tenancy, uploads, MT5 fallback, analytics, notifications, paper risk rejections, backtests.  
- Frontend: components, routes, API error states, AddTradeModal validation.  
- E2E (Playwright): signup → trade → dashboard → screenshot → paper → risk block → export.  
- Deterministic financial fixtures for metrics.

---

## 16. CI/CD

- Workflows: `frontend-ci.yml`, `backend-ci.yml`, `security.yml`; gates on lint, test, build, audits, secret scan.

---

## 17. Database Schema Roadmap (Tables)

`users`, `accounts`, `trades`, `trade_screenshots`, `notebook_entries`, `prop_challenges`, `notification_preferences`, `import_batches`, `paper_accounts`, `paper_orders`, `paper_positions`, `strategy_versions`, `backtest_runs`, `market_candles`, `risk_rules`, `risk_violations`, `audit_events`, …

---

## 18. Suggested Implementation Phases (Product)

1. **Stabilize** — API-driven pages, Add Trade persistence, safe MT5 fallback, account model, basic tests.  
2. **Paper MVP** — virtual account, ticket, fills, risk, history, report.  
3. **Strategy lab** — rules, versions, manual eval, basic backtest.  
4. **Backtesting engine** — candles, runs, charts, OOS validation.  
5. **AI coach** — trade/strategy reviews, weekly summary, mistake detection.  
6. **PWA / offline** — install, cache, drafts, sync queue.  
7. **Optional live** — adapter, kill switch, read-only default, audit, manual approval.

---

## 19. Best Immediate Next Move

> **Make Tradex trustworthy as a paper-trading and analytics system** — not “make the bot trade.”

**Sequence:** (1) Live API wiring, (2) trade CRUD persistence, (3) account model, (4) disable demo MT5 fallback in production, (5) Paper Mode, (6) Risk Center, (7) Strategy Lab, (8) automation last.

---

## 20. Final Product Vision

> **Before you risk real money, Tradex helps you prove your edge, control your risk, and understand your behavior.**

---

## 21. Source Notes From Repo Inspection

Evidence cited in the original audit:

- `README.md`, `NEXT_STEPS.md`, `planning/ACTIVE.md` — dashboard/mock gap.  
- `frontend/src/store/useStore.ts` — mock init; API refresh mainly for trades when authenticated.  
- `frontend/src/components/journal/AddTradeModal.tsx` — local trade + store.  
- `backend/app/services/mt5_sync.py` — mock trades when MT5 unavailable.  
- `backend/app/core/config.py` — dev defaults.  
- `backend/app/core/mt5_crypto.py` — Fernet from `SECRET_KEY`.  
- `frontend/src/lib/auth.ts` — JWT in `localStorage`.  
- `frontend/vite.config.ts` — PWA plugin.

---

## 22. How Agents Should Use This Document

1. **P0** items override cosmetic work unless release-critical.  
2. When shipping a slice, reference this doc + `planning/EXECUTION-PLAN.md` slice id in `planning/CHANGELOG.md`.  
3. Keep `NEXT_STEPS.md` in sync for human-readable “what’s next”; use this file for depth and acceptance criteria.  
4. Do not start live execution work until Paper + Risk milestones in `EXECUTION-PLAN.md` are checked.
