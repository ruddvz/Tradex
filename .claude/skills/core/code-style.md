---
name: code-style
description: >
  Coding standards and style rules for this project. Load for any code-writing
  task to ensure formatting, naming, and patterns are consistent. These rules
  apply regardless of which language or framework you're working in. The goal is
  code that reads like it was written by one person.
---

# Code Style

Consistent code is readable code. Follow these rules without exception.

---

## Universal Rules (All Languages)

### Structure
- **Files:** Max 800 lines. If you're approaching it, split by feature/domain.
- **Functions:** Max 50 lines. If longer, it's doing too much — split it.
- **Nesting:** Max 4 levels deep. Flatten with early returns.
- **No magic numbers.** Name your constants. `const MAX_RETRIES = 3` not `3`.

### Naming
- Names explain intent, not implementation: `getUserOrders` not `fetchData`
- Booleans use `is/has/can/should` prefix: `isActive`, `hasPermission`, `canEdit`
- Event handlers use `handle` prefix: `handleSubmit`, `handleClick`
- Async functions reflect the wait: `await fetchUser()` not `await user()`

### Comments
- Do not comment what code does — code should be self-documenting
- Comment WHY when it's non-obvious: `// Supabase requires userId for RLS`
- No `// TODO` without a ticket/issue number
- Delete commented-out code — that's what git is for

### Error Handling
- Handle errors at every async boundary
- Never swallow errors silently with empty catch blocks
- Log with context: `console.error('[functionName] failed:', error, { context })`
- Return meaningful errors to callers — don't just throw and forget

---

## TypeScript / JavaScript

### Types
```typescript
// Always type function parameters and return values
function createUser(data: CreateUserInput): Promise<User> { ... }

// Prefer interfaces over type aliases for objects
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use union types for finite state
type Status = 'pending' | 'active' | 'cancelled';

// No implicit 'any' — ever
// Bad:
function process(data: any) { ... }
// Good:
function process(data: ProcessInput) { ... }
```

### Immutability
```typescript
// Never mutate — return new copies
// Bad:
items.push(newItem);

// Good:
const newItems = [...items, newItem];

// Never mutate object properties
// Bad:
user.name = 'Alice';

// Good:
const updatedUser = { ...user, name: 'Alice' };
```

### Async Patterns
```typescript
// Use async/await, not .then() chains
// Bad:
fetchUser(id).then(user => fetchOrders(user.id)).then(orders => ...);

// Good:
const user = await fetchUser(id);
const orders = await fetchOrders(user.id);

// Always handle the error case
try {
  const data = await fetchData();
  return { data, error: null };
} catch (error) {
  console.error('[fetchData] failed:', error);
  return { data: null, error: 'Failed to fetch data' };
}
```

### React / Next.js
```typescript
// Named exports only — never default export for components
// Bad:
export default function MyComponent() { ... }

// Good:
export function MyComponent() { ... }

// Props typed with interface
interface CardProps {
  title: string;
  description?: string;
  onClick: () => void;
}

// Server Components by default — 'use client' only when needed
// Need: useState, useEffect, useRef, event handlers, browser APIs
// Don't need: data fetching, static rendering, no interactivity

// Extract event handlers to named functions
// Bad:
<button onClick={() => { doThing1(); doThing2(); }}>Click</button>

// Good:
function handleClick() {
  doThing1();
  doThing2();
}
<button onClick={handleClick}>Click</button>
```

---

## File Organization

```
// Co-locate related files — not all-in-one-type-folder
// Bad:
components/UserCard.tsx
types/UserCard.ts
tests/UserCard.test.ts  ← separated in a types/ folder

// Good:
features/user/
├── UserCard.tsx
├── UserCard.test.tsx
└── types.ts
```

**Index files:** Only use `index.ts` barrel exports when a folder is a public API.
Don't create index files just to avoid typing folder names.

---

## Git Commit Messages

Format: `<type>: <description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

```
feat: add phone OTP verification to signup
fix: prevent double-submit on booking form
refactor: extract payment logic to lib/payment.ts
docs: update API contract for /api/bookings
test: add unit tests for availability calculation
chore: update dependencies to latest patch versions
perf: cache provider search results for 5 minutes
ci: add lint check to PR workflow
```

Rules:
- Lowercase subject line
- No period at the end
- Imperative mood: "add" not "added" or "adds"
- Under 72 characters for the subject line
- Body (optional) explains WHY, not what

---

## What We Don't Do

- No `console.log` in committed code (use conditional debug logging)
- No commented-out code in PRs
- No `@ts-ignore` without a comment explaining why
- No `any` type without a comment explaining what it would ideally be typed as
- No duplicate logic — extract to a shared function
- No direct DOM manipulation in React (use refs + effects)
- No hardcoded URLs, IDs, or other environment-specific values
