---
name: project-architecture
description: >
  Architecture decisions, system design, and technical context for this project.
  Load when making structural changes, adding new features, writing migrations,
  or making decisions that affect multiple parts of the system. Also load when
  onboarding — this is the technical map of the project.
---

# Project Architecture

The technical map of this project. Understand this before making structural changes.

---

## System Overview

**What this project does:**
[2-3 sentences describing the system from a technical perspective. What problem does
it solve? What are the main moving parts?]

**Key user flows:**
1. [Most important flow — e.g. "User signs up → verifies phone → books session"]
2. [Second flow — e.g. "Provider lists availability → patient searches → booking created"]
3. [Third flow if applicable]

---

## Architecture Diagram

```
[Draw a simple ASCII diagram of your system. Example:]

Browser / Mobile
    │
    ▼
Next.js App (Vercel)
    ├── /app              ← Server Components (default)
    │   ├── (public)/     ← Public routes, no auth
    │   ├── (auth)/       ← Protected routes, session required
    │   └── api/          ← API route handlers
    ├── /components       ← React components
    │   ├── shared/       ← Team-owned shared primitives
    │   └── features/     ← Feature-specific components
    └── /lib              ← Business logic, service clients
          │
          ├── Supabase (DB + Auth + Storage)
          ├── Resend (Transactional email)
          └── Stripe/Razorpay (Payments)
```

---

## Data Model

### Core entities

```
[List your main database tables and their relationships. Example:]

users
  └── has many → bookings (as patient)
  └── has one  → provider_profile

provider_profiles
  └── belongs to → users
  └── has many   → availabilities

bookings
  └── belongs to → users (patient)
  └── belongs to → provider_profiles
  └── has one    → payments

payments
  └── belongs to → bookings
```

### Key relationships to know
- [Explain any non-obvious relationship or constraint]
- [e.g. "Users can be both patient AND provider — role is not exclusive"]
- [e.g. "Bookings are soft-deleted, never hard-deleted"]
- [e.g. "Availabilities are generated weekly by a cron job, not stored ad-hoc"]

---

## Key Architectural Decisions

These decisions were made deliberately. Don't change them without understanding why.

### Decision 1: [Name it]
**What:** [What was decided]
**Why:** [Why this choice was made over alternatives]
**Trade-off:** [What we gave up to get this]
**Date:** YYYY-MM-DD

### Decision 2: [Name it]
**What:**
**Why:**
**Trade-off:**
**Date:**

> Add more decisions as they are made. See `decisions.md` for the full log.

---

## Feature Flags / Config

```typescript
// Features that can be enabled/disabled
const FEATURES = {
  NEW_UI:        process.env.NEXT_PUBLIC_FF_UI_V2 === 'true',
  BETA_FEATURE:  process.env.NEXT_PUBLIC_FF_BETA === 'true',
};
```

[List current feature flags and what they control]

---

## Third-Party Integrations

| Service | Purpose | Key file(s) | Notes |
|---|---|---|---|
| Supabase | DB + Auth + Storage | `lib/supabase.ts` | RLS enabled on all tables |
| Resend | Transactional email | `lib/email.ts` | Templates in `emails/` folder |
| Stripe / Razorpay | Payments | `lib/payment.ts` | Webhook at `/api/webhooks/payment` |
| [Add yours] | | | |

---

## Performance Considerations

- [e.g. "The provider search query is expensive — it has a 60s cache; don't remove it"]
- [e.g. "Product images are served via CDN — don't change the storage bucket structure"]
- [e.g. "The booking check hits multiple tables — it uses a DB function, not ORM queries"]
- [e.g. "Homepage is fully static — revalidate after any provider data change"]

---

## Security Boundaries

- **Public routes:** [List routes accessible without auth]
- **Patient-only routes:** [Routes requiring patient session]
- **Provider-only routes:** [Routes requiring provider session]
- **Admin-only routes:** [Routes requiring admin role]
- **RLS policies:** Every Supabase table has RLS. Never bypass with `service_role` unless truly necessary.

---

## Known Technical Debt

Things we know are imperfect and plan to fix:

| Area | Issue | Priority | Owner |
|---|---|---|---|
| [e.g. Auth] | [Token refresh not handled gracefully] | [High] | [Name] |
| [e.g. Search] | [Full-text search is regex-based, not indexed] | [Medium] | [Name] |

Do not build on top of these without flagging them first.

---

## Deployment

**Environments:**
- `local` — your machine, `.env.local`
- `preview` — Vercel preview deploys, auto-created per PR
- `production` — [PROD_URL], deploys from `main` branch

**Deploy process:**
```bash
# To production (via PR)
git push origin feat/my-feature
# Open PR → CI green → merge → auto-deploys
```

**Rollback:**
[How to quickly rollback a bad deploy — e.g. "Revert the merge commit" or "Redeploy previous tag in Vercel dashboard"]

---

## Migrations

All DB migrations live in `supabase/migrations/` and are numbered sequentially.

**Rules:**
- Never edit existing migrations
- Always run locally before committing
- Document schema changes in this file under "Data Model"
- Coordinate production timing — migrations run BEFORE code deploy
