---
name: company-core
description: >
  Core company context, values, and non-negotiable rules that apply to ALL work.
  This is the foundation of the Claude Company OS — always load this skill first.
  It defines who this company is, how it operates, what stack it uses, and what
  agents must never do regardless of task type. If you only fill in one skill
  file, make it this one.
---

# Company Core

## Who We Are

**Company name:** Tradex
**What we build:** AI-powered trading journal for Forex, gold (XAUUSD), indices, and stocks, with MT5 sync, analytics, and prop-firm tracking.
**Who we serve:** Retail and prop-firm traders who journal trades and want performance and psychology insights.
**Stage:** Active development — UI + API foundation shipped; auth, real DB, and integrations per NEXT_STEPS.md

---

## Our Tech Stack

**Primary language(s):** TypeScript, Python
**Frontend:** React 19, Vite 8, Tailwind CSS 3, React Router 7, Zustand, Recharts
**Backend:** FastAPI (Python 3.12), Uvicorn
**Database:** PostgreSQL, Redis (cache and Celery)
**Auth:** JWT + passlib (Phase 1 in NEXT_STEPS.md)
**Payments:** none
**Email:** Planned: SendGrid or SMTP (Phase 4)
**Infra / hosting:** Docker Compose, Nginx reverse proxy
**Testing:** pytest (backend), ESLint (frontend); add Vitest/Playwright as the suite grows
**Key services:** OpenAI (AI insights), MetaTrader5 (sync), Celery (background jobs)

---

## Project Structure

```
tradex/
├── frontend/          ← React + Vite SPA (src/pages, components, store)
├── backend/           ← FastAPI app (app/api/v1, models, services)
├── docker-compose.yml
├── NEXT_STEPS.md      ← phased product roadmap for agents
└── README.md
```

---

## Non-Negotiable Rules

These apply to every task, every file, every time:

1. **Never break existing functionality.** If a change might affect other parts of the app, flag it before implementing.
2. **No hardcoded secrets.** API keys, credentials, and env vars always go in `.env`. Never committed to git.
3. **No silent failures.** Every async operation must have error handling. Never swallow errors.
4. **Write for humans first.** Code is read more than it is written. Clarity beats cleverness.
5. **Stack boundaries.** Frontend is a Vite SPA (client-rendered). Backend APIs use FastAPI + Pydantic; keep validation on the server for every mutating route.
6. **Design system.** Dark theme only (`#0b0f16`, emerald accent). Reuse `.card`, `.input`, `.btn-primary` from `frontend/src/index.css` / Tailwind config.
7. **Immutable data patterns.** Never mutate state in place — return new copies.
8. **Files max 800 lines, functions max 50 lines.**
9. **Read `NEXT_STEPS.md`** before large features; align slices with documented phases.

---

## What We Never Do

- Do not refactor working code unless explicitly asked
- Do not install new dependencies without confirming with the team
- Do not delete files or data without explicit instruction
- Do not make assumptions about business logic — ask if unclear
- Do not push directly to main — always use feature branches + PRs
- Do not hardcode values that belong in environment variables
- Do not change design tokens documented as fixed in NEXT_STEPS.md without explicit approval

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `UserCard.tsx` |
| Files (utils) | camelCase | `formatDate.ts` |
| Variables | camelCase | `const userId` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Database tables | snake_case, plural | `user_profiles` |
| CSS classes | kebab-case | `main-container` |
| API routes | lowercase, hyphens | `/api/user-profiles` |
| Branches | kebab-case, `cursor/` prefix for agent work | `cursor/add-auth-flow-2f22` |

---

## Environment Setup

```bash
# Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173

# Backend (venv recommended)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Full stack
docker-compose up -d

# Verification (common)
cd frontend && npm run build && npm run lint
cd ../backend && pytest -q

# Key env vars (names only; see backend/app/core/config.py)
# DATABASE_URL, REDIS_URL, OPENAI_API_KEY, SECRET_KEY, CORS_ORIGINS
```

---

## How We Use Claude Code

- **Phase 0 always:** Read `planning/CHANGELOG.md`, `planning/ACTIVE.md`, `planning/EXECUTION-PLAN.md` before starting any task
- **Read relevant skill files** before starting a task in that domain
- **If a task spans multiple domains** (e.g. frontend + database), read both skill files
- **When in doubt about a business decision**, stop and ask — do not invent logic
- **Prefer editing existing patterns** over introducing new ones
- **Update CHANGELOG.md** after every commit — this is mandatory
- **Commit every logical slice** — a slice = a commit = a CHANGELOG entry

---

## Domain Routing

| Task type | Primary agent | Notes |
|---|---|---|
| New feature (3+ files) | `planner` → domain agents | Plan before code |
| API route | `bp-backend` or domain backend | Security review mandatory |
| UI component | `bp-ui-*` or domain frontend | Mobile-first |
| DB schema/migration | `database-reviewer` | RLS + indexes required |
| Auth/payments | `security-reviewer` | Never skip |
| Build failure | `build-error-resolver` | First, don't guess |
| Tests | `tdd-guide` | Write tests first |
