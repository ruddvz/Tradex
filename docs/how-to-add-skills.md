# How to Add Skills to Claude Company OS

A skill is a markdown file that tells Claude exactly how to behave for a specific
context or task. Adding a skill to your Company OS means every agent and every
team member benefits from it automatically — no re-explaining, no re-prompting.

This guide shows you how to write a good one.

---

## The Golden Rule

A skill file is instructions for Claude — not documentation for humans. Write it
like you're telling a very capable contractor exactly what to do and what to
never do. Be direct. Be specific. Assume nothing.

---

## Skill File Template

Copy this template to create a new skill:

```markdown
---
name: your-skill-name
description: >
  [CRITICAL — Claude reads only this to decide whether to load your skill.]
  Describe exactly what this skill does AND when to use it. Be specific.
  Include: what tasks this covers, what keywords should trigger it, and what
  context it applies to. If you want Claude to use this skill, be "pushy" here
  — Claude tends to under-trigger skills. Example: "Use this skill ANY TIME the
  user mentions X, Y, or Z — even if they don't explicitly ask for it."
---

# Skill Name

One sentence: what does this skill enable Claude to do?

---

## Context

What does Claude need to know about the situation it's operating in?
- What system/codebase/product is this for?
- Who is affected by the output?
- What already exists that Claude should know about?

---

## Rules

Non-negotiable. Always followed.

1. [Rule one]
2. [Rule two]
3. [Add as many as needed]

---

## Step-by-Step Process (if applicable)

If this skill is for a repeatable workflow, list the exact steps:

1. [Step one]
2. [Step two]
3. [Step three]

---

## Patterns and Examples

Show the RIGHT way to do things:

```[language]
// GOOD
[example]

// BAD
[example and why it's wrong]
```

---

## What NOT To Do

- Never [thing that would break the system or violate our standards]
- Never [common mistake that Claude might make]
- Never [edge case to avoid]

---

## Output Expected

What should Claude produce when this skill is applied?
- File(s) to create or modify
- Format of the output
- Whether to explain changes or just make them
```

---

## Where to Put the File

```
skills/
├── core/          ← Rules that apply to everyone, all the time
├── team/          ← Role-specific (frontend, backend, ops, data)
└── project/       ← This specific project's context
```

When in doubt: if it applies to one role, put it in `team/`. If it applies to
all roles but only this project, put it in `project/`. If it applies to all
roles and all projects, put it in `core/`.

---

## Writing a Good Description (The Most Important Part)

The `description` field in the YAML frontmatter is what Claude reads to decide
whether to load your skill. If it's vague, Claude will skip your skill. If it's
specific, Claude will use it reliably.

**Weak description:**
```yaml
description: Help with database tasks.
```

**Strong description:**
```yaml
description: >
  Database patterns and query rules for this project. Load this skill for ANY
  task involving SQL queries, Supabase operations, schema changes, migrations,
  Row Level Security policies, or stored functions. Also trigger when the user
  mentions "database", "query", "table", "migration", "RLS", or "Supabase" in
  the context of this project — even if the primary task is something else.
```

The difference: the strong one lists specific keywords and tells Claude to load
it even when it's secondary to the task.

---

## Skill Quality Checklist

Before merging a new skill:

- [ ] The `name` is lowercase and hyphenated (`my-skill-name`)
- [ ] The `description` lists specific trigger words and contexts
- [ ] The description says to load the skill for adjacent tasks too
- [ ] Rules are numbered and actionable (not vague guidelines)
- [ ] "What NOT to do" section exists with at least 2 items
- [ ] Examples show good and bad patterns side by side
- [ ] The skill is under 500 lines (if longer, split into files with references)
- [ ] Another team member read it and understood it in under 2 minutes

---

## Updating a Skill

Skills are living documents. When you:
- Find a better way to do something → update the pattern
- Hit a new "gotcha" → add it to "What NOT to do"
- Change the tech stack → update the stack section
- Make a significant decision → log it in `project/decisions.md`

Always update the skill in the same PR as the change that prompted the update.
