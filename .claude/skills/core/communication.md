---
name: communication
description: >
  Writing standards for all human-readable output in this project. Load when
  writing PRs, commit messages, error messages, documentation, changelogs,
  user-facing copy, or any text that humans will read. Good communication is
  as important as good code — it's often how people first experience your work.
---

# Communication Standards

Clear writing is a form of respect. Follow these standards for all human-readable output.

---

## PR Descriptions

Every PR must have:

```markdown
## What this does
[1-3 sentences describing the change. What problem does it solve? What does it enable?]

## Why
[Why this approach? If there are alternatives, why was this one chosen?]

## Changes
- [File/component]: [what changed and why]
- [File/component]: [what changed and why]

## Testing
- [ ] Build passes (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Tested locally: [flows you tested manually]
- [ ] No regressions: [what you checked didn't break]

## Screenshots (if UI change)
[Before / After screenshots or video]

## Notes for reviewers
[Anything the reviewer should pay special attention to, known trade-offs, or follow-up work]
```

---

## Error Messages (User-Facing)

Error messages are UX. They should:

1. **Say what happened** — not just "An error occurred"
2. **Say what to do** — give the user a next step
3. **Be specific without being technical** — no stack traces, no SQL errors
4. **Not blame the user** — "We couldn't find that account" not "Invalid credentials"

```
// Bad:
"Error 400: Validation failed"
"Something went wrong"
"null is not an object"

// Good:
"We couldn't verify your phone number. Please check it and try again."
"Your session expired. Sign in again to continue."
"That time slot is no longer available. Here are other options."
```

---

## Technical Documentation

When writing docs for technical audiences (API contracts, architectural notes, runbooks):

- Lead with the use case, not the implementation
- Use code examples for everything non-trivial
- Tables over prose when listing options, status codes, or parameters
- Sequential numbered steps for processes (not prose)
- Bold the most important constraint on each section

---

## Changelog Entries (for CHANGELOG.md)

Format defined in `handoff-protocol.md`. Keep these:
- **Factual** — describe what changed, not how hard it was
- **Atomic** — one commit, one entry
- **Actionable** — `Next up:` must name a specific slice or ask a specific question

---

## Internal Agent Communication

When agents communicate with each other or with humans:

- **No pleasantries.** Sub-agents produce output only. No "Great question!" or "I'd be happy to help."
- **No speculative warnings.** If it's a real risk, state it once. Don't write paragraphs about theoretical problems.
- **Lead with the answer.** Context comes after the answer, not before.
- **Bullet the actions.** When listing steps, use bullets. Do not write steps as prose.

---

## Commit Message Rules

See `code-style.md` for the full format. Key rules:

- Imperative mood: "add" not "added" / "adding"
- Lowercase subject line, under 72 chars
- Type prefix required: `feat:`, `fix:`, `docs:`, etc.
- No vague messages: "fix stuff", "update", "WIP", "misc"

---

## Naming Things

| Thing | Rule | Why |
|---|---|---|
| Features | Noun phrases | "Booking confirmation", not "confirm booking" |
| Actions | Verb phrases | "Book a session", not "Session booking" |
| States | Adjectives | "Pending approval", not "Waiting for approval" |
| Errors | What broke + fix | "Phone not verified. Check SMS." |

---

## What We Don't Write

- Comments that explain what code does (code should be self-documenting)
- Marketing copy in error messages
- Apologies in error messages ("Sorry, but...")
- Corporate filler: "leverage", "utilize", "synergy"
- Vague time estimates: "coming soon", "in the future"
- Hedged instructions: "you may want to consider"
