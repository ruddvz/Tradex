# Tradex — Setup Manual, Reference Research, and Action Center Plan

**Project:** `ruddvz/Tradex`  
**Purpose:** Evolve Tradex into a safer, paper-trading-ready platform with in-app setup guidance.  
**Repository copy:** This file tracks the agreed product direction and build order for Tradex.

---

## 0. Safety posture (non‑negotiable ordering)

1. Trading journal  
2. Paper trading simulator  
3. Backtesting lab  
4. Strategy assistant  
5. Live execution — only after paper mode, backtesting, risk controls, audit logs, and explicit human confirmation

This document is not financial advice. It is engineering, UX, and setup guidance.

---

## 1. What Tradex is today

Tradex is an AI-powered trading journal (Forex, XAUUSD, indices, stocks) with FastAPI + PostgreSQL, React + Vite, MT5 sync, analytics, and AI insights. The Journal can load live trades when authenticated; several surfaces still lean on demo/mock data until Sprint 1 wiring is complete.

---

## 2. Reference patterns (summary)

| Reference | Lesson for Tradex |
|-----------|-------------------|
| TradeNote | Journal stays fast; review beats entry; mistakes vs setups |
| Lumibot | Same strategy loop for backtest / paper / live via adapters |
| Hummingbot Dashboard | Bot/strategy management UX; credentials separate from strategies |
| OpenAlgo | Self-hosted clarity; modular brokers; obvious environment (demo/paper/live) |
| Grid trading bot | Visible ladder: backtest → paper → live; circuit breakers |
| TradeSight | Local-first AI experiments; explainable winners; human approval |
| Open Paper Trading MCP | Paper domain as first-class API; risk before fills |

---

## 3. Target navigation

Dashboard → **Action Center** → Journal → (future) Paper Trading → Strategy Lab → Backtesting → AI Playbooks → Prop Firm → Reports → Risk Center → Settings.

---

## 4. Action Center (Manual Tasks) — specification

### 4.1 Goal

Answer: **“What do I need to do next to set this up properly?”**

### 4.2 Naming and tabs

- Page name: **Action Center**  
- Tabs: **Setup** · **Trading review** · **Paper mode** · **Risk** · **Maintenance** · **Errors**

### 4.3 Categories

`initial_setup`, `security`, `broker_connection`, `paper_trading`, `risk`, `journal_cleanup`, `strategy_testing`, `pwa_setup`, `maintenance`, `critical_issues`

### 4.4 Priority and status

- Priority: `critical` | `high` | `medium` | `low`  
- Status: `not_started` | `in_progress` | `blocked` | `done` | `skipped` | `failed`

### 4.5 Backend model (`manual_tasks`)

- `id` (UUID string), `user_id` (FK users)  
- `title`, `description`, `category`, `priority`, `status`  
- `checklist` JSON (array of `{ id, label, completed }`)  
- `action_type`, `action_payload` JSON  
- `due_at`, `completed_at`, `notes`  
- `created_at`, `updated_at`

### 4.6 API (implemented under `/api/v1/manual-tasks`)

| Method | Path |
|--------|------|
| GET | `/api/v1/manual-tasks` |
| POST | `/api/v1/manual-tasks` |
| GET | `/api/v1/manual-tasks/{id}` |
| PATCH | `/api/v1/manual-tasks/{id}` |
| DELETE | `/api/v1/manual-tasks/{id}` |
| POST | `/api/v1/manual-tasks/generate-defaults` |
| POST | `/api/v1/manual-tasks/{id}/complete` |
| POST | `/api/v1/manual-tasks/{id}/skip` |

### 4.7 Default tasks

Seeded on **register** and idempotent via **generate-defaults** (skips existing titles). Templates cover env/DB, security, MT5, paper/risk placeholders, journal hygiene, and maintenance.

### 4.8 UI (implemented)

Summary cards (setup %, critical open, blocked, completed in 7 days), tab + chip filters, task cards, drawer with checklist, notes, related route, done / blocked / skip.

---

## 5. Setup manual (operator checklist)

**Phase A — tools:** Git, Node 20+, Python 3.12+, Docker, optional MT5.  
**Phase B — frontend demo:** `cd frontend && npm install && npm run dev` → `http://localhost:5173`  
**Phase C — Docker stack:** copy `.env`, `docker compose up -d`, check `/docs` and `/api/v1/health`.  
**Phase D — backend only:** venv, `pip install -r requirements.txt`, `uvicorn app.main:app --reload`.  
**Phase E — API mode:** register, Journal, refresh persistence.  
**Phase F — env:** `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `CORS_ORIGINS`; optional `OPENAI_API_KEY`, MT5 vars.  
**Phase G — GitHub Pages:** static frontend only; no FastAPI/Postgres on Pages.  
**Phase H — MT5:** demo first; verify sync; label sample imports clearly.  
**Phases I–L:** Paper accounts, strategy lab, risk center, test matrix — see sprint order below.

---

## 6. Build order (sprints)

1. **Sprint 1 — Real data:** demo indicator; wire Dashboard/Reports/Prop/Notebook; loading/empty/error; mock only in explicit demo mode.  
2. **Sprint 2 — Action Center:** model, migration/create_all, API, defaults, UI (**current repo slice shipped**).  
3. **Sprint 3 — Setup health:** `GET /api/v1/setup/health`, health card, auto-tasks for gaps.  
4. **Sprint 4 — Paper trading:** accounts, orders, fills, PAPER badge, journal export with `source=paper`.  
5. **Sprint 5 — Risk center:** rules, emergency stop, reject reasons, audit.  
6. **Sprint 6 — Backtest MVP:** import history, runner, metrics, equity curve.  
7. **Sprint 7 — Strategy lab:** drafts, versions, human approval, AI as suggestion only.

---

## 7–11. UX, security, data model roadmap

Mode badges (DEMO / REAL JOURNAL / PAPER / LIVE disabled), first-run onboarding, rich empty/error states, mobile bottom nav discipline, rate limits, CORS, audit logs. Additional tables over time: `setup_health_events`, paper tables, `risk_rules`, strategies, backtests, `audit_logs` — see original design brief for field-level detail.

---

## 12. Definition of done (platform)

Full stack runs; auth persists; Dashboard on real analytics; mock only in demo mode; Action Center + saved tasks; setup health endpoint; paper + risk + backtest + strategy flows; no accidental live execution; PWA deploy matches README.

---

## 13. Positioning

**Tradex helps traders find their edge before risking more capital** — performance lab, not “guaranteed profit bot.”

---

## 14. Source references

- Tradex: https://github.com/ruddvz/Tradex  
- TradeNote org: https://github.com/Eleven-Trading  
- Lumibot: https://github.com/Lumiwealth/lumibot  
- Hummingbot dashboard: https://github.com/hummingbot/dashboard  
- OpenAlgo: https://github.com/marketcalls/openalgo  
- Grid trading bot: https://github.com/jordantete/grid_trading_bot  
- TradeSight: https://github.com/rmbell09-lang/tradesight  
- Open Paper Trading MCP: https://github.com/Open-Agent-Tools/open-paper-trading-mcp  

---

*Last updated: 2026-05-16 — Action Center MVP landed in codebase; later sprints remain per section 6.*
