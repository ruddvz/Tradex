# TradeX Roadmap — 2026 Q2

> **Product identity:** TradeX is a trading performance lab — journal, paper simulator, backtesting lab, risk monitor, and AI review assistant. **Not a live money bot.**

**Canonical tactical checklist:** `planning/EXECUTION-PLAN.md`  
**Active slice pointer:** `planning/ACTIVE.md`

---

## What works today

| Mode | Requires | What you get |
|------|----------|--------------|
| **Demo** | Frontend only (`npm run dev`) | 120 sample trades, mock metrics, no backend |
| **Live journal** | Auth + PostgreSQL backend | Real trades, analytics, notebook, challenges, AI insights |
| **Paper trading** | Auth + paper account | Simulated orders/fills, risk violations, kill switch |
| **Backtest** | Auth | Synthetic OHLC strategy runs with trust warnings |
| **MT5 import** | MT5 terminal + credentials | Historical trades with `source=mt5` (or `demo_mt5_sample` in dev fallback) |

**Not available:** Live broker execution, automated real-money trading.

---

## Completed phases (0–10)

- **0–4:** Setup, auth, DB, screenshots, MT5 sync, email reports
- **5:** PWA + mobile nav
- **6–7:** Live data trust + paper trading MVP
- **8:** Route split + Alembic migrations
- **9:** Violations, playbooks API, account UI, paper equity
- **10:** Data mode badges, source tagging, Risk Center, planning cleanup

---

## Phase 11 — Paper trading realism

Make paper mode useful for learning, not pretending.

- Order lifecycle: draft → submitted → accepted/rejected → filled/cancelled/expired
- Execution model: spread, slippage, commission, partial fills
- Paper dashboard: virtual balance, equity, open orders/positions, violations

---

## Phase 12 — Backtesting trust layer

- Assumptions panel on every backtest result
- Backtest vs Paper vs Journal comparison
- Explicit export tagging (`source=backtest`) — no silent journal pollution

---

## Phase 13 — Dashboard and mobile UX

- Status strip → performance → risk → learning → activity hierarchy
- iPhone PWA safe-area, 44pt targets, compact charts
- Empty states with primary actions on every major page

---

## Phase 14 — AI coach trust layer

AI analyzes **behavior**, not markets:

- Allowed: pattern summaries, overtrading warnings, risk explanations, weekly reviews
- Blocked: buy/sell signals, profit promises, hidden assumptions
- UI: data used, time range, confidence, limitations, action items

---

## Phase 15 — Tests and QA

- Backend: auth, trades, paper, risk, playbooks, backtests, migrations
- Frontend: data mode badges, empty states, journal filters, mobile nav
- Manual QA: iPhone SE/15/Pro Max, iPad, desktop 1440px

---

## Safety rules (non-negotiable)

1. Do **not** build live automated execution until paper + backtest + audit trail are proven.
2. Demo data must never appear as live journal without badges.
3. `ALLOW_DEMO_MT5_FALLBACK=false` by default in production.
4. Every new model needs an Alembic migration; every new route needs a minimal test.

---

## Legacy references

Older sprint docs used duplicate phase numbers (Phase 6 Action Center vs Phase 6 Live trust). See **Legacy phase references** in `EXECUTION-PLAN.md` for mapping.
