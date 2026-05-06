# Tradex — Agent Instructions

## Project Overview

Tradex is an AI-powered trading journal platform for Forex, Gold (XAUUSD), Indices (US30, NAS100), and stock traders.

**Stack:**
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS 3, Recharts, Zustand, Lucide React
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2, PostgreSQL, Redis, Celery, Pydantic v2
- **Infra**: Docker Compose, Nginx, GitHub Actions

## Key Directories

```
frontend/src/
  components/     # layout/, charts/, ui/
  pages/          # Dashboard, Journal, Playbooks, PropFirm, Notebook, Reports, Calculator
  store/          # useStore.ts (Zustand global state)
  data/           # mockData.ts (120 demo trades — no backend needed for demo)
  types/          # index.ts (TypeScript interfaces)

backend/app/
  main.py         # FastAPI app
  api/v1/routes.py
  models/trade.py
  services/       # analytics.py, ai_service.py, mt5_sync.py
  core/config.py
```

## Dev Commands

```bash
# Frontend only (instant demo, no backend needed)
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Full stack
docker-compose up -d
# → Frontend: http://localhost
# → API docs: http://localhost:8000/docs

# Backend only
cd backend && uvicorn app.main:app --reload --port 8000
```

## Workflow & Planning

1. Always read `planning/CHANGELOG.md` (newest entry), `planning/ACTIVE.md` (NEXT UP line), and `planning/EXECUTION-PLAN.md` (phase checkboxes) before coding.
2. See `.claude/workflow-101.md` for the full agent workflow.
3. Commit every logical slice with a clear message. Append to `planning/CHANGELOG.md` after each commit.

## Code Conventions

- **Dark theme**: emerald green (`brand-*`) = primary, `#10b981` = profit, `#ef4444` = loss, `#f59e0b` = warn
- **Chart library**: Recharts. Data in demo mode comes from `frontend/src/data/mockData.ts`.
- **Types**: all in `frontend/src/types/index.ts`
- **Backend env**: copy `backend/.env.example` → `backend/.env`
- **Never** commit `.env`, secrets, or keys.

## Skills

This workspace ships a gcode skill at `.gcode/skills/tradex.md` with full stack context.
