---
name: frontend
description: >
  Frontend development context for this project. Load for any task involving
  UI components, pages, styling, routing, state management, or anything the
  user sees and interacts with. Covers component patterns, design tokens,
  accessibility basics, and performance rules.
---

# Frontend Skill

Everything needed to build consistent, high-quality UI in this project.

---

## Stack

- **Framework:** [e.g. Next.js 14 App Router / React 18 / Vue 3]
- **Styling:** [e.g. Tailwind CSS v3 / CSS Modules / Styled Components]
- **Component library:** [e.g. shadcn/ui / Radix / Headless UI / none]
- **State management:** [e.g. Zustand / React Context / Jotai / none]
- **Data fetching:** [e.g. TanStack Query / SWR / native fetch]
- **Forms:** [e.g. React Hook Form + Zod / Formik / none]
- **Icons:** [e.g. Lucide React / Heroicons / Phosphor]

---

## Design Tokens

### Colors
```css
/* Primary */
--color-primary:    [HEX];
--color-primary-hover: [HEX];

/* Neutral */
--color-bg:         [HEX];
--color-surface:    [HEX];
--color-border:     [HEX];
--color-text:       [HEX];
--color-text-muted: [HEX];

/* Semantic */
--color-success:    [HEX];
--color-warning:    [HEX];
--color-error:      [HEX];
```

### Typography
```
Heading font:  [e.g. Inter / Geist / DM Sans]
Body font:     [e.g. Inter / System UI]
Mono font:     [e.g. JetBrains Mono / Fira Code]

Scale:
  xs:   12px
  sm:   14px
  base: 16px
  lg:   18px
  xl:   20px
  2xl:  24px
  3xl:  30px
```

### Spacing
We use a [4px / 8px] base grid. All spacing values should be multiples of this.

---

## Component Patterns

### New components checklist
- [ ] Named export (not default export)
- [ ] Props typed with an interface
- [ ] Handles loading state
- [ ] Handles empty/error state
- [ ] Works on mobile (min 375px width)
- [ ] No hardcoded colors or sizes (use design tokens)

### Folder structure for components
```
components/
├── ui/           ← Generic, reusable (Button, Input, Card, Modal)
├── features/     ← Feature-specific (UserCard, InvoiceRow, OrderSummary)
└── layouts/      ← Page layouts and wrappers
```

### State rules
- Local UI state (open/closed, hover) → `useState`
- Shared app state → [your state manager]
- Server state / async data → [your data fetcher]
- Do not put server data in global state — let the fetching layer own it

---

## Routing

**Framework:** [Next.js App Router / React Router / etc.]

```
app/
├── (auth)/           ← Auth-protected routes
│   ├── dashboard/
│   └── settings/
├── (public)/         ← Public routes
│   ├── login/
│   └── signup/
└── api/              ← API routes
```

Route naming: lowercase, hyphen-separated. `/user-profile` not `/userProfile`.

---

## Responsive Design

Breakpoints:
```
sm:  640px   ← large phones
md:  768px   ← tablets
lg:  1024px  ← laptops
xl:  1280px  ← desktops
2xl: 1536px  ← large screens
```

Rules:
- Always design mobile-first (start at 375px, expand up)
- Test at 375px, 768px, and 1280px minimum
- Touch targets must be at least 44x44px on mobile
- No horizontal scroll on any breakpoint

---

## Accessibility Basics

- All images must have `alt` text (empty string `""` for decorative images)
- Interactive elements must be keyboard navigable
- Color alone must not be the only indicator of meaning
- Form inputs must have associated labels
- Error messages must be announced to screen readers

---

## Performance Rules

- Images: use `next/image` or lazy loading. Never unconstrained `<img>` in a loop.
- Avoid large client-side bundles — move logic to server components when possible
- Do not fetch the same data in multiple components — lift fetching up
- No inline styles in JSX (use className with Tailwind or CSS vars)

---

## Common Mistakes to Avoid

- Do not use `useEffect` to fetch data — use the data fetching layer
- Do not nest ternaries more than 2 levels deep — extract to a variable
- Do not put business logic inside components — move to `lib/` or hooks
- Do not use array index as React key on dynamic lists

---

## Self-Audit (run when asked to check the frontend)

> Full protocol in `skills/core/self-audit.md`. This is your domain-specific checklist.

Load `skills/core/self-audit.md` and run the universal checks, then these:

### Correctness
- [ ] All pages render without console errors in the browser?
- [ ] All forms show validation errors and disable submit while loading?
- [ ] All loading states (skeleton/spinner) implemented — no blank flashes?
- [ ] All empty states handled — no unhandled null/undefined crashes?
- [ ] All images have `alt` text, all `<img>` tags use `next/image`?

### Accessibility & Responsiveness
- [ ] No horizontal scroll at 375px?
- [ ] All interactive elements reachable via keyboard (Tab + Enter/Space)?
- [ ] Color contrast meets WCAG AA (4.5:1 for body text)?
- [ ] All form inputs have associated `<label>` elements?

### Architecture
- [ ] No `'use client'` without a real reason (hooks, refs, event handlers)?
- [ ] No `useEffect` used for data fetching — using query layer (TanStack/SWR/fetch)?
- [ ] No business logic inside components — moved to `lib/` or hooks?
- [ ] No hardcoded colors, radii, or font sizes — using design tokens?
- [ ] No inline `style={{}}` in JSX?

### Performance
- [ ] No unconstrained `<img>` in loops?
- [ ] No duplicate data fetching across sibling components?
- [ ] Large client bundles split with dynamic imports?

**When you find issues:**
- P1/P2 → fix immediately, commit with `fix(frontend): ...`
- P3 → add slice to `planning/EXECUTION-PLAN.md`, write audit report to `planning/ACTIVE.md`
