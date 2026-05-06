---
name: decisions
description: >
  Log of important technical and product decisions made in this project. Load when
  about to make a significant change, when something "feels wrong" about the current
  approach, or when onboarding and trying to understand why things are the way they
  are. Prevents re-litigating solved problems and preserves institutional knowledge.
---

# Decision Log

Every significant decision made in this project, and why.

This file exists so that future you (and future team members) don't spend hours
wondering "why is it done this way?" — or worse, undo a decision without knowing
the reason it was made.

---

## How to Add a Decision

When you make a significant technical or product decision, add an entry:

```markdown
### DECISION-XXX: [Short title]
**Date:** YYYY-MM-DD
**Status:** Accepted / Superseded by DECISION-XXX / Reversed
**Decided by:** [Name(s)]

**Context:**
What situation or problem prompted this decision?

**Decision:**
What was decided, specifically?

**Reasoning:**
Why this over the alternatives?

**Alternatives considered:**
- [Option A] — why rejected
- [Option B] — why rejected

**Consequences:**
What becomes easier? What becomes harder? What do we accept as a trade-off?
```

---

## Active Decisions

### DECISION-001: [Example — fill in your real first decision]
**Date:** YYYY-MM-DD
**Status:** Accepted
**Decided by:** [Name]

**Context:**
[e.g. We needed to choose between two authentication providers at the start of the project.]

**Decision:**
[e.g. Use Supabase Auth instead of building custom JWT auth.]

**Reasoning:**
[e.g. Faster to ship, handles edge cases (email verification, password reset, OAuth) out of
the box, integrates directly with our Supabase database. Custom JWT would take 3-4 days
and introduce security risk.]

**Alternatives considered:**
- Custom JWT — rejected because time-to-ship and security risk
- Clerk — rejected because additional cost and separate service to manage

**Consequences:**
- We are tied to Supabase's auth model. If we ever leave Supabase, auth migration is complex.
- We accept that trade-off for now given our team size and stage.

---

### DECISION-002: [Your second decision here]
**Date:**
**Status:**
**Decided by:**

**Context:**

**Decision:**

**Reasoning:**

**Alternatives considered:**

**Consequences:**

---

## Superseded / Reversed Decisions

Decisions we changed our minds on. Kept for historical context.

### DECISION-XXX: [Original decision title] — SUPERSEDED
**Original date:** YYYY-MM-DD
**Superseded by:** DECISION-XXX on YYYY-MM-DD

**Why reversed:**
[What changed that made the original decision wrong or no longer valid?]
