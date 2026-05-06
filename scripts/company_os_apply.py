#!/usr/bin/env python3
"""
Apply Claude Company OS substitutions from environment variables.
Safe string replacement (no shell escaping issues).

Required env for generic mode: COMPANY_NAME, PRODUCT_DESCRIPTION, CUSTOMER_DESCRIPTION, STAGE,
LANG, FRONTEND, DATABASE, AUTH, PAYMENTS, EMAIL, HOSTING, TESTING, KEY_SERVICES,
TEST_CMD, BUILD_CMD, DEV_CMD.

When COMPANY_OS_PRESET=tradex, defaults above can be omitted if sourced from presets/tradex.env.

Team skills: set HAS_FRONTEND, HAS_BACKEND, HAS_OPS, HAS_DATA to Y or n (removes matching team/*.md).
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def root() -> Path:
    return Path(__file__).resolve().parent.parent


def _replace(path: Path, pairs: list[tuple[str, str]]) -> None:
    text = path.read_text(encoding="utf-8")
    for old, new in pairs:
        if old not in text:
            continue
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


def apply_company_md(r: Path, env: dict[str, str]) -> None:
    p = r / ".claude" / "skills" / "core" / "company.md"
    if not p.exists():
        print(f"skip missing {p}", file=sys.stderr)
        return
    pairs = [
        ("[YOUR COMPANY NAME]", env["COMPANY_NAME"]),
        (
            "[ONE SENTENCE — what your product/service does]",
            env["PRODUCT_DESCRIPTION"],
        ),
        ("[Your primary customers or users]", env["CUSTOMER_DESCRIPTION"]),
        ("[e.g. pre-launch / live in production / scaling]", env["STAGE"]),
        ("[e.g. TypeScript, Python]", env["LANG"]),
        (
            "[e.g. Next.js 16 App Router, React 19, Tailwind CSS v4]",
            env["FRONTEND"],
        ),
        ("[e.g. Next.js API routes, Node.js, FastAPI]", env.get("BACKEND", "[e.g. Next.js API routes, Node.js, FastAPI]")),
        ("[e.g. PostgreSQL via Supabase, MongoDB]", env["DATABASE"]),
        ("[e.g. Supabase Auth, Clerk, NextAuth]", env["AUTH"]),
        ("[e.g. Stripe, Razorpay]", env["PAYMENTS"]),
        ("[e.g. Resend, SendGrid]", env["EMAIL"]),
        ("[e.g. Vercel, AWS, Railway]", env["HOSTING"]),
        ("[e.g. Vitest, Jest, Playwright]", env["TESTING"]),
        ("[e.g. Supabase, Resend, Stripe, Vercel Analytics]", env["KEY_SERVICES"]),
    ]
    _replace(p, pairs)

    if env.get("COMPANY_OS_PRESET") == "tradex":
        tradex_structure = """```
tradex/
├── frontend/          ← React + Vite SPA (src/pages, components, store)
├── backend/           ← FastAPI app (app/api/v1, models, services)
├── docker-compose.yml
├── NEXT_STEPS.md      ← phased product roadmap for agents
└── README.md
```"""
        _replace(
            p,
            [
                (
                    """```
[Paste your main folder structure here. Example:]

src/
├── app/          ← Next.js pages and API routes (App Router)
│   ├── (auth)/   ← Protected routes
│   ├── api/      ← API route handlers
│   └── ...
├── components/   ← Reusable UI components
│   ├── shared/   ← Team-owned shared components (read-only for most agents)
│   └── ...
├── lib/          ← Utilities, service clients, validation schemas
├── types/        ← TypeScript type definitions
└── hooks/        ← Custom React hooks
```""",
                    tradex_structure,
                ),
                (
                    "5. **Server Components by default.** `'use client'` only when hooks, refs, or animation lifecycles demand it.\n",
                    "5. **Stack boundaries.** Frontend is a Vite SPA (client-rendered). Backend APIs use FastAPI + Pydantic; keep validation on the server for every mutating route.\n",
                ),
                (
                    "6. **All user input validated with Zod schemas** at system boundaries.\n",
                    "6. **Design system.** Dark theme only (`#0b0f16`, emerald accent). Reuse `.card`, `.input`, `.btn-primary` from `frontend/src/index.css` / Tailwind config.\n",
                ),
                (
                    "9. **[Add your own non-negotiable here]**",
                    "9. **Read `NEXT_STEPS.md`** before large features; align slices with documented phases.",
                ),
                (
                    "- [Add your own \"never do\" here]",
                    "- Do not change design tokens documented as fixed in NEXT_STEPS.md without explicit approval",
                ),
                (
                    """```bash
# Install dependencies
npm install   # or: pnpm install / bun install

# Copy environment template
cp .env.example .env

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Key environment variables needed:
# [LIST REQUIRED ENV VARS — no values, just names]
# DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
# RESEND_API_KEY, STRIPE_SECRET_KEY, etc.
```""",
                    """```bash
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
```""",
                ),
            ],
        )


def apply_workflows_md(r: Path, env: dict[str, str]) -> None:
    p = r / ".claude" / "skills" / "project" / "workflows.md"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")
    text = text.replace("  16. npm run build (zero errors)\n", f"  16. {env['BUILD_CMD']} (zero errors)\n")
    text = text.replace("  17. npm test (all pass)\n", f"  17. {env['TEST_CMD']}\n")
    text = text.replace(
        "2. Run full verification: npm run build + npm test\n",
        f"2. Run full verification: {env['BUILD_CMD']} + ({env['TEST_CMD']})\n",
    )
    text = text.replace("  3. npm install\n", "  3. cd frontend && npm install && cd ../backend && pip install -r requirements.txt\n")
    text = text.replace("  4. npm run dev\n", f"  4. {env['DEV_CMD']}\n")

    if env.get("COMPANY_OS_PRESET") == "tradex":
        text = text.replace(
            "   [WHERE YOUR LOGS ARE: Vercel logs / Supabase logs / monitoring tool]",
            "   Docker: `docker compose logs` (nginx, backend). API: uvicorn/FastAPI logs.",
        )
        text = text.replace(
            """Commands:
  supabase db push         ← apply pending migrations
  supabase db reset        ← reset to clean state (local only)
  supabase migration list  ← see what's pending""",
            """Commands (Alembic):
  cd backend && alembic upgrade head
  cd backend && alembic downgrade -1
  cd backend && alembic history""",
        )
        text = text.replace(
            """Framework: [e.g. Vitest / Jest]
E2E: Playwright

Run all tests:         npm test
Run single file:       npm test -- path/to/file.test.ts
Run in watch mode:     npm run test:watch
Run E2E:               npx playwright test

What must be tested:
  - All business logic functions in lib/
  - All API route handlers (happy path + auth failure + validation failure)
  - Complex UI interactions with state changes""",
            """Framework: pytest (backend), ESLint (frontend)
E2E: Playwright (add when UI flows are covered)

Run backend tests:     cd backend && pytest -q
Run frontend lint:     cd frontend && npm run lint
Run single test:       cd backend && pytest path/to_test.py -q

What must be tested:
  - Analytics and services in backend/app/services/
  - API routes (happy path + auth + validation) once auth lands
  - Complex UI state (Journal drawer, filters) when a harness exists""",
        )
        text = text.replace(
            "8. Create feature branch: git checkout -b feat/description\n",
            "8. Create feature branch: git checkout -b cursor/short-description-2f22\n",
        )
    p.write_text(text, encoding="utf-8")


def apply_changelog_date(r: Path) -> None:
    p = r / "planning" / "CHANGELOG.md"
    if not p.exists():
        return
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    text = p.read_text(encoding="utf-8")
    text = text.replace("## YYYY-MM-DD HH:MM — main —", f"## {today} — main —", 1)
    text = text.replace("(YYYY-MM-DD):", f"({today}):", 1)
    p.write_text(text, encoding="utf-8")


def apply_tradex_planning(r: Path) -> None:
    active = r / "planning" / "ACTIVE.md"
    if active.exists():
        active.write_text(
            """# Active Task Queue

> This file is the live queue. Every agent reads this at startup.
> Format: one entry per task, newest first.
> Status: `[ ]` pending · `[>]` in progress · `[x]` done

---

## 👉 NEXT UP: **[1.1]** — Phase 1: Authentication and PostgreSQL

Implement `NEXT_STEPS.md` Phase 1: JWT auth (`/api/v1/auth/*`), SQLAlchemy models + `get_db`, protect routes, and add `frontend/src/pages/Auth.tsx` with token storage.

**Context:** `NEXT_STEPS.md` Phase 1, `backend/app/api/v1/routes.py`, `frontend/src/App.tsx`
**Blocked by:** nothing

---

## 🎯 Current Sprint / Phase

**Phase:** Phase 1 — Auth and persistent data
**Goal:** Multi-user app with PostgreSQL-backed trades and login/signup UI
**Target:** Complete Phase 1 checkboxes in NEXT_STEPS.md

### Open Slices
- [ ] **1.1** Backend auth + User model + protected routes
- [ ] **1.2** Wire trades/notebook/challenges to DB
- [ ] **1.3** Auth UI + App routing guard + logout in Settings

### In Progress
- [ ] **0.2** Company OS configured for Tradex (skills + planning)

### Recently Done
- [x] **0.1** Claude Company OS files imported from archive

---

## Known Issues / Bugs

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Data | API still mock/in-memory until Phase 1 DB work | P1 | Open |

---

## Blockers

| Blocker | Waiting for | Owner |
|---------|-------------|-------|
| — | — | — |

---

## Completed This Session

- [x] Company OS integrated; Tradex preset applied via `scripts/setup.sh --preset tradex`

---

## Phase History (compact)

- **Setup** (see CHANGELOG): Claude Company OS + Tradex preset ✓

---

## Domain Audit Status

| Domain | Last Audited | Status | Open issues |
|--------|-------------|--------|-------------|
| frontend | never | not run | — |
| backend  | never | not run | — |
| ops      | never | not run | — |
| data     | never | not run | — |

---

## Notes for Next Agent

- Read `planning/CHANGELOG.md` (newest entry) first
- Product roadmap: **`NEXT_STEPS.md`** (authoritative phases)
- Company context: `.claude/skills/core/company.md`
""",
            encoding="utf-8",
        )

    plan = r / "planning" / "EXECUTION-PLAN.md"
    if plan.exists():
        plan.write_text(
            """# Execution Plan

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

- [x] **0.1** Initialize Claude Company OS
- [x] **0.2** Fill in `skills/core/company.md` with Tradex details (preset)
- [ ] **0.3** Fill in `skills/project/architecture.md` with Tradex data model and API map
- [ ] **0.4** Tune `skills/project/workflows.md` further if new commands are added
- [x] **0.5** Align execution plan with `NEXT_STEPS.md` (this file)

---

## Phase 1 — Auth and real database

> **Goal:** Multi-user Tradex with PostgreSQL. See `NEXT_STEPS.md` Phase 1.

- [ ] **1.1** JWT auth endpoints + `User` model + `get_current_user`
- [ ] **1.2** Replace in-memory stores with SQLAlchemy queries
- [ ] **1.3** Login/signup UI + `App.tsx` guard + Settings logout

---

## Phase 2 — Trade screenshots

> **Goal:** `POST /api/v1/trades/{id}/screenshot` + Journal drawer uploads. See NEXT_STEPS Phase 2.

- [ ] **2.1** Backend multipart upload + storage path
- [ ] **2.2** Journal `TradeDrawer` before/after upload UI

---

## Phase 3 — MT5 sync (real)

> **Goal:** Sidebar sync calls backend; Settings stores credentials. See NEXT_STEPS Phase 3.

---

## Phase 4 — Daily email reports

> **Goal:** Celery + email service + Settings toggle. See NEXT_STEPS Phase 4.

---

## Phase 5 — PWA and mobile nav

> **Goal:** manifest, service worker, bottom nav. See NEXT_STEPS Phase 5.

---

## Done (Summary)

| Phase | Slices | Shipped | Date |
|-------|--------|---------|------|
| Phase 0 | 5 | 3 | see CHANGELOG |

---

## Notes

- Slice ids are referenced in `planning/CHANGELOG.md` entries — keep them stable
- Product-level detail lives in **`NEXT_STEPS.md`**; keep this file in sync when phases shift
""",
            encoding="utf-8",
        )


def maybe_remove_team_skills(r: Path, env: dict[str, str]) -> None:
    team = r / ".claude" / "skills" / "team"

    def yn(key: str, default: str = "Y") -> bool:
        v = env.get(key, default).strip().lower()
        return v not in ("n", "no", "0", "false")

    mapping = {
        "HAS_FRONTEND": team / "frontend.md",
        "HAS_BACKEND": team / "backend.md",
        "HAS_OPS": team / "ops.md",
        "HAS_DATA": team / "data.md",
    }
    for key, path in mapping.items():
        if path.exists() and not yn(key):
            path.unlink()
            print(f"removed {path.relative_to(r)}")


def load_env_from_os() -> dict[str, str]:
    keys = [
        "COMPANY_OS_PRESET",
        "COMPANY_NAME",
        "PRODUCT_DESCRIPTION",
        "CUSTOMER_DESCRIPTION",
        "STAGE",
        "LANG",
        "FRONTEND",
        "BACKEND",
        "DATABASE",
        "AUTH",
        "PAYMENTS",
        "EMAIL",
        "HOSTING",
        "TESTING",
        "KEY_SERVICES",
        "TEST_CMD",
        "BUILD_CMD",
        "DEV_CMD",
        "HAS_FRONTEND",
        "HAS_BACKEND",
        "HAS_OPS",
        "HAS_DATA",
    ]
    return {k: os.environ.get(k, "") for k in keys}


def validate(env: dict[str, str]) -> None:
    required = [
        "COMPANY_NAME",
        "PRODUCT_DESCRIPTION",
        "CUSTOMER_DESCRIPTION",
        "STAGE",
        "LANG",
        "FRONTEND",
        "DATABASE",
        "AUTH",
        "PAYMENTS",
        "EMAIL",
        "HOSTING",
        "TESTING",
        "KEY_SERVICES",
        "TEST_CMD",
        "BUILD_CMD",
        "DEV_CMD",
    ]
    missing = [k for k in required if not env.get(k)]
    if missing:
        print("Missing required environment variables:", ", ".join(missing), file=sys.stderr)
        sys.exit(1)


def append_changelog_entry(r: Path, env: dict[str, str]) -> None:
    p = r / "planning" / "CHANGELOG.md"
    if not p.exists():
        return
    text = p.read_text(encoding="utf-8")
    marker = "## Log (newest first)"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"""
## {today} — main — company-os: Tradex preset + automated setup
- Commit: (see git log)
- Files touched: `.claude/`, `planning/`, `scripts/setup.sh`, `scripts/company_os_apply.py`, `scripts/presets/tradex.env`
- Tests added / changed: 0
- Build: pass (docs/skills only)
- Status: done
- Next up: **1.1** — JWT auth + User model per NEXT_STEPS.md Phase 1
- Notes: Company OS applied from zip; use `bash scripts/setup.sh --preset tradex` to re-apply after template resets.
"""
    if "company-os: Tradex preset" in text:
        return
    if marker in text:
        text = text.replace(marker, marker + "\n" + entry, 1)
        p.write_text(text, encoding="utf-8")


def main() -> None:
    r = root()
    env = load_env_from_os()
    validate(env)
    apply_company_md(r, env)
    apply_workflows_md(r, env)
    apply_changelog_date(r)
    if env.get("COMPANY_OS_PRESET") == "tradex":
        apply_tradex_planning(r)
        append_changelog_entry(r, env)
    maybe_remove_team_skills(r, env)
    print("Company OS substitutions applied.")


if __name__ == "__main__":
    main()
