# TradeX — Full Audit, Bot System Plan, Dashboard Fixes, and Agent Implementation Brief

**Project:** TradeX / Tradex  
**Owner:** Rudra Patel / `ruddvz`  
**Repository audited:** `https://github.com/ruddvz/Tradex`  
**Audit date:** 2026-06-04  
**Primary goal:** Turn TradeX from a trading journal + analytics product into a safe, paper-first trading operating system with a professional dashboard, real data wiring, risk controls, and a staged path toward automation.

---

## 0. Important Reality Check

TradeX should **not** be positioned as a “money-printing AI bot.” That is not how real trading systems work.

The realistic product should be:

> **A professional trading operating system that helps a trader journal, analyze, paper trade, test strategies, manage risk, and eventually automate only after safeguards prove the system is stable.**

The dashboard is the cockpit. The money, if any, comes from a tested strategy, disciplined risk, proper execution, enough sample size, and avoiding emotional/manual mistakes.

**Do not enable real-money live execution until every paper-trading, backtesting, risk, audit, and kill-switch requirement in this document is complete.**

---

## 1. Current Repository State From Public Audit

The public repository describes TradeX as an **AI-powered trading journal platform** for Forex, Gold/XAUUSD, indices, and stocks. The README lists a React + TypeScript + Vite frontend, FastAPI backend, PostgreSQL, Redis, Celery, OpenAI-powered insights, MT5 syncing, and Docker Compose support.

### 1.1 Stack already documented

**Frontend**

- React 18
- TypeScript
- Vite
- TailwindCSS 3
- Recharts
- React Router
- Zustand
- Lucide React
- date-fns
- framer-motion

**Backend**

- FastAPI
- Python 3.12
- SQLAlchemy 2
- PostgreSQL
- Redis
- Alembic
- Pydantic v2
- OpenAI API
- MetaTrader5 Python package
- Pandas / NumPy
- Celery

**Infrastructure**

- Docker Compose
- Nginx
- GitHub Actions

### 1.2 Current core feature areas

The README and planning files show the following feature areas:

- Dashboard
- Trade Journal
- AI Playbooks
- Prop Firm Mode
- Trading Notebook
- Reports
- Risk Calculator
- Settings
- MT5 sync
- Screenshots per trade
- JWT auth
- PostgreSQL persistence
- Daily email reports
- PWA/mobile shell
- Setup health checks
- Action Center/manual tasks
- Paper trading MVP foundations

### 1.3 Current known gap

The planning files explicitly mention that:

- Journal is closer to live/authenticated data.
- Dashboard and several broader pages still depend on `mockData.ts` or partial local/demo state.
- Paper trading MVP exists at the account/page level, but paper order/fill simulation is the next serious milestone.

This means the product is **not yet a complete trading bot**. It is currently best understood as:

> **Trading journal + analytics + setup/paper-trading foundation.**

---

## 2. What Other Serious Trading Bot Systems Usually Have

Based on a review of mature/open-source trading bot ecosystems and public community discussions, serious systems usually include these pillars:

### 2.1 Mature references to learn from

#### Freqtrade

Freqtrade is a major open-source crypto trading bot. It supports exchange integrations, strategy development, backtesting, plotting, money management, and web/Telegram control.

**What TradeX should copy conceptually:**

- Strategy lifecycle: draft → backtest → optimize → paper → live.
- Clear separation between strategy code and execution engine.
- Backtesting reports.
- Risk controls.
- Dry-run/paper mode before live trading.

#### OctoBot

OctoBot emphasizes live trading, backtesting, risk-free paper trading, and strategy automation.

**What TradeX should copy conceptually:**

- Built-in paper trading as a first-class mode.
- Backtest before live.
- Strategy simulation with portfolio impact.
- Separate “bot engine” from “dashboard UI.”

#### OpenAlgo

OpenAlgo is especially relevant if TradeX ever becomes India-market oriented. It positions itself as a self-hosted algo trading platform/broker bridge and supports multiple Indian brokers.

**What TradeX should copy conceptually:**

- Self-hosted architecture.
- Broker abstraction layer.
- Explicit broker integrations instead of one-off hard-coded logic.
- Strategy execution APIs.

#### hftbacktest / serious backtesting tools

Advanced backtesting tools model order book conditions, queue position, latency, and fills.

**What TradeX should copy conceptually, simplified:**

- Never trust candle-only backtests too much.
- Simulate spread, slippage, commissions, rejected orders, and delayed fills.
- Track whether the strategy still works after realistic execution costs.

---

## 3. Reddit / Community Lessons To Bake Into TradeX

Community discussions around trading bots consistently show the same mistakes:

### 3.1 Paper trading is not live trading

Paper trading often ignores:

- Bad fills
- Spread widening
- Slippage
- Broker rejections
- Partial fills
- Latency
- Liquidity limits
- Overnight/session rules
- Market gaps

TradeX must show this warning directly in the UI.

### 3.2 Risk management matters more than the dashboard

Common failures:

- Bot keeps trading after losing streak.
- Bot doubles down after losses.
- Bot opens too many correlated positions.
- Bot trades during flash crashes/news spikes.
- Bot ignores max daily loss.
- Bot executes orders the broker would reject.

### 3.3 Small-account trading has execution problems

For small accounts, bid/ask spread, fees, swaps, commissions, and minimum lot sizes can erase a strategy’s edge. TradeX needs spread/slippage simulation before calling any setup profitable.

### 3.4 Most beginner bots are overcomplicated

The fastest path is not AI magic. The fastest path is:

1. Track real trades accurately.
2. Find repeatable patterns.
3. Backtest one simple strategy.
4. Paper trade it with strict risk controls.
5. Compare paper results with backtest.
6. Only then consider live automation.

---

## 4. Product Positioning Recommendation

Do **not** make TradeX “an AI bot that trades for you.”

Position it as:

> **TradeX is a paper-first trading operating system for serious traders: journal, analyze, test, simulate, and only automate with strict risk controls.**

### 4.1 Core product modes

TradeX should have very clear global modes:

1. **Demo Mode**  
   Uses fake data only. No user should mistake this for real performance.

2. **Live Journal Mode**  
   Real imported trades from MT5 or manual entries. No auto-execution.

3. **Paper Mode**  
   Simulated orders, fills, positions, and strategy execution.

4. **Backtest Mode**  
   Historical strategy testing.

5. **Live Execution Mode**  
   Disabled by default. Hidden behind safety checklist, explicit confirmations, and multiple warnings.

### 4.2 Every screen must show mode

The header should always show one of:

- `DEMO DATA`
- `LIVE JOURNAL`
- `PAPER MODE`
- `BACKTEST`
- `LIVE DISABLED`
- `LIVE ENABLED — HIGH RISK`

This should be visible on desktop and mobile.

---

## 5. Biggest Architecture Fix: Separate Journal, Paper, Backtest, and Live Execution

Right now, TradeX is strongest as a journal. The next architecture step is to make four separate domains.

### 5.1 Domain separation

#### A. Journal Domain

Stores completed historical trades.

Examples:

- MT5 imported trades
- Manual trades
- Paper-trading completed trades
- Screenshots
- Notes
- Tags
- Emotions
- Mistakes
- Grade

#### B. Paper Trading Domain

Stores simulated real-time trading activity.

Examples:

- Paper accounts
- Paper orders
- Paper positions
- Paper fills
- Paper balances
- Paper equity curve
- Paper strategy runs

#### C. Backtesting Domain

Stores historical strategy tests.

Examples:

- Strategy config
- Dataset used
- Date range
- Assumptions
- Spread/slippage/commission assumptions
- Results
- Trades generated by the backtest
- Equity curve
- Drawdown curve

#### D. Live Execution Domain

Should remain disabled until later.

Examples:

- Broker account
- Live order requests
- Broker confirmations
- Position sync
- Emergency stop
- Risk engine approval logs

### 5.2 Do not mix these tables casually

A paper trade can be exported into the journal, but it should retain `source = paper`.

A backtest trade can be viewed in reports, but it should retain `source = backtest`.

A live imported MT5 trade should retain `source = mt5`.

This prevents false performance stats.

---

## 6. Database Model Improvements

The agent should add/verify these models.

### 6.1 TradingAccount

Purpose: Represent user-connected trading accounts.

Fields:

```txt
id
user_id
name
broker
platform: mt5 | mt4 | manual | paper | future_broker
account_type: demo | real | prop | paper
base_currency
balance
equity
is_active
is_live_execution_enabled default false
created_at
updated_at
```

### 6.2 Trade

Current model likely already exists. Ensure it supports:

```txt
id
user_id
account_id
source: manual | mt5 | paper | backtest | live
external_id / mt5_ticket
symbol
direction: long | short
open_time
close_time
entry_price
exit_price
stop_loss
take_profit
volume / lot_size
pnl
pnl_currency
fees
swap
commission
rr
risk_amount
risk_percent
status: win | loss | breakeven | open | cancelled
strategy
session
emotion
grade
tags
notes
screenshot_before_url
screenshot_after_url
created_at
updated_at
```

### 6.3 PaperAccount

```txt
id
user_id
name
starting_balance
balance
equity
margin_used
currency
risk_profile_id
is_active
created_at
updated_at
```

### 6.4 PaperOrder

```txt
id
user_id
paper_account_id
strategy_run_id nullable
symbol
side: buy | sell
type: market | limit | stop | stop_limit
status: pending | accepted | rejected | partially_filled | filled | cancelled | expired
requested_price
filled_avg_price
quantity / lot_size
stop_loss
take_profit
risk_amount
risk_percent
rejection_reason
created_at
submitted_at
filled_at
cancelled_at
```

### 6.5 PaperPosition

```txt
id
user_id
paper_account_id
symbol
side
quantity / lot_size
avg_entry_price
current_price
unrealized_pnl
realized_pnl
stop_loss
take_profit
opened_at
closed_at
status: open | closed
```

### 6.6 PaperFill

```txt
id
user_id
paper_order_id
paper_position_id
symbol
side
quantity
price
slippage
spread
commission
filled_at
```

### 6.7 Strategy

```txt
id
user_id
name
description
market_type: forex | crypto | stocks | indices | gold | mixed
timeframe
rules_json
risk_profile_id
status: draft | testing | paper | paused | retired
created_at
updated_at
```

### 6.8 StrategyRun

```txt
id
user_id
strategy_id
mode: backtest | paper | live
account_id
status: running | paused | stopped | failed | completed
started_at
stopped_at
config_snapshot_json
result_summary_json
```

### 6.9 RiskProfile

```txt
id
user_id
name
max_risk_per_trade_percent
max_daily_loss_percent
max_weekly_loss_percent
max_total_drawdown_percent
max_open_positions
max_positions_per_symbol
max_correlated_positions
allowed_symbols
blocked_symbols
allowed_sessions
block_news_window_minutes
min_rr
max_spread_points
max_slippage_points
cooldown_after_loss_minutes
max_consecutive_losses
created_at
updated_at
```

### 6.10 RiskEvent / AuditLog

Every blocked or approved trade must be logged.

```txt
id
user_id
entity_type
entity_id
event_type
severity: info | warning | danger | critical
message
metadata_json
created_at
```

Examples:

- `ORDER_BLOCKED_DAILY_LOSS_LIMIT`
- `ORDER_BLOCKED_SPREAD_TOO_WIDE`
- `ORDER_APPROVED_RISK_OK`
- `BOT_PAUSED_MAX_CONSECUTIVE_LOSSES`
- `KILL_SWITCH_TRIGGERED`

---

## 7. Backend API Plan

Use `/api/v1/*` and Bearer auth.

### 7.1 Setup / Health

```http
GET /api/v1/setup/health
```

Should return:

```json
{
  "db": "ok",
  "redis": "ok",
  "secret_key": "weak|ok",
  "openai": "missing|configured",
  "mt5_credentials": "missing|configured",
  "paper_accounts": 1,
  "live_execution_enabled": false,
  "warnings": []
}
```

### 7.2 Trading Accounts

```http
GET /api/v1/accounts
POST /api/v1/accounts
PATCH /api/v1/accounts/{id}
DELETE /api/v1/accounts/{id}
```

### 7.3 Journal Trades

```http
GET /api/v1/trades?account_id=&source=&symbol=&status=&from=&to=
POST /api/v1/trades
GET /api/v1/trades/{id}
PATCH /api/v1/trades/{id}
DELETE /api/v1/trades/{id}
POST /api/v1/trades/{id}/screenshot?slot=before|after
```

### 7.4 Analytics

```http
GET /api/v1/analytics/metrics?account_id=&source=&from=&to=
GET /api/v1/analytics/equity-curve?account_id=&source=&from=&to=
GET /api/v1/analytics/calendar?account_id=&source=&from=&to=
GET /api/v1/analytics/symbols?account_id=&source=&from=&to=
GET /api/v1/analytics/sessions?account_id=&source=&from=&to=
GET /api/v1/analytics/psychology?account_id=&source=&from=&to=
GET /api/v1/analytics/strategies?account_id=&source=&from=&to=
```

### 7.5 Paper Trading

```http
GET /api/v1/paper-accounts
POST /api/v1/paper-accounts
PATCH /api/v1/paper-accounts/{id}

GET /api/v1/paper/orders
POST /api/v1/paper/orders
PATCH /api/v1/paper/orders/{id}/cancel

GET /api/v1/paper/positions
POST /api/v1/paper/positions/{id}/close

GET /api/v1/paper/fills
GET /api/v1/paper/equity-curve
```

### 7.6 Strategy

```http
GET /api/v1/strategies
POST /api/v1/strategies
GET /api/v1/strategies/{id}
PATCH /api/v1/strategies/{id}
DELETE /api/v1/strategies/{id}
POST /api/v1/strategies/{id}/validate
```

### 7.7 Strategy Runs

```http
GET /api/v1/strategy-runs
POST /api/v1/strategy-runs
PATCH /api/v1/strategy-runs/{id}/pause
PATCH /api/v1/strategy-runs/{id}/resume
PATCH /api/v1/strategy-runs/{id}/stop
GET /api/v1/strategy-runs/{id}/events
```

### 7.8 Backtesting

```http
POST /api/v1/backtests
GET /api/v1/backtests
GET /api/v1/backtests/{id}
GET /api/v1/backtests/{id}/trades
GET /api/v1/backtests/{id}/equity-curve
DELETE /api/v1/backtests/{id}
```

### 7.9 Risk Engine

```http
GET /api/v1/risk-profiles
POST /api/v1/risk-profiles
PATCH /api/v1/risk-profiles/{id}
POST /api/v1/risk/evaluate-order
GET /api/v1/risk/events
```

### 7.10 Emergency Controls

```http
POST /api/v1/bot/kill-switch
POST /api/v1/bot/pause-all
POST /api/v1/bot/resume-paper-only
GET /api/v1/bot/status
```

**Live resume should not exist until much later.**

---

## 8. Paper Trading Engine — Required Before Any Live Bot

This is the most important next product milestone.

### 8.1 Paper order lifecycle

Implement this lifecycle:

1. User/strategy creates paper order.
2. Risk engine evaluates order.
3. If risk fails, reject and log event.
4. If risk passes, order becomes `accepted`.
5. Fill simulator checks market price.
6. Fill simulator applies spread/slippage/commission.
7. Position opens or updates.
8. Stop loss / take profit / manual close can close position.
9. Completed position creates journal trade with `source = paper`.
10. Dashboard updates equity curve and stats.

### 8.2 Fill simulator requirements

Paper trading must not use perfect fills.

Simulate:

- Spread
- Slippage
- Commission
- Market closed conditions
- Rejected orders
- Partial fills later if needed
- Minimum lot size
- Price precision/tick size
- Max allowed leverage/margin later if needed

### 8.3 MVP paper trading assumptions

For the first build:

- Use candle close or latest known price.
- Use fixed configurable spread by symbol.
- Use fixed slippage by symbol.
- Use fixed commission per lot or per trade.
- No real live quotes required initially.
- Use mock/live historical candles from local seed data or API later.

### 8.4 Paper trading UI screens

Add/finish these screens:

1. **Paper Trading Overview**
2. **Paper Orders**
3. **Open Positions**
4. **Paper Equity Curve**
5. **Paper Risk Events**
6. **Strategy Runs**

---

## 9. Backtesting Engine Plan

Backtesting must come before live automation.

### 9.1 Backtest MVP

Initial version can be simple:

- Use OHLC candles.
- Strategy rules stored in JSON.
- Simulate entries/exits.
- Apply spread, slippage, commission.
- Track equity curve.
- Track drawdown.
- Generate trade list.
- Save result snapshot.

### 9.2 Backtest result metrics

Every backtest should show:

- Net P&L
- Return %
- Max drawdown
- Profit factor
- Win rate
- Average win
- Average loss
- Expectancy
- Sharpe or simplified risk-adjusted score
- Number of trades
- Longest losing streak
- Best/worst day
- Best/worst symbol
- Exposure time
- Average holding time
- Max adverse excursion later
- Max favorable excursion later

### 9.3 Backtest trust warnings

Show these warnings on the result page:

- “Backtests are estimates, not guarantees.”
- “Live fills can be worse than simulated fills.”
- “Spread, slippage, commissions, and execution delays can change results.”
- “Do not enable live trading from a backtest alone.”

### 9.4 Backtest-to-paper promotion

A strategy can move from backtest to paper only if:

- Minimum number of trades reached.
- Max drawdown under configured limit.
- Profit factor above configured threshold.
- No unrealistic assumptions.
- Slippage/spread assumptions are configured.

---

## 10. Risk Engine — Non-Negotiable

The risk engine must sit between every strategy/order and the broker/paper simulator.

### 10.1 Hard risk blocks

Block order if:

- Risk per trade exceeds user max.
- Daily loss limit reached.
- Weekly loss limit reached.
- Max drawdown reached.
- Max open positions reached.
- Same symbol exposure too high.
- Correlated exposure too high.
- Spread is too wide.
- Slippage estimate too high.
- Stop loss missing.
- Take profit missing when required.
- R:R below minimum.
- News window block is active.
- Market is closed.
- Account mode mismatch.
- Live execution disabled.

### 10.2 Soft risk warnings

Warn if:

- User is on losing streak.
- Strategy underperformed recently.
- Position size is much larger than average.
- Trade is outside normal session.
- Trade conflicts with notebook rule.
- Emotion tag from manual input is bad, e.g. FOMO/revenge.

### 10.3 Kill switch

Add a visible kill switch in the UI.

Kill switch should:

- Pause all strategy runs.
- Cancel pending paper/live orders where possible.
- Prevent new orders.
- Log critical audit event.
- Require explicit manual reset.

---

## 11. Dashboard Redesign and UX Requirements

The dashboard should feel like a professional trading cockpit, not a random stats page.

### 11.1 Dashboard hierarchy

Top to bottom:

1. **Mode + account selector**
2. **Health/risk status strip**
3. **Main performance hero**
4. **Equity curve**
5. **Today/Week/Month stats**
6. **Paper/live strategy status**
7. **Open positions / active orders**
8. **Risk events**
9. **Recent trades**
10. **AI insights / coaching**

### 11.2 Top header requirements

Desktop and mobile header must show:

- TradeX logo/name
- Current account selector
- Global mode badge
- Sync status
- Setup health status
- Kill switch/pause button
- Settings/profile entry

### 11.3 Hero metric cards

Show these first:

- Net P&L
- Equity
- Drawdown
- Win rate
- Profit factor
- Expectancy

Each card must show:

- Value
- Change over selected range
- Tiny trend/sparkline if useful
- Data source badge: demo/live/paper/backtest

### 11.4 Dashboard tabs

Add dashboard tabs:

- Overview
- Journal
- Paper
- Backtests
- Risk
- AI Coach

Alternative: keep pages separate, but the dashboard should expose summary cards for each.

### 11.5 Date range filter

Add persistent range selector:

- Today
- 7D
- 30D
- 90D
- All
- Custom

All metrics and charts should update based on this.

### 11.6 Account/source filters

Add filters:

- Account
- Source: all / manual / MT5 / paper / backtest
- Symbol
- Strategy

### 11.7 Empty states

Do not show fake-looking empty dashboards.

Use guided empty states:

#### No trades

Title: `No trades yet`  
Body: `Import from MT5, add a manual trade, or start a paper account.`  
Actions:

- Sync MT5
- Add trade
- Create paper account

#### No paper account

Title: `Paper mode not configured`  
Body: `Create a paper account to test strategies without risking real money.`  
Action: `Create paper account`

#### No setup health

Title: `Setup check needed`  
Action: `Open Action Center`

### 11.8 UI design direction

Keep the dark premium system but make it cleaner:

- Background: near-black blue, not pure black.
- Cards: subtle glass/solid hybrid.
- Primary: emerald green.
- Danger: clear red.
- Warning: amber.
- Info: blue/purple.
- Avoid too much neon.
- Reduce chart clutter.
- Use one icon family.
- Keep mobile bottom nav polished.

### 11.9 Mobile UX requirements

Mobile is critical.

- Bottom nav should never overlap content.
- Safe area padding for iPhone.
- Header should be compact.
- KPI cards should become horizontal scroll or 2-column grid.
- Charts should have tap tooltips.
- Tables should become cards.
- Kill switch must remain accessible.
- Sync/action buttons should not crowd the header.

### 11.10 Dashboard bugs to check/fix

Agent must check:

- Are all dashboard charts using live API when authenticated?
- Does demo mode clearly label mock data?
- Does date range actually change all metrics?
- Are loading states present?
- Are API errors shown properly?
- Does token expiry redirect/reset cleanly?
- Does mobile nav active state work?
- Do charts render correctly in PWA standalone mode?
- Does offline mode show cached/demo warning?
- Does dashboard update after MT5 sync?
- Does dashboard update after paper trade closes?

---

## 12. Page-by-Page Improvements

### 12.1 Dashboard

Priority fixes:

- Wire fully to backend analytics.
- Add account/source/date filters.
- Add setup health strip.
- Add paper/live/demo mode badge.
- Add open positions/paper orders preview.
- Add risk status card.
- Add real empty states.

### 12.2 Journal

Priority fixes:

- Keep live API wiring.
- Improve trade drawer with sections:
  - Execution
  - Risk
  - Psychology
  - Screenshots
  - Notes
  - AI review
- Add bulk import status.
- Add duplicate detection.
- Add source badges.
- Add “convert paper fill to journal trade” flow.

### 12.3 Playbooks / AI Insights

Priority fixes:

- Do not pretend AI found reliable patterns from tiny samples.
- Show confidence score.
- Show sample size.
- Show “not enough data” state.
- Group by strategy from live trades.
- Add user-created playbooks later.

### 12.4 Prop Firm

Priority fixes:

- Support multiple challenges/accounts.
- Track daily loss based on account rules.
- Track equity-based vs balance-based drawdown.
- Show “challenge failed risk” warnings.
- Add prop firm template presets.

### 12.5 Reports

Priority fixes:

- Remove mock dependency.
- Add export PDF only after data is real.
- Add source/account/date filters.
- Add strategy report.
- Add paper vs live comparison.

### 12.6 Risk Calculator

Priority fixes:

- Use saved account balance/equity.
- Use symbol metadata: pip size, tick value, lot constraints.
- Add warning if stop loss is too tight.
- Add reward-to-risk validation.
- Add “send to paper order” button.

### 12.7 Settings

Priority fixes:

- Make MT5 credentials status clear.
- Add account management.
- Add risk profile management.
- Add notification preferences.
- Add data export/delete.
- Hide live execution settings until the system is ready.

### 12.8 Action Center

Priority fixes:

- Turn it into “Setup Checklist + Safety Center.”
- Show health checks:
  - DB
  - Redis
  - OpenAI key
  - MT5 credentials
  - Paper account
  - Risk profile
  - PWA install
  - Daily email config
- Each issue should have a CTA.

---

## 13. AI Features — Safe and Useful Version

AI should not directly place trades.

### 13.1 Good AI features

- Summarize trade journal patterns.
- Detect emotional mistakes.
- Generate weekly review.
- Explain risk issues.
- Suggest checklist improvements.
- Identify sample-size weakness.
- Convert user trading rules into structured strategy draft.
- Compare backtest vs paper results.

### 13.2 Bad AI features to avoid for now

- “Buy now” / “Sell now” recommendations.
- Live automated execution from LLM output.
- Unverified AI strategy generation directly connected to orders.
- Overconfident predictions.

### 13.3 AI insight format

Every AI insight should include:

```txt
Insight type: pattern | risk | psychology | warning | opportunity
Confidence: low | medium | high
Sample size: number of trades used
Data source: manual | mt5 | paper | backtest | mixed
Explanation
Suggested action
```

### 13.4 AI guardrails

If sample size is low:

> “Not enough trades to draw a reliable conclusion yet.”

If data is demo:

> “This is demo data and should not be treated as your performance.”

---

## 14. Security Fixes

Trading systems handle sensitive credentials and potentially money. Security must be upgraded before serious use.

### 14.1 Secrets

- Never commit `.env`.
- Reject weak/default `SECRET_KEY` in production.
- Use environment-specific config.
- Rotate keys if exposed.
- Encrypt broker credentials at rest.
- Never return decrypted credentials to frontend.

### 14.2 Auth

- JWT expiry and refresh handling.
- Password hashing with modern algorithm.
- Rate limit login/register.
- Add forgot password later.
- Add optional 2FA later.

### 14.3 API safety

- Validate every order request.
- Use Pydantic schemas for all write endpoints.
- Use user scoping on every DB query.
- Add audit logs.
- Add idempotency keys for order creation.

### 14.4 CORS

- Production CORS must not be wildcard.
- Only allow known frontend domains.

### 14.5 File uploads

- Validate screenshot file type.
- Limit file size.
- Store outside public root or use signed routes later.
- Prevent path traversal.

---

## 15. Testing Plan

The repo planning indicates many builds passed, but formal tests are limited or missing. Add tests before expanding automation.

### 15.1 Backend unit tests

Add tests for:

- Auth register/login
- Trade CRUD
- User scoping
- Analytics calculations
- MT5 sync fallback/guard
- Paper account creation
- Paper order creation
- Risk engine blocks
- Kill switch
- Daily report endpoint

### 15.2 Backend integration tests

Add tests using test DB:

- Create user → create paper account → create order → fill → position → close → journal trade.
- Import MT5-like trade → analytics update.
- Risk profile blocks order.
- Demo fallback disabled in production.

### 15.3 Frontend tests

Add tests for:

- Dashboard loads live data when token exists.
- Demo banner appears without token/demo state.
- MT5 sync success refreshes store.
- Paper account page creates account.
- Mobile nav active state.
- Error states.

### 15.4 E2E tests

Use Playwright.

Flows:

1. Register/login.
2. Create paper account.
3. Add paper order.
4. View order/fill/position.
5. Close position.
6. See trade in journal.
7. Dashboard updates.
8. Kill switch blocks new order.

---

## 16. Observability and Logs

Add structured logs for:

- Auth events
- MT5 sync attempts
- Import counts
- Duplicate skip counts
- Paper order submissions
- Risk checks
- Rejections
- Strategy run start/stop
- Kill switch
- AI insight generation
- Email report sending

Add dashboard/admin debugging view later:

- Last sync time
- Last error
- API status
- Worker status
- Celery beat status
- Queue length

---

## 17. Deployment Recommendations

### 17.1 Local development

Keep:

```bash
cd frontend && npm install && npm run dev
```

And:

```bash
docker-compose up -d
```

### 17.2 Production direction

Suggested simple production stack:

- Frontend: Vercel/Netlify/Cloudflare Pages or Nginx container.
- Backend: Railway/Fly.io/Render/VPS.
- Database: managed PostgreSQL.
- Redis: managed Redis or container.
- Worker: separate Celery worker process.
- Secrets: platform secret manager.

### 17.3 Do not rely on GitHub Pages for real backend app

GitHub Pages is fine for static demo/PWA preview. It is not enough for authenticated real trading workflows.

---

## 18. Implementation Roadmap for Agent

### Phase A — Repo Stabilization and Truth Labels

**Goal:** Make the current app honest and stable.

Tasks:

- [ ] Run frontend lint/build.
- [ ] Run backend import/compile checks.
- [ ] Add `.env.example` verification.
- [ ] Ensure demo mode is clearly labeled everywhere.
- [ ] Ensure authenticated/live mode does not silently use mock data.
- [ ] Add global `DataSourceBadge` component.
- [ ] Add global `ModeBadge` component.
- [ ] Add `ApiErrorState`, `EmptyState`, and `LoadingState` components.
- [ ] Update dashboard to show real empty states.

Acceptance:

- User can instantly tell whether data is demo, live journal, paper, or backtest.
- No page silently mixes demo and real data without a visible badge.

### Phase B — Full Live Data Wiring

**Goal:** Stop relying on `mockData.ts` except in explicit demo mode.

Tasks:

- [ ] Create canonical frontend API client.
- [ ] Create query/store layer for authenticated data.
- [ ] Wire Dashboard to backend analytics.
- [ ] Wire Reports to backend analytics.
- [ ] Wire Prop Firm to backend challenge API.
- [ ] Wire Playbooks to journal-derived strategy groups.
- [ ] Add refresh after MT5 sync.
- [ ] Add range/account/source filters.

Acceptance:

- After login, dashboard uses real API data.
- After MT5 sync, dashboard and journal update.
- Demo mode remains available but clearly separate.

### Phase C — Paper Trading MVP 2

**Goal:** Make paper trading actually simulate orders/fills/positions.

Tasks:

- [ ] Add `PaperOrder`, `PaperPosition`, `PaperFill` models.
- [ ] Add paper order APIs.
- [ ] Add risk evaluation before paper order acceptance.
- [ ] Add simple fill simulator.
- [ ] Add close position API.
- [ ] On close, create `Trade` with `source=paper`.
- [ ] Add Paper Trading page: Overview, Orders, Positions, Fills.
- [ ] Add paper equity curve.

Acceptance:

- User can create paper account.
- User can create a paper order.
- System fills or rejects order.
- Open position appears.
- Closing position creates journal trade.
- Dashboard updates with paper performance.

### Phase D — Risk Engine

**Goal:** Make risk controls central.

Tasks:

- [ ] Add `RiskProfile` model.
- [ ] Add default conservative risk profile.
- [ ] Add risk evaluation service.
- [ ] Add risk event/audit model.
- [ ] Block orders exceeding risk.
- [ ] Add kill switch.
- [ ] Add UI for risk status/events.

Acceptance:

- Risk profile can block paper orders.
- Every block/approval is logged.
- Kill switch stops new paper orders.

### Phase E — Backtesting MVP

**Goal:** Test strategies before paper.

Tasks:

- [ ] Add `Strategy` model.
- [ ] Add `Backtest` model.
- [ ] Add candle dataset format.
- [ ] Add simple rule-engine strategy runner.
- [ ] Simulate spread/slippage/commission.
- [ ] Save trades/equity/results.
- [ ] Build Backtests page.

Acceptance:

- User can create a simple strategy.
- User can run backtest on historical data.
- User can review generated trades and equity curve.
- Result shows warnings and assumptions.

### Phase F — Strategy Runner in Paper Mode

**Goal:** Let strategies run in paper mode only.

Tasks:

- [ ] Add `StrategyRun` model.
- [ ] Add start/pause/stop endpoints.
- [ ] Run strategy on schedule or manual tick.
- [ ] Route all generated orders through risk engine.
- [ ] Show strategy events in UI.

Acceptance:

- Strategy can run in paper mode.
- Strategy cannot bypass risk engine.
- Strategy can be paused/stopped.
- All actions are logged.

### Phase G — Live Execution Readiness Checklist Only

**Goal:** Prepare but do not enable live execution.

Tasks:

- [ ] Add live execution checklist page.
- [ ] Add disabled live mode explanation.
- [ ] Add broker abstraction interfaces.
- [ ] Add paper-to-live comparison report.
- [ ] Add minimum required paper sample rules.

Acceptance:

- No live orders can be placed yet.
- User sees what is missing before live is even considered.

---

## 19. Specific Agent Instructions

Before coding, agent must read:

1. `planning/CHANGELOG.md`
2. `planning/ACTIVE.md`
3. `planning/EXECUTION-PLAN.md`
4. `NEXT_STEPS.md`
5. `AGENTS.md`

Agent must follow repository workflow:

- Implement one logical slice at a time.
- Run relevant checks.
- Commit with clear message.
- Append to `planning/CHANGELOG.md`.
- Update `planning/ACTIVE.md` and `planning/EXECUTION-PLAN.md` when phase changes.
- Never commit secrets.

---

## 20. Suggested File Map for New Work

### Backend

```txt
backend/app/models/trading_account.py
backend/app/models/paper_order.py
backend/app/models/paper_position.py
backend/app/models/paper_fill.py
backend/app/models/strategy.py
backend/app/models/strategy_run.py
backend/app/models/backtest.py
backend/app/models/risk_profile.py
backend/app/models/audit_log.py

backend/app/schemas/trading_account.py
backend/app/schemas/paper.py
backend/app/schemas/strategy.py
backend/app/schemas/backtest.py
backend/app/schemas/risk.py

backend/app/services/risk_engine.py
backend/app/services/paper_execution.py
backend/app/services/fill_simulator.py
backend/app/services/backtesting.py
backend/app/services/strategy_runner.py
backend/app/services/broker_base.py
backend/app/services/market_data.py

backend/app/api/v1/accounts.py
backend/app/api/v1/paper.py
backend/app/api/v1/strategies.py
backend/app/api/v1/backtests.py
backend/app/api/v1/risk.py
backend/app/api/v1/bot.py
```

### Frontend

```txt
frontend/src/lib/api/client.ts
frontend/src/lib/api/trades.ts
frontend/src/lib/api/analytics.ts
frontend/src/lib/api/paper.ts
frontend/src/lib/api/risk.ts
frontend/src/lib/api/strategies.ts
frontend/src/lib/api/backtests.ts

frontend/src/components/status/ModeBadge.tsx
frontend/src/components/status/DataSourceBadge.tsx
frontend/src/components/status/SetupHealthStrip.tsx
frontend/src/components/status/RiskStatusCard.tsx
frontend/src/components/common/EmptyState.tsx
frontend/src/components/common/ErrorState.tsx
frontend/src/components/common/LoadingState.tsx

frontend/src/pages/PaperTrading.tsx
frontend/src/pages/Backtests.tsx
frontend/src/pages/Strategies.tsx
frontend/src/pages/RiskCenter.tsx
```

---

## 21. UX Copy To Use

### 21.1 Demo warning

```txt
Demo Data
This screen is using sample trades. Connect MT5, add trades, or create a paper account to see real performance.
```

### 21.2 Paper mode warning

```txt
Paper Mode
Orders are simulated. Results may differ from live trading because real spreads, fills, slippage, liquidity, and broker rules can change outcomes.
```

### 21.3 Live execution disabled

```txt
Live Execution Disabled
TradeX is currently configured for journal, analytics, backtesting, and paper trading only. Real-money automation requires risk controls, audit logs, tested strategy performance, and explicit manual approval.
```

### 21.4 Low sample AI warning

```txt
Not enough data yet
TradeX needs more completed trades before it can identify reliable patterns. Keep journaling or paper trading to build a larger sample.
```

### 21.5 Risk block

```txt
Order blocked by risk engine
This order violates your risk profile. Review the reason below before trying again.
```

---

## 22. Minimum “Worth Working On?” Criteria

After Phase C and D, evaluate if TradeX is worth continuing based on these questions:

### Product value

- Can it import or create real trades reliably?
- Does the dashboard help the trader understand performance faster?
- Does paper trading feel useful and safe?
- Does the risk engine prevent obvious bad behavior?
- Is the mobile PWA good enough to use daily?

### Technical value

- Does build pass consistently?
- Are core flows tested?
- Is data source separation clean?
- Is the code maintainable for agent work?
- Are secrets and credentials handled properly?

### Trading value

- Can it test one simple strategy end-to-end?
- Does paper performance match backtest expectations reasonably?
- Are drawdowns controlled?
- Are costs/spread/slippage included?
- Is there enough sample size to judge anything?

If the answer is yes to most of these, continue. If not, stop adding features and fix the foundation.

---

## 23. Absolute P0 Checklist

Do these before any fancy UI or AI expansion:

- [ ] Global demo/live/paper/backtest mode badges.
- [ ] Dashboard live-data wiring.
- [ ] Reports live-data wiring.
- [ ] Paper order/fill/position engine.
- [ ] Risk engine.
- [ ] Kill switch.
- [ ] Audit logs.
- [ ] Empty/error/loading states.
- [ ] Backend tests for paper + risk.
- [ ] Playwright E2E for paper flow.
- [ ] Production secret validation.

---

## 24. Absolute Do-Not-Do List

Do not:

- Add real-money live execution now.
- Let AI place trades.
- Hide demo/mock status.
- Mix paper/backtest/live stats without filters.
- Claim profitability.
- Build more flashy charts before the data pipeline is real.
- Store broker passwords unencrypted.
- Commit `.env`.
- Use perfect fills in paper trading.
- Trust backtests without spread/slippage/commission.
- Skip risk engine.

---

## 25. Final Recommended Build Order

The fastest serious path is:

1. **Make all existing screens honest**: demo/live/paper badges everywhere.
2. **Wire dashboard and reports to live APIs**.
3. **Finish paper trading orders/fills/positions**.
4. **Add the risk engine and kill switch**.
5. **Add backtesting MVP**.
6. **Run one simple strategy from backtest to paper**.
7. **Compare backtest vs paper results**.
8. **Only then decide if live automation is worth discussing.**

TradeX can become a genuinely useful system, but the right path is not “bot first.” The right path is:

> **journal → analytics → paper trading → risk engine → backtesting → strategy runner → live readiness.**

That is how this becomes a serious project instead of another risky trading bot dashboard.

