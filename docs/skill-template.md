# Skill Template

Copy this file to `skills/[core|team|project]/your-skill-name.md` and fill in the sections.
Delete any sections that don't apply to your skill.

---

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
` `` `

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
