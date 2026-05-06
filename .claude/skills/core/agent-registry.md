---
name: agent-registry
description: >
  Full roster of available agents and when to invoke each. Load when deciding
  which agent to delegate a task to. This is the routing table for the orchestrator.
  Every agent has a specific domain — using the wrong agent wastes tokens and
  produces lower-quality output. This registry is the source of truth.
---

# Agent Registry

The complete roster of agents available in this OS. Route tasks here before dispatching.

---

## Core Workflow Agents

| Agent | Purpose | When to invoke proactively |
|-------|---------|-------------|
| `planner` | Implementation planning | Complex features (3+ files), refactoring |
| `architect` | System design and scalability | New routes, schema changes, new services |
| `tdd-guide` | Test-driven development | New features, bug fixes — write tests FIRST |
| `code-reviewer` | Code quality and maintainability | After writing/modifying ANY code |
| `security-reviewer` | Vulnerability detection | Auth, payment, API routes, user input |
| `build-error-resolver` | Fix build/type errors | When build fails — invoke before guessing |
| `e2e-runner` | End-to-end Playwright testing | Critical user flow changes |
| `refactor-cleaner` | Dead code cleanup | Code maintenance, unused imports |
| `doc-updater` | Documentation and codemaps | After adding files/routes/APIs |

---

## Language-Specific Reviewers

| Agent | Language | When to use |
|-------|----------|-------------|
| `typescript-reviewer` | TypeScript/JavaScript | All TS/JS changes |
| `python-reviewer` | Python | All Python changes |
| `go-reviewer` | Go | All Go changes |
| `rust-reviewer` | Rust | All Rust changes |
| `java-reviewer` | Java/Spring Boot | All Java changes |
| `kotlin-reviewer` | Kotlin/Android/KMP | All Kotlin changes |
| `cpp-reviewer` | C++ | All C++ changes |
| `flutter-reviewer` | Flutter/Dart | All Flutter changes |

---

## Language-Specific Build Fixers

| Agent | Language | When to use |
|-------|----------|-------------|
| `build-error-resolver` | Any | Generic build failures first |
| `go-build-resolver` | Go | Go-specific build failures |
| `rust-build-resolver` | Rust | Cargo build failures |
| `java-build-resolver` | Java/Maven/Gradle | Java build failures |
| `kotlin-build-resolver` | Kotlin/Gradle | Kotlin build failures |
| `cpp-build-resolver` | C++ | CMake/compilation failures |
| `pytorch-build-resolver` | PyTorch/CUDA | Training/inference crashes |

---

## Specialist Agents

| Agent | Purpose | When to use |
|-------|---------|-------------|
| `database-reviewer` | PostgreSQL/Supabase | Schema design, SQL, RLS policies |
| `docs-lookup` | Library/API documentation | Unknown API, library setup questions |
| `chief-of-staff` | Communication triage | Email, Slack, PR drafts, multi-channel |
| `loop-operator` | Autonomous loop execution | Long-running agent loops, stall detection |
| `harness-optimizer` | Test harness tuning | Reliability, cost, throughput improvements |

---

## Orchestration Rules

**Always run in parallel:**
- `code-reviewer` + `security-reviewer` (independent — no dependency)
- Multiple domain-specific reviewers for the same change

**Always run in sequence:**
- `tdd-guide` → implement → `build-error-resolver` (if broken) → `code-reviewer`
- `planner` → `architect` (if structural) → implement → review

**Never skip:**
- `code-reviewer` after any substantive code change
- `security-reviewer` for auth, payment, or API changes
- `tdd-guide` before implementing a new feature

---

## Agent Dispatch Template

When spawning a sub-agent, give it exactly these:

```markdown
## Task for [AGENT NAME]

**What to do:**
[Specific, scoped task — one thing only]

**Input you have:**
[What already exists, what was produced by the previous agent]

**Output expected:**
[Exactly what this agent should produce — file, function, response format]

**Constraints:**
[Rules from skill files that apply — link to the file]

**When done:**
Write your output summary to `memory/context-log.md`
```

Never give a sub-agent an open-ended task. Scope it precisely.

---

## Adding Custom Agents

When your project needs domain-specific agents (e.g. `payment-agent`, `mobile-agent`):

1. Create `.claude/agents/[agent-name].md`
2. Add it to this registry table
3. Define its domain clearly — what it owns, what it doesn't
4. Add the dispatch rule: when is it invoked proactively?
