# Trading App Design System

**Product:** Trading Journal / AI Playbooks / Prop Firm / Reports / Risk Engine  
**Platform:** Mobile-first responsive web app / PWA  
**Theme:** Premium dark fintech operating system  
**Design Goal:** Clean, professional, data-first, fast to scan, emotionally calm, and implementation-ready.

---

## 1. Product Design Direction

This app should feel like a premium trading operating system, not a generic trading dashboard.

The design language should combine:

- **Linear-style product clarity**
- **Revolut-style fintech polish**
- **TradingView-style data density**
- **Arc-style ambient gradients**
- **AI-first intelligence surfaces**

The app must feel:

- premium
- fast
- serious
- intelligent
- calm under pressure
- optimized for repeated daily use

Avoid:

- crypto casino visuals
- excessive neon
- cluttered card grids
- too many equal-sized boxes
- generic SaaS dashboard layouts
- decorative UI that does not improve clarity

---

## 2. Core UX Principles

### 2.1 Data First

Every screen should answer one primary question quickly.

| Tab | Primary Question |
|---|---|
| Home | How am I performing right now? |
| Journal | What happened in my trades? |
| AI | What should I improve? |
| Prop Firm | Am I safe and on track to pass? |
| Reports | What patterns explain my performance? |
| Calc | What size should I trade safely? |

---

### 2.2 One Hero Per Screen

Each tab must have one dominant hero module.

Do not start every tab with small cards. The top section should establish the screenâs purpose immediately.

Examples:

- Home: Total P&L + equity sparkline
- Journal: Recent trade / trade stream
- AI: Ask AI / pattern engine
- Prop Firm: Challenge progress ring
- Reports: Equity curve
- Calc: Position size result

---

### 2.3 Progressive Disclosure

Show the simple version first. Hide complexity behind:

- chips
- tabs
- expand panels
- bottom sheets
- advanced filters
- long press actions

The app should look clean but still support advanced traders.

---

### 2.4 Contextual Actions

Avoid permanent buttons everywhere.

Actions should appear where they make sense:

- Add Trade appears in Journal
- Export PDF appears in Reports
- Run AI Analysis appears in AI
- Calculate appears in Risk Engine
- Sync/Refresh appears globally

---

## 3. Visual Identity

### 3.1 Personality

The UI should feel:

- dark
- focused
- premium
- technical
- calm
- high-trust

The design should not feel playful or casual.

---

### 3.2 Visual Keywords

Use these words as design checks:

- graphite
- glass
- precision
- intelligence
- controlled glow
- sharp hierarchy
- deep contrast
- quiet luxury

---

## 4. Color System

### 4.1 Base Colors

```css
:root {
  --bg-primary: #050812;
  --bg-secondary: #080D18;
  --bg-elevated: #10182A;
  --bg-card: #141D33;
  --bg-card-soft: #18223A;
  --bg-input: #0B111C;

  --border-subtle: rgba(126, 146, 185, 0.16);
  --border-strong: rgba(126, 146, 185, 0.28);

  --text-primary: #F8FAFC;
  --text-secondary: #B6C2D9;
  --text-muted: #7D8AA5;
  --text-disabled: #4E5A70;
}
```

---

### 4.2 Semantic Colors

```css
:root {
  --success: #2DD4A3;
  --success-soft: rgba(45, 212, 163, 0.14);
  --success-border: rgba(45, 212, 163, 0.32);

  --analytics: #4A9DFF;
  --analytics-soft: rgba(74, 157, 255, 0.14);
  --analytics-border: rgba(74, 157, 255, 0.32);

  --ai: #8B5CF6;
  --ai-soft: rgba(139, 92, 246, 0.16);
  --ai-border: rgba(139, 92, 246, 0.34);

  --warning: #F6B73C;
  --warning-soft: rgba(246, 183, 60, 0.15);
  --warning-border: rgba(246, 183, 60, 0.34);

  --danger: #EF5F5F;
  --danger-soft: rgba(239, 95, 95, 0.14);
  --danger-border: rgba(239, 95, 95, 0.32);
}
```

---

### 4.3 Accent Usage Rules

| Color | Use For | Do Not Use For |
|---|---|---|
| Green | Profit, success, positive progress | Every icon |
| Blue | Reports, analytics, charts | Warnings |
| Purple | AI, intelligence, recommendations | Normal metrics |
| Amber | Risk, caution, drawdown | Profit |
| Red | Loss, violation, critical risk | Neutral states |

---

### 4.4 Background Gradient

Use a layered dark background throughout the app.

```css
.app-bg {
  background:
    radial-gradient(circle at top left, rgba(45, 212, 163, 0.08), transparent 28%),
    radial-gradient(circle at bottom right, rgba(74, 157, 255, 0.08), transparent 34%),
    linear-gradient(180deg, #050812 0%, #070B15 100%);
}
```

---

## 5. Typography

### 5.1 Font Stack

Preferred:

```css
font-family: "Inter Tight", "Inter", "SF Pro Display", system-ui, sans-serif;
```

Fallback:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

### 5.2 Type Scale

```css
:root {
  --font-xs: 11px;
  --font-sm: 12px;
  --font-md: 14px;
  --font-lg: 16px;
  --font-xl: 20px;
  --font-2xl: 24px;
  --font-3xl: 32px;
  --font-hero: 44px;
}
```

---

### 5.3 Font Weights

```css
:root {
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 800;
}
```

---

### 5.4 Typography Roles

| Role | Size | Weight | Color |
|---|---:|---:|---|
| App Title | 28â32px | 700 | Primary |
| Section Title | 20â24px | 700 | Primary |
| Card Title | 15â17px | 600 | Primary |
| Metric Hero | 40â52px | 800 | Primary / Semantic |
| Metric Medium | 26â34px | 700 | Semantic |
| Body | 14â16px | 400 | Secondary |
| Metadata | 12â13px | 500 | Muted |
| Label | 11â12px | 600 | Muted uppercase |

---

## 6. Spacing System

Use an 8-point spacing system.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
}
```

### Layout Spacing

| Area | Spacing |
|---|---:|
| Screen side padding | 20px |
| Card inner padding | 16â20px |
| Card gap | 12â16px |
| Section gap | 28â36px |
| Bottom nav safe padding | 96px minimum |

---

## 7. Radius System

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}
```

Usage:

| Component | Radius |
|---|---:|
| Buttons | 12â16px |
| Cards | 20â24px |
| Inputs | 14â16px |
| Chips | 999px |
| Bottom nav | 24px |

---

## 8. Shadows and Elevation

### 8.1 Card Shadow

```css
.card {
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
```

### 8.2 Active Glow

```css
.glow-success {
  box-shadow:
    0 0 0 1px rgba(45, 212, 163, 0.28),
    0 16px 40px rgba(45, 212, 163, 0.12);
}
```

### 8.3 Danger Glow

```css
.glow-danger {
  box-shadow:
    0 0 0 1px rgba(239, 95, 95, 0.34),
    0 16px 40px rgba(239, 95, 95, 0.12);
}
```

---

## 9. Component System

---

# 9.1 App Shell

The app shell includes:

- status area
- page header
- scrollable content
- floating bottom nav
- optional global action buttons

### Header Structure

```tsx
<AppHeader
  title="Dashboard"
  subtitle="Overview of your trading performance"
  actions={[
    "refresh",
    "notifications",
    "profile"
  ]}
/>
```

### Header Rules

- Title should be max one line.
- Subtitle should be max one line.
- Do not let long titles truncate awkwardly.
- Use smaller title size on tabs with long names.
- Header should remain visually lightweight.

---

# 9.2 Page Header

### Layout

```txt
[Title]                         [Refresh] [Bell] [Avatar]
[Subtitle]
```

### Sizing

```css
.page-header {
  padding: 18px 20px 14px;
  min-height: 92px;
}
```

### Action Buttons

```css
.header-icon-button {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(16, 24, 42, 0.72);
  border: 1px solid rgba(126, 146, 185, 0.22);
}
```

---

# 9.3 Cards

### Base Card

```css
.card {
  background:
    linear-gradient(180deg, rgba(24, 34, 58, 0.94), rgba(15, 23, 42, 0.96));
  border: 1px solid rgba(126, 146, 185, 0.20);
  border-radius: 22px;
  padding: 18px;
}
```

### Card Variants

| Variant | Purpose |
|---|---|
| Metric Card | Small/medium numerical metric |
| Hero Card | Main screen summary |
| Insight Card | AI or recommendation |
| Risk Card | Warning/drawdown states |
| Chart Card | Graph-heavy modules |
| Trade Card | Journal trade entry |
| Form Card | Calculator and data input |

---

# 9.4 Hero Cards

Hero cards should be visually dominant.

### Example: Home Hero

Content:

- Total P&L
- Period selector
- Change vs last period
- Mini equity curve
- key comparison

```tsx
<HeroMetricCard
  label="Total P&L"
  value="$25,334.88"
  trend="+12.4%"
  period="90D"
  chart="equity-sparkline"
/>
```

### Rules

- Do not put more than 2 main metrics in one hero.
- Use one large number.
- Include context below the number.
- Use chart only if it supports the metric.
- Keep hero card height between 180â240px.

---

# 9.5 Metric Cards

### Layout

```txt
[Label]                    [Icon]
[Metric]
[Context]
```

### Example

```tsx
<MetricCard
  label="Win Rate"
  value="62.5%"
  caption="75W / 45L"
  tone="success"
  icon="target"
/>
```

### Rules

- Metric cards should not all be identical.
- Use 2-column layout only for secondary metrics.
- Use smaller icons.
- Muted captions are mandatory.

---

# 9.6 Buttons

### Primary Button

```css
.btn-primary {
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #18C991, #2DD4A3);
  color: #04110D;
  font-weight: 700;
}
```

Use for:

- Add Trade
- New Playbook
- Calculate
- Save
- Start Analysis

---

### Secondary Button

```css
.btn-secondary {
  height: 46px;
  border-radius: 14px;
  background: rgba(30, 41, 70, 0.9);
  border: 1px solid rgba(126, 146, 185, 0.20);
  color: #F8FAFC;
}
```

Use for:

- Export CSV
- More Filters
- View Details

---

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #B6C2D9;
}
```

Use for:

- View all
- Dismiss
- Reset

---

# 9.7 Chips

### Chip Types

| Chip | Use |
|---|---|
| Filter Chip | Journal filters |
| Status Chip | Active, Complete, Warning |
| Strategy Chip | Breakout, London, Liquidity |
| Timeframe Chip | 7D, 30D, 90D, YTD |

### CSS

```css
.chip {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(16, 24, 42, 0.72);
  border: 1px solid rgba(126, 146, 185, 0.20);
  color: #B6C2D9;
  font-size: 12px;
  font-weight: 600;
}

.chip-active {
  background: rgba(45, 212, 163, 0.15);
  border-color: rgba(45, 212, 163, 0.36);
  color: #2DD4A3;
}
```

---

# 9.8 Inputs

### Text Input

```css
.input {
  height: 52px;
  border-radius: 14px;
  padding: 0 16px;
  background: #0B111C;
  border: 1px solid rgba(126, 146, 185, 0.20);
  color: #F8FAFC;
}
```

### Focus State

```css
.input:focus {
  border-color: rgba(45, 212, 163, 0.48);
  box-shadow: 0 0 0 4px rgba(45, 212, 163, 0.10);
}
```

### Error State

```css
.input-error {
  border-color: rgba(239, 95, 95, 0.48);
  box-shadow: 0 0 0 4px rgba(239, 95, 95, 0.10);
}
```

---

# 9.9 Bottom Navigation

The bottom nav should feel like a floating dock.

### Structure

```txt
Home | Journal | AI | Prop | Reports | Calc
```

### CSS

```css
.bottom-nav {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  height: 72px;
  border-radius: 24px;
  background: rgba(12, 18, 32, 0.78);
  backdrop-filter: blur(22px);
  border: 1px solid rgba(126, 146, 185, 0.18);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42);
}
```

### Active Tab

```css
.nav-item-active {
  background: rgba(45, 212, 163, 0.15);
  color: #2DD4A3;
  border-radius: 18px;
}
```

### Rules

- Active tab gets icon + label.
- Inactive tabs can use icon + small label.
- AI tab may use purple active tone if selected.
- Do not over-glow all nav items.

---

# 9.10 Charts

### Chart Style

- Dark grid lines
- Minimal axis labels
- Smooth lines
- Filled area gradient
- Strong endpoint emphasis
- No unnecessary legends

### Equity Curve Colors

```css
--chart-profit-line: #2DD4A3;
--chart-profit-fill: rgba(45, 212, 163, 0.18);
--chart-benchmark-line: #4A9DFF;
--chart-loss-line: #EF5F5F;
```

### Rules

- Chart cards should be taller than metric cards.
- Axis text should be muted.
- Use dashed grid lines at low opacity.
- Do not overload charts with more than 2â3 data series on mobile.

---

# 9.11 Progress Bars

### Base

```css
.progress-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(126, 146, 185, 0.16);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #10B981, #2DD4A3);
}
```

### Risk Progress

Use amber or red depending on severity.

| Usage | Color |
|---|---|
| Safe | Green |
| Caution | Amber |
| Danger | Red |

---

# 9.12 Progress Ring

Used mainly for Prop Firm.

### Ring Rules

- Ring is the hero element.
- Center should show main percentage.
- Below center should show short label.
- Use secondary labels around or below ring.
- Ring thickness: 12â18px.
- Avoid too many rings on same screen.

---

## 10. Screen Redesign Specifications

---

# 10.1 Home Tab

## Goal

Show trading performance at a glance.

## Layout

```txt
Header
Hero P&L Card
Key Metrics Grid
Trading Consistency Card
Weekly Performance Strip
Recent Activity
Bottom Nav
```

## Recommended Modules

### Hero P&L Card

Contains:

- Total P&L
- period selector
- 90-day equity sparkline
- change vs previous period
- small context text

### Key Metrics

Cards:

- Win Rate
- Profit Factor
- Avg R:R
- Max Drawdown

### Trading Consistency

Shows:

- consistency score
- improvement status
- small sparkline

### Weekly Performance

GitHub-style dot matrix:

- green = profit day
- red = loss day
- muted = no trade
- label for current week

### Recent Activity

Shows last 2â3 trades only.

Do not turn Home into Journal.

---

# 10.2 Journal Tab

## Goal

Make trade logging and review feel fast and intelligent.

## Layout

```txt
Header
Search + quick filter button
Horizontal filter chips
Trade stream grouped by date
Expandable trade cards
Floating Add Trade button
Bottom Nav
```

## Replace Large Filter Form

Current filter area is too bulky.

Use chips instead:

```txt
All 120 | NAS100 | XAUUSD | Long | Short | Winners | Losses | A Grade
```

## Trade Card Structure

```txt
Symbol + Time + Direction
P&L + Grade
Mini chart thumbnail
Entry / Exit / R:R
Tags
AI note preview
```

## Example Trade Card

```txt
NAS100
Long Â· 2:15 PM

+$990      Grade A

Entry: 18,320.5
Exit: 18,375.4
R:R: 1:2.30

Tags: Breakout, London Session, News

AI Note:
Clean breakout above structure with strong volume confirmation.
```

## Interaction

- Tap card to expand.
- Swipe right to duplicate setup.
- Swipe left to edit/delete.
- Long press for quick actions.
- Add Trade should be a floating primary button.

---

# 10.3 AI Playbook Tab

## Goal

Make AI feel like a trading intelligence layer.

## Layout

```txt
Header
Ask AI Card
AI Playbook Overview
Insight Cards
Pattern Modules
Behavioral Analysis
Bottom Nav
```

## Ask AI Card

Primary prompt:

```txt
What pattern should I focus on this week?
```

Use:

- text input style
- purple action button
- suggested prompts

## AI Strategy Module

Each playbook should show:

- strategy name
- confidence score
- win rate
- profit factor
- trades
- performance sparkline
- view full analysis button

## AI Insights

Insight types:

| Type | Tone |
|---|---|
| Strongest Edge | Success |
| Watch Out | Warning |
| Behavioral Bias | AI/Purple |
| Risk Alert | Danger |
| Opportunity | Analytics/Blue |

## Suggested AI Features

- pattern detection
- mistake detection
- emotional trigger analysis
- session recommendation
- no-trade warning
- best setup of the week
- weakest strategy
- confidence decay

---

# 10.4 Prop Firm Tab

## Goal

Help trader pass challenge safely.

## Layout

```txt
Header
Challenge Selector
Circular Progress Hero
Risk Summary Cards
Target Progress
Drawdown Usage
Rule Warnings
Pass Probability
Bottom Nav
```

## Hero Ring

Center:

```txt
65.5%
Challenge Progress
```

Supporting:

```txt
Day 12 of 27
17 days remaining
```

## Important Metrics

- Current P&L
- Account Size
- Daily Loss
- Max Loss
- Profit Target
- Drawdown Limit
- Pass Probability

## Risk Rules

Use very strong visual states.

| State | Meaning |
|---|---|
| Green | Safe |
| Amber | Watch closely |
| Red | Violation risk |

## Recommended Additions

- safe lot size today
- max allowed loss today
- rule checklist
- daily loss buffer
- pass probability
- minimum target per day

---

# 10.5 Reports Tab

## Goal

Give serious performance analytics.

## Layout

```txt
Header
Timeframe Selector
Segment Tabs
Equity Curve
Win/Loss Distribution
Session Performance
Strategy Breakdown
Mistake Analysis
Export PDF
Bottom Nav
```

## Tabs

```txt
Overview | Performance | Sessions | Strategies | Behavior
```

## Required Charts

- Equity Curve
- Win/Loss Distribution
- Performance by Session
- Profit by Symbol
- R:R Distribution
- Drawdown Curve
- Calendar Heatmap

## Chart Hierarchy

The equity curve should be the top and largest card.

## Export

Export PDF should be a contextual header action.

---

# 10.6 Risk Calculator Tab

## Goal

Become a risk engine, not just a form.

## Layout

```txt
Header
Mode Toggle
Account + Risk Inputs
Instrument Selector
Entry / Stop / Target
Live Position Size Result
Risk Visualization
Trade Plan Summary
Bottom Nav
```

## Mode Toggle

```txt
Position Size | Risk Analysis
```

## Live Result Card

Show:

- position size
- risk amount
- R:R
- potential profit
- potential loss

## Risk Visualization

Show horizontal risk path:

```txt
SL ââ Entry ââ TP
```

Colors:

- SL = red
- Entry = blue
- TP = green

## Rules

- Inputs should be large and comfortable.
- Calculator should update live.
- Main result should be sticky or visible quickly.
- Stop loss input must visually warn if invalid.

---

## 11. Motion System

Motion should feel smooth, expensive, and calm.

### Durations

```css
:root {
  --motion-fast: 120ms;
  --motion-base: 220ms;
  --motion-slow: 360ms;
}
```

### Easing

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### Recommended Animations

| Component | Animation |
|---|---|
| Tab switch | fade + slide 8px |
| Card load | staggered fade up |
| Chart load | line draw |
| Progress ring | animated stroke |
| Bottom nav active | spring pill |
| Modal | scale + fade |
| Filters | horizontal slide |

### Avoid

- bouncy childish animations
- spinning loaders everywhere
- huge glow pulses
- distracting chart motion

---

## 12. Interaction Patterns

### 12.1 Pull to Refresh

Use on:

- Home
- Journal
- Reports
- Prop Firm

### 12.2 Long Press

Use for quick actions:

- edit trade
- duplicate trade
- delete trade
- pin strategy
- export module

### 12.3 Bottom Sheets

Use for:

- filters
- advanced settings
- trade editing
- confirmation dialogs
- AI explanation detail

### 12.4 Command Center

Global command panel should support:

- search trades
- ask AI
- jump to report
- add trade
- calculate lot size
- export PDF

---

## 13. Empty States

Empty states must be useful, not decorative.

### Journal Empty

```txt
No trades logged yet.
Add your first trade to start building your performance history.
[Add Trade]
```

### AI Empty

```txt
AI needs trade history.
Log at least 20 trades to unlock pattern detection.
```

### Reports Empty

```txt
Reports unlock after your first 10 trades.
```

### Prop Firm Empty

```txt
No challenge connected.
Create a challenge to track profit targets and drawdown limits.
```

---

## 14. Loading States

Use skeletons.

### Skeleton Rules

- Same shape as final content.
- Muted shimmer.
- No full-screen loader unless first app load.
- Header should appear immediately.

---

## 15. Error States

Errors should be direct and helpful.

### Example

```txt
Couldnât sync trades.
Your local data is safe. Try again when your connection is stable.
[Retry]
```

Use:

- red only for actual problems
- amber for warnings
- neutral for offline states

---

## 16. Accessibility

### Contrast

- Primary text must pass WCAG AA.
- Muted text should still be readable.
- Avoid low-opacity gray on dark background for critical info.

### Touch Targets

Minimum:

```txt
44px x 44px
```

### Motion

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Independence

Do not rely only on color.

Use:

- icons
- labels
- text
- badges

Example:

```txt
-$450 Loss
```

Not just red number.

---

## 17. Responsive Rules

### Mobile First

Primary target width:

```txt
375pxâ430px
```

### Tablet

Use two-column layouts:

- left: navigation/sidebar
- right: content
- charts can expand

### Desktop

Use dashboard layout:

- left sidebar navigation
- top command bar
- 3-column analytics grid
- journal split view

---

## 18. Implementation Tokens

Use tokens instead of hardcoded values.

### Example Token File

```ts
export const tokens = {
  colors: {
    bg: {
      primary: "#050812",
      secondary: "#080D18",
      elevated: "#10182A",
      card: "#141D33",
      input: "#0B111C",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#B6C2D9",
      muted: "#7D8AA5",
    },
    semantic: {
      success: "#2DD4A3",
      analytics: "#4A9DFF",
      ai: "#8B5CF6",
      warning: "#F6B73C",
      danger: "#EF5F5F",
    },
    border: {
      subtle: "rgba(126, 146, 185, 0.16)",
      strong: "rgba(126, 146, 185, 0.28)",
    },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
  },
};
```

---

## 19. Tailwind Setup

### Theme Extension

```ts
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#050812",
          secondary: "#080D18",
          elevated: "#10182A",
          card: "#141D33",
          input: "#0B111C",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#B6C2D9",
          muted: "#7D8AA5",
        },
        success: "#2DD4A3",
        analytics: "#4A9DFF",
        ai: "#8B5CF6",
        warning: "#F6B73C",
        danger: "#EF5F5F",
      },
      borderRadius: {
        card: "22px",
        button: "14px",
        nav: "24px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
        glow: "0 16px 40px rgba(45,212,163,0.12)",
      },
      fontFamily: {
        sans: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
```

---

## 20. Component Naming

Recommended component names:

```txt
AppShell
PageHeader
BottomNav
HeroMetricCard
MetricCard
ChartCard
TradeCard
InsightCard
RiskCard
ProgressRing
ProgressBar
FilterChip
SegmentedControl
ActionButton
IconButton
InputField
SelectField
BottomSheet
CommandCenter
```

---

## 21. Suggested File Structure

```txt
src/
  app/
    layout.tsx
    page.tsx

  components/
    shell/
      AppShell.tsx
      PageHeader.tsx
      BottomNav.tsx

    cards/
      HeroMetricCard.tsx
      MetricCard.tsx
      ChartCard.tsx
      TradeCard.tsx
      InsightCard.tsx
      RiskCard.tsx

    controls/
      Button.tsx
      IconButton.tsx
      FilterChip.tsx
      SegmentedControl.tsx
      InputField.tsx
      SelectField.tsx

    charts/
      EquityCurve.tsx
      WinLossDonut.tsx
      SessionBars.tsx
      RiskPath.tsx

    feedback/
      EmptyState.tsx
      Skeleton.tsx
      Toast.tsx

  features/
    home/
      HomeScreen.tsx

    journal/
      JournalScreen.tsx
      TradeDetailSheet.tsx
      TradeFiltersSheet.tsx

    ai/
      AIPlaybookScreen.tsx
      AskAICard.tsx
      InsightList.tsx

    prop/
      PropFirmScreen.tsx
      ChallengeProgress.tsx

    reports/
      ReportsScreen.tsx

    calculator/
      RiskCalculatorScreen.tsx

  lib/
    tokens.ts
    formatters.ts
    calculations.ts

  styles/
    globals.css
```

---

## 22. Data Formatting Rules

### Money

```txt
+$25,334.88
-$450.00
```

### Percentage

```txt
62.5%
8.22%
```

### R:R

```txt
1:2.12
+0.69R
```

### Lots

```txt
0.45 Lots
```

### Dates

```txt
May 10, 2026
2:15 PM
```

### Rules

- Positive values include plus sign.
- Negative values include minus sign.
- Use commas for large numbers.
- Do not mix `P&L`, `PnL`, and `Profit` inconsistently. Prefer `P&L`.

---

## 23. Icon Rules

Use one consistent icon set.

Recommended:

- Lucide Icons
- Phosphor Icons
- Tabler Icons

Do not mix multiple icon libraries unless visually matched.

### Icon Sizes

| Use | Size |
|---|---:|
| Bottom Nav | 22â24px |
| Header Buttons | 20â22px |
| Card Icons | 18â22px |
| Small Labels | 14â16px |

### Icon Tone

Icons should be muted by default and semantic only when meaningful.

---

## 24. Tab-Specific Navigation Icons

| Tab | Icon Concept |
|---|---|
| Home | Grid/Home |
| Journal | Book |
| AI | Brain/Spark |
| Prop | Target/Shield |
| Reports | Bar Chart |
| Calc | Calculator |

---

## 25. Quality Checklist

Before shipping any screen, verify:

- There is one clear hero module.
- The top metric is visible in 3 seconds.
- The screen is readable at 375px width.
- No more than 2 primary actions are visible.
- Cards are not all the same size.
- Text hierarchy is obvious.
- Semantic colors are used correctly.
- Bottom nav does not cover content.
- Charts are not overloaded.
- Empty and loading states exist.
- Touch targets are at least 44px.
- The design works without relying only on color.
- Long text truncates gracefully.
- The app still looks premium with real messy data.

---

## 26. Final Design Direction Summary

The app should become a premium dark fintech trading operating system.

The final experience should feel:

```txt
Less dashboard.
More intelligence layer.

Less clutter.
More hierarchy.

Less generic card grid.
More purpose-built modules.

Less decoration.
More useful data visualization.
```

The product should feel like something a serious trader opens every day to understand:

- what happened
- what is working
- what is dangerous
- what to improve
- how to trade safely next
