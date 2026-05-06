# Design System

> Single source of truth for all UI agents.
> Copy this file to `.claude/skills/team/design-system.md` and fill in your values.
> Reference implementation: your `src/app/globals.css` + Tailwind config.

---

## Design Philosophy

| Principle | What it means in practice |
|---|---|
| **Mobile first** | Every component works at 375px before desktop refinements |
| **Server by default** | `'use client'` only when hooks, refs, or animation demand it |
| **Design tokens** | No hardcoded colors, radii, or font sizes — always use tokens |
| **Consistent spacing** | 4px or 8px grid, all spacing values are multiples |
| **Accessibility** | WCAG AA minimum — contrast, focus states, screen readers |

---

## Color Tokens

Define all colors as CSS custom properties. No hardcoded hex in components.

```css
:root {
  /* Brand */
  --color-primary:       #[HEX];    /* primary action color */
  --color-primary-dark:  #[HEX];    /* hover / pressed */
  --color-primary-light: #[HEX];    /* background tint */

  /* Accent */
  --color-accent:        #[HEX];    /* primary CTA only */

  /* Neutral */
  --color-bg:            #[HEX];    /* page background */
  --color-surface:       #[HEX];    /* card / panel background */
  --color-border:        #[HEX];    /* dividers, borders */
  --color-text:          #[HEX];    /* body text */
  --color-text-muted:    #[HEX];    /* secondary text */

  /* Semantic */
  --color-success:       #[HEX];
  --color-warning:       #[HEX];
  --color-error:         #[HEX];
  --color-info:          #[HEX];
}
```

**Rules:**
- Primary color: use for nav, links, active states
- Accent color: PRIMARY CTAs ONLY — one per page maximum
- Never use accent for backgrounds, borders, or secondary elements

---

## Typography

```css
:root {
  --font-sans:    '[YOUR FONT]', system-ui, sans-serif;
  --font-mono:    '[YOUR MONO FONT]', monospace;
}
```

### Type Scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-xs` | 12px | 400 | Captions, labels |
| `text-sm` | 14px | 400 | Secondary body |
| `text-base` | 16px | 400 | Primary body |
| `text-lg` | 18px | 500 | Subheadings |
| `text-xl` | 20px | 600 | Section headings |
| `text-2xl` | 24px | 700 | Page headings |
| `text-3xl` | 30px | 700 | Hero headings |
| `text-4xl` | 36px | 800 | Display |

---

## Spacing

Base unit: **4px** (use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)

Never use arbitrary spacing values that aren't multiples of 4.

---

## Border Radius

Define radius tokens instead of hardcoding values:

```css
:root {
  --radius-sm:  [VALUE];  /* small — badges, chips, inputs */
  --radius-md:  [VALUE];  /* medium — cards, list items */
  --radius-lg:  [VALUE];  /* large — panels, modals */
  --radius-xl:  [VALUE];  /* extra large — hero containers */
  --radius-full: 9999px;  /* circles, pills */
}
```

---

## Breakpoints

```
sm:  640px  ← large phones
md:  768px  ← tablets
lg:  1024px ← laptops
xl:  1280px ← desktops
2xl: 1536px ← large screens
```

Rules:
- Design mobile-first — 375px minimum
- Test at 375px, 768px, 1280px
- Touch targets: min 44×44px on mobile
- Max page width: [YOUR MAX WIDTH]

---

## Component Rules

### Buttons

| Variant | When to use | Background | Text |
|---|---|---|---|
| Primary | Main CTA — one per view | `--color-accent` | white |
| Secondary | Supporting action | `--color-primary` | white |
| Ghost | Tertiary / destructive | transparent | `--color-primary` |
| Disabled | Not available | muted | muted |

**Never:** Two primary buttons in the same view.

### Forms / Inputs

- Every input must have an associated `<label>`
- Inline validation on blur (not on every keystroke)
- Error messages below the field, in `--color-error`
- Required fields marked with `*` (or equivalent)

### Cards

- Max one "hero" action per card (one primary CTA)
- Loading skeleton matches card dimensions exactly
- Empty state defined for every list/grid component

---

## Animation / Motion

```
Duration:   150ms for micro-interactions (hover, focus)
            300ms for transitions (panels, modals)
            500ms for page transitions
Easing:     ease-out for entering, ease-in for exiting
Reduced:    Always gate on prefers-reduced-motion
```

```css
@media (prefers-reduced-motion: reduce) {
  /* remove all transitions and animations */
}
```

---

## Accessibility

- Color contrast: WCAG AA minimum (4.5:1 for normal text, 3:1 for large)
- All images have `alt` text (empty string `""` for decorative)
- All interactive elements keyboard navigable
- Focus ring visible on all interactive elements
- Error messages announced to screen readers (aria-live)
- Form labels associated with inputs (not just placeholder text)
