---
name: tradex
description: Tradex trading journal platform context. Use when working on this project to understand the stack, architecture, and conventions.
allowed-tools: bash, read, write, edit, grep, glob, ls, todo, batch
---

# Tradex — Project Context

## Stack

**Frontend** (`frontend/`): React 18 + TypeScript, Vite, TailwindCSS 3, Recharts, Zustand, Lucide React, framer-motion  
**Backend** (`backend/`): FastAPI, Python 3.12, SQLAlchemy 2, PostgreSQL, Redis, Alembic, Pydantic v2, Celery  
**Infra**: Docker Compose, Nginx, GitHub Actions CI/CD

## Key Directories

```
frontend/src/
  components/     # layout/, charts/, ui/
  pages/          # Dashboard, Journal, Playbooks, PropFirm, Notebook, Reports, Calculator
  store/          # Zustand (useStore.ts)
  data/           # mockData.ts (120 demo trades)
  types/          # index.ts

backend/app/
  main.py         # FastAPI app + middleware
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

# Backend only
cd backend && uvicorn app.main:app --reload --port 8000
```

## Conventions

- Dark theme with emerald green (`brand-*`) as primary color
- Profit = `#10b981` (green), Loss = `#ef4444` (red)
- All charts use Recharts; data comes from `mockData.ts` in demo mode
- Type definitions in `frontend/src/types/index.ts`
- Backend env in `backend/.env` (copy from `backend/.env.example`)

## Planning Files

- `planning/CHANGELOG.md` — per-commit history
- `planning/ACTIVE.md` — current active tasks / NEXT UP
- `planning/EXECUTION-PLAN.md` — phase checkboxes

Always read these three files first (see `.claude/workflow-101.md`).
