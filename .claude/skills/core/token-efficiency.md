---
name: token-efficiency
description: >
  Token-efficient operational protocol with intelligent model routing. Load when
  planning task execution to route work to the right model tier, effort level, and
  output length. This is the cost-reduction layer of the OS — it prevents expensive
  models from doing cheap work, and cheap models from doing expensive work.
---

# Token-Efficient Operational Protocol

> Every token costs real money. Deliver maximum output quality while minimizing waste.
> Route tasks to the right model tier, effort level, and output length. No bloat. No filler.

---

## Model Routing Matrix

### TIER 1 — HAIKU (fast, cheap)
Use when task is describable in one sentence with predictable output:
- File operations, find-and-replace, boilerplate/config generation
- Git operations, log parsing, test runs, linting/type-checking
- Simple CRUD from schema, basic docstrings, pipeline tasks
- Sub-agent tasks with well-defined input/output

### TIER 2 — SONNET ← DEFAULT (80% of all work)
Use for anything requiring judgment, creativity, or multi-file context:
- Multi-file features, API integrations, frontend development
- Database schema/migrations, prompt engineering, code review
- Debugging (reproducible/scoped), documentation, content creation
- Any task not clearly in Tier 1 or Tier 3

### TIER 3 — OPUS (only when cost of being wrong > cost of Opus)
Use only when Sonnet has failed or stakes are extremely high:
- System architecture decisions
- Gnarly bugs Sonnet failed on (escalation only — never start here)
- Security audits for production systems
- Complex multi-agent orchestration design
- First-principles strategy, novel algorithm design

---

## Effort Level Protocol

| Effort | When to Use | Files touched |
|--------|-------------|---------------|
| Low | Config changes, simple questions, single file | 1 |
| Medium | Standard coding work | 2–5 |
| High | Complex debugging, cross-system changes | 6+ |
| Max | Architecture, security reviews (Opus only) | System-wide |

**Auto-effort rules:**
- 1 file → Low
- 2–5 files → Medium
- 6+ files → High
- Failed at lower effort → escalate one level
- Never start at Max

---

## Task Routing Decision Tree

```
Simple, predictable, template-based?       → HAIKU + LOW
Requires judgment, multi-file, creative?   → SONNET + MEDIUM
Has Sonnet already failed?                 → OPUS + HIGH
Architecture/security/novel high-stakes?  → OPUS + HIGH (MAX only if HIGH fails)
Default                                    → SONNET + MEDIUM
```

---

## Token Waste Elimination

**Filler to eliminate:**
- Restating the problem in the response
- Preambles ("Let me…" / "Great question!")
- Post-task summaries that repeat what code shows
- Listing alternatives nobody asked for
- Comments on self-explanatory code

**Substance — NEVER cut:**
- Error handling code
- Architecture rationale (1–2 sentences WHY)
- Non-obvious logic
- Complete implementations
- Real production warnings
- Creative content at full quality

**Length calibration:**
- Simple question → 1–3 sentences
- Code generation → Complete working code with non-obvious comments
- Bug fix → Fix + root cause (however long needed)
- Architecture → Decision + full rationale (no word limit)
- Multi-file features → Complete across all files, no TODOs for "brevity"

---

## Anti-Patterns to Avoid

- **Exploration Spiral** — Don't read 15 files before a 3-line change. Read the specific file + direct imports only.
- **Verbose Diff** — Don't output the entire file when 5 lines changed. Targeted edits only.
- **Safety Essay** — Write code FIRST. Flag real production risks AFTER. Don't write speculative warnings.
- **Redundant Validation** — Don't run the same check 3x with no changes in between.
- **Conversational Agent** — Sub-agents produce output only. No acknowledgments or pleasantries.
- **Over-Engineered Scaffold** — Match complexity to requirement. No abstract base classes for a function called from one place.

---

## Token Budget Awareness

| Model | Input | Output | Cache Read | Cache Write |
|-------|-------|--------|------------|-------------|
| Haiku | $1.00 | $5.00 | $0.10 | $1.25 |
| Sonnet | $3.00 | $15.00 | $0.30 | $3.75 |
| Opus | $5.00 | $25.00 | $0.50 | $6.25 |

(per million tokens)

**Key insight:** Output tokens cost 5x input tokens. Cutting output verbosity by 30% saves more than cutting input context by 60%.

---

## Escalation Protocol

1. Log the failure (task + what went wrong, 1 sentence each)
2. Escalate one tier: Haiku → Sonnet → Opus
3. Escalate one effort level: Low → Medium → High → Max
4. Never double-escalate
5. After Opus/Max fails → flag for human input, move on

---

## Self-Audit Checklist

**Quality (non-negotiable):**
- [ ] Output complete and production-ready? No TODOs, no missing error handling
- [ ] Code handles edge cases and errors properly?
- [ ] Design decisions explained with WHY?
- [ ] Confident deploying to production right now?

**Efficiency (after quality confirmed):**
- [ ] Cheapest model tier that handles this at full quality?
- [ ] Lowest effort level that produced correct output?
- [ ] Output free of preambles, filler, unnecessary repetition?
- [ ] Avoided re-reading files already in context?
- [ ] Batched operations instead of sequential where possible?
- [ ] If Opus used — concrete reason Sonnet wouldn't work?
