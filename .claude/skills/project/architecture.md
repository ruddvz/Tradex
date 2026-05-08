---
name: project-architecture
description: >
  Architecture decisions, system design, and technical context for this project.
  Load when making structural changes, adding new features, writing migrations,
  or making decisions that affect multiple parts of the system. Also load when
  onboarding — this is the technical map of the project.
---

# Project Architecture — Tradex

The technical map of Tradex. Read this before structural changes or cross-cutting features.

---

## System Overview

**What this project does:**  
Tradex is an AI-assisted trading journal: traders log and review trades (Forex, XAUUSD, indices, equities), see analytics and psychology breakdowns, manage notebook notes and prop-firm challenge tracking, and optionally sync from MetaTrader 5. The product is a React SPA talking to a FastAPI backend; demo mode uses in-memory API state and rich mock data on the client.

**Key user flows:**
1. **Journal → analytics** — User reviews trades on Dashboard / Journal; charts and metrics come from `/api/v1/analytics/*` (today backed by in-memory trade lists; Phase 1 moves this to PostgreSQL per user).
2. **AI insights** — User triggers insights; backend aggregates metrics and calls OpenAI when configured (`POST /api/v1/ai/insights`).
3. **Notebook & challenges** — CRUD for journal entries and prop challenges via `/api/v1/notebook` and `/api/v1/challenges` (in-memory until Phase 1).

---

## Architecture Diagram

```
Browser (React 19 + Vite + Tailwind + Recharts + Zustand)
    │
    │  HTTP / JSON  (CORS: local dev + docker frontend origins)
    ▼
FastAPI (`backend/app/main.py`) — `/api/v1/*`
    ├── routes.py       ← trades, analytics, AI, notebook, challenges, MT5 sync
    ├── services/       ← analytics.py, ai_service.py, mt5_sync.py
    └── models/trade.py ← SQLAlchemy Trade model (DB wiring pending Phase 1)

Data today:
    └── In-memory lists in routes.py (`_trades`, `_notebook`, `_challenges`)

Infra (docker-compose):
    ├── PostgreSQL 16   ← wired in compose; app not fully migrated yet
    ├── Redis 7         ← available for Celery/cache (future)
    └── Optional OpenAI API for AI insights
```

---

## Data Model

### Core entities (target schema)

The `Trade` SQLAlchemy model in `backend/app/models/trade.py` defines the intended persistence shape. Relationships below reflect **NEXT_STEPS.md** Phase 1 goals (User + owned trades).

```
users (planned — NEXT_STEPS Phase 1)
  └── has many → trades

trades
  └── belongs to → users (user_id)
  └── optional link → mt5_ticket (dedupe on sync)

notebook_entries (planned)
  └── belongs to → users

prop_challenges (planned)
  └── belongs to → users
```

### Key fields on `trades` (summary)

- Identity: `id`, `user_id`, `account_id`
- Market: `symbol`, `direction`, prices, `lot_size`, times
- Outcome: `pnl`, `status`, `grade`, `r_multiple`, fees
- Journal: `notes`, `tags`, `screenshot_url`, psychology fields
- Sync: `mt5_ticket` (unique when present)

### Key relationships to know

- **Current API** uses a single global in-memory list for trades — not multi-user safe until JWT + DB (Phase 1).
- **Trade model** exists in code before Alembic migrations; migrating routes to `get_db` is explicit roadmap work.

---

## API Surface (`/api/v1`)

| Area | Methods | Notes |
|------|---------|--------|
| Health | `GET /health` | Liveness |
| Trades | `GET/POST /trades`, `GET/PATCH/DELETE /trades/{id}` | Filters: symbol, status, date range |
| Analytics | `GET /analytics/metrics`, `/symbols`, `/sessions`, `/psychology`, `/calendar` | Driven by trade set |
| AI | `POST /ai/insights` | Uses OpenAI when key present |
| Notebook | `GET/POST /notebook`, `PATCH/DELETE /notebook/{id}` | |
| Challenges | `GET/POST /challenges` | Prop firm tracking |
| Sync | `POST /sync/mt5` | Query-style params: login, password, server, days (see `/docs`) |

Interactive docs: `/docs` (Swagger).

---

## Key Architectural Decisions

### Decision 1: Monorepo SPA + API
**What:** React frontend in `frontend/`, FastAPI in `backend/`, orchestrated with Docker Compose for full stack.  
**Why:** Clear separation, independent scaling of UI vs API, matches team skills.  
**Trade-off:** Two deploy surfaces (static CDN vs API server).  
**Date:** Project inception.

### Decision 2: Mock / in-memory first, PostgreSQL second
**What:** Routes use Python lists until Phase 1 replaces them with SQLAlchemy queries.  
**Why:** Rapid UI and analytics iteration without migration churn early on.  
**Trade-off:** No real persistence or auth until Phase 1 ships.

### Decision 3: Production build targets GitHub Pages base path
**What:** `frontend/vite.config.ts` sets `base` to `/Tradex/` in production builds for `*.github.io/<repo>/`.  
**Why:** Hosted demo/installable PWA from GitHub Pages.  
**Trade-off:** Local dev uses `/`; agents must respect `base` for asset paths and router basename when testing production builds.

---

## Feature Flags / Config

Backend (`backend/app/core/config.py` via env):

- `DATABASE_URL`, `REDIS_URL` — Compose defaults; Phase 1 persistence.
- `SECRET_KEY` — JWT signing once auth lands.
- `OPENAI_API_KEY` — Without it, AI paths degrade gracefully where implemented.
- `CORS_ORIGINS` — JSON list of allowed browser origins.

Frontend: no central feature-flag module yet; demo data toggle lives in store/mock usage.

---

## Third-Party Integrations

| Service | Purpose | Key file(s) | Notes |
|---------|---------|-------------|--------|
| OpenAI | Narrative AI insights | `backend/app/services/ai_service.py` | Optional |
| MetaTrader 5 | Trade sync | `backend/app/services/mt5_sync.py` | Demo fallback if MT5 unavailable |

---

## Performance Considerations

- Analytics endpoints scan in-memory trade lists — acceptable for demo volume; Phase 1 should index by `user_id` and date.
- AI insights bundle multiple aggregations — cache or rate-limit if exposed publicly.

---

## Security Boundaries

- **Today:** No authentication; `/api/v1/*` is effectively public — acceptable only for local/demo. **Phase 1** adds JWT and `Depends(get_current_user)`.
- **Secrets:** Never commit `.env`; MT5 credentials must not be logged (Phase 3 hardening).

---

## Known Technical Debt

| Area | Issue | Priority |
|------|-------|----------|
| Persistence | In-memory stores | P1 — Phase 1 |
| Auth | No users or JWT | P1 — Phase 1 |
| Migrations | No Alembic revision chain yet | P1 |

---

## Deployment

**Environments:**

- **Local:** `cd frontend && npm run dev` (5173) or `docker-compose up` (frontend :80, API :8000).
- **Static demo:** GitHub Pages from frontend production build (`base: /Tradex/`).

**Compose stack:** `postgres`, `redis`, `backend`, `frontend` — see root `docker-compose.yml`.

**Rollback:** Revert merge or redeploy previous image/build artifact.

---

## Migrations

Database migrations are **not** yet populated with Alembic revisions in-repo. Phase 1 introduces Alembic (or equivalent) and Alembic-first workflow — see `planning/EXECUTION-PLAN.md` slice **1.2**.

**Rules once migrations exist:** never edit shipped migrations; create new revisions; test up/down locally.
