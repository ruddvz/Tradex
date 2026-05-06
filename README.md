# ProJournX — AI-Powered Trading Journal Platform

> **Trader's Performance Lab** · Your trades, journaled. Your edge, revealed.

A full-stack, production-ready trading journal platform built for Forex, Gold (XAUUSD), Indices (US30, NAS100), and stock traders. Features MT5 auto-sync, AI pattern detection, prop firm challenge tracking, psychology analytics, and a beautiful dark-themed mobile-responsive UI.

---

## Screenshots & Features

### Dashboard
- **Equity Curve** — Balance vs Equity over 90 days with area chart
- **P&L Calendar** — Heatmap of daily gains/losses with color intensity
- **Win Rate Donut** — Visual breakdown of W/L/BE trades
- **Session Heatmap** — P&L by session (London/NY/Tokyo) × weekday
- **Daily P&L Bar Chart** — 21-day bar visualization with profit/loss coloring
- **6 Key Stat Cards** — Total P&L, Win Rate, Profit Factor, Avg R:R, Max Drawdown, Expectancy
- **AI Insight Banner** — Actionable AI-generated tip at the top of every page
- **Recent Trades Table** — Sortable trade log with live data

### Trade Journal
- Full sortable/filterable trade table with 120+ demo trades
- Trade drawer with complete details: prices, emotion, RR, notes, tags, grade
- Filter by symbol, status (WIN/LOSS), date range, strategy
- Search across symbol, strategy, and notes fields
- Grade system (A–F) based on trade quality

### AI Playbooks
- 4 pre-built playbooks with win rate, profit factor, sparkline charts
- AI-generated insights (pattern, warning, opportunity, psychology, achievement)
- Symbol performance table with win rate progress bars
- Playbook detail modal with trading rules, performance chart, tags

### Prop Firm Mode
- Visual profit target progress bar (8% target)
- Drawdown tracking (10% max, 5% daily limit)
- Challenge rules status with pass/fail indicators
- Days remaining, trades needed, daily P&L target
- AI tips for challenge completion strategy

### Trading Notebook
- Markdown-like rendering with headings, bullets, numbered lists
- 5 entry types: Note, Rule, Setup, Lesson, Checklist
- Pin important notes to the top
- Filter by type, search by content
- Beautiful entry cards with type-specific color coding

### Reports
- Full performance statistics table (16 metrics)
- Strategy performance bar chart
- Emotion analysis horizontal bar chart
- Trader profile radar chart (Win Rate, PF, Risk, RR, Discipline)
- All charts in one comprehensive view with PDF export button

### Risk Calculator
- Real-time lot size calculator for 8 instruments
- Account balance + risk % input with preset buttons (0.5%, 1%, 1.5%, 2%)
- R:R assessment with good/bad threshold indicators
- Risk management guideline checklist

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| TailwindCSS 3 | Styling system |
| Recharts | Charts (Area, Bar, Pie, Line, Radar) |
| React Router DOM | Client-side routing |
| Zustand | Global state management |
| Lucide React | Icon library |
| date-fns | Date formatting/manipulation |
| framer-motion | Animations |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API framework |
| Python 3.12 | Runtime |
| SQLAlchemy 2 | ORM + database models |
| PostgreSQL | Primary database |
| Redis | Caching + background tasks |
| Alembic | Database migrations |
| Pydantic v2 | Data validation |
| OpenAI API | AI insights generation |
| MetaTrader5 | MT5 trade import |
| Pandas/NumPy | Analytics computation |
| Celery | Background job processing |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker + Compose | Container orchestration |
| Nginx | Frontend server + API proxy |
| GitHub Actions | CI/CD pipeline |

---

## Architecture

```
projournx/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header, Layout wrapper
│   │   │   ├── charts/          # EquityCurve, PnLCalendar, WinRateDonut,
│   │   │   │                    #   SessionHeatmap, PnLBarChart
│   │   │   └── ui/              # StatCard, Badge, PnlBadge, DirectionBadge
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Main analytics hub
│   │   │   ├── Journal.tsx      # Trade log + drawer
│   │   │   ├── Playbooks.tsx    # AI patterns + insights
│   │   │   ├── PropFirm.tsx     # Challenge tracker
│   │   │   ├── Notebook.tsx     # Knowledge base
│   │   │   ├── Reports.tsx      # Full analytics report
│   │   │   ├── Calculator.tsx   # Risk/lot size calculator
│   │   │   ├── Settings.tsx     # Account + preferences
│   │   │   └── Landing.tsx      # Marketing landing page
│   │   ├── store/
│   │   │   └── useStore.ts      # Zustand global state
│   │   ├── data/
│   │   │   └── mockData.ts      # 120 demo trades + all mock data
│   │   └── types/
│   │       └── index.ts         # TypeScript interfaces
│   ├── tailwind.config.js       # Custom design system
│   ├── Dockerfile               # Multi-stage build
│   └── nginx.conf               # Production server config
│
├── backend/                     # FastAPI REST API
│   ├── app/
│   │   ├── main.py              # FastAPI app + middleware
│   │   ├── core/
│   │   │   └── config.py        # Environment settings
│   │   ├── api/v1/
│   │   │   └── routes.py        # All API endpoints
│   │   ├── models/
│   │   │   └── trade.py         # SQLAlchemy models
│   │   └── services/
│   │       ├── analytics.py     # Performance metrics engine
│   │       ├── ai_service.py    # OpenAI insight generation
│   │       └── mt5_sync.py      # MetaTrader 5 sync service
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml           # Full stack orchestration
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose (optional, for full stack)

### Option A: Frontend Only (Instant Demo)

```bash
# Clone the repo
git clone <repo-url>
cd projournx/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

The frontend runs with 120 demo trades pre-loaded. No backend needed for the demo.

### Option B: Full Stack with Docker

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env: set SECRET_KEY, OPENAI_API_KEY (optional)

# Start all services
docker-compose up -d

# Frontend → http://localhost
# API docs → http://localhost:8000/docs
# API health → http://localhost:8000/api/v1/health
```

### Option C: Manual Full Stack

```bash
# 1. Start PostgreSQL & Redis (or use Docker just for infra)
docker-compose up -d postgres redis

# 2. Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # configure DATABASE_URL etc.
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create `backend/.env`:

```env
# Required
SECRET_KEY=your-secure-secret-key-minimum-32-chars
DATABASE_URL=postgresql://postgres:password@localhost:5432/projournx

# Optional — AI insights
OPENAI_API_KEY=sk-...

# Optional — MT5 sync
MT5_LOGIN=12345678
MT5_PASSWORD=your-mt5-password
MT5_SERVER=Exness-MT5Real

# Optional
REDIS_URL=redis://localhost:6379
DEBUG=false
CORS_ORIGINS=["http://localhost:5173"]
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

Interactive docs available at: `http://localhost:8000/docs`

### Trades
```
GET    /trades                  List trades (filterable by symbol, status, date)
POST   /trades                  Create a trade
GET    /trades/{id}             Get single trade
PATCH  /trades/{id}             Update trade (notes, emotion, grade, tags)
DELETE /trades/{id}             Delete trade
```

### Analytics
```
GET /analytics/metrics          Full performance metrics
GET /analytics/symbols          Per-symbol breakdown
GET /analytics/sessions         Per-session breakdown
GET /analytics/psychology       Emotion vs win rate analysis
GET /analytics/calendar         Daily P&L calendar data
```

### AI
```
POST /ai/insights               Generate AI insights from your trade data
```

### Notebook
```
GET    /notebook                List all notes
POST   /notebook                Create a note
PATCH  /notebook/{id}           Update note
DELETE /notebook/{id}           Delete note
```

### Challenges (Prop Firm)
```
GET  /challenges                List challenges
POST /challenges                Create a new challenge
```

### Sync
```
POST /sync/mt5                  Sync trades from MT5 terminal
```

---

## Performance Metrics Computed

| Metric | Description |
|--------|-------------|
| Total P&L | Net profit/loss over period |
| Win Rate | % of winning trades |
| Profit Factor | Gross profit / Gross loss |
| Avg Win | Average profit on winning trades |
| Avg Loss | Average loss on losing trades |
| Avg R:R | Average risk-to-reward ratio |
| Max Drawdown | Largest % decline from equity peak |
| Expectancy | Expected $ per trade (statistical edge) |
| Sharpe Ratio | Risk-adjusted return metric |
| Max Win Streak | Longest consecutive winning run |
| Max Loss Streak | Longest consecutive losing run |
| Avg Hold Time | Average trade duration in minutes |
| Daily P&L | Per-day P&L breakdown |
| Session Analysis | Performance by London/NY/Tokyo/Overlap |
| Psychology | Win rate by emotional state |

---

## MT5 Integration

ProJournX connects to MetaTrader 5 using the `MetaTrader5` Python package. The sync service:

1. Connects to your broker's MT5 server
2. Fetches closed deal history for the specified date range
3. Pairs entry/exit deals into complete trades
4. Deduplicates by ticket number
5. Stores in the database for analytics

**Supported Brokers** (via MT5): Exness, IC Markets, XM, Pepperstone, FTMO, and 100+ others.

```python
# MT5 sync example
POST /api/v1/sync/mt5
{
    "login": 12345678,
    "password": "your-password",
    "server": "Exness-MT5Real",
    "days": 90
}
```

---

## AI Features

### Pattern Detection (OpenAI GPT-4o-mini)
Analyzes your trade history to identify:
- Best performing days of the week
- Most profitable trading sessions
- Winning vs losing strategies
- Emotional state correlations
- Risk management patterns

### Rule-Based Fallback
When no OpenAI API key is provided, the system uses rule-based analysis:
- Win rate benchmarking (>60% = strong, <50% = warning)
- Drawdown risk assessment (>15% = danger zone)
- R:R adequacy check
- Psychology correlation from trade emotion tags

### Psychology Tracking
Every trade can be tagged with an emotional state:
`Confident | Focused | Calm | Anxious | Fearful | Greedy | FOMO | Revenge | Neutral | Excited | Patient`

The AI correlates emotion with outcomes and surfaces patterns like:
> *"Trades tagged 'FOMO' produce only 23% win rate vs 78% when 'Calm'"*

---

## Design System

The UI uses a custom TailwindCSS design system:

```
Colors:
  brand-*    → Emerald green (profit color, primary actions)
  dark-*     → Deep blue-black backgrounds
  surface-*  → Card/panel backgrounds
  profit     → #10b981 (green)
  loss       → #ef4444 (red)
  warn       → #f59e0b (amber)
  info       → #3b82f6 (blue)

Components:
  .card          → Glass-morphism dark card
  .card-hover    → Card with hover lift effect
  .btn-primary   → Emerald CTA button
  .btn-secondary → Ghost button
  .input         → Dark-themed form input
  .badge-*       → Status badges (profit/loss/neutral)
  .stat-card     → KPI metric card
  .nav-item      → Sidebar navigation item
```

---

## Prop Firm Challenge Tracking

ProJournX supports FTMO-style challenges with:

| Feature | Details |
|---------|---------|
| Profit Target | Set % target (e.g., 8% = $8,000 on $100K) |
| Max Drawdown | Track cumulative drawdown (e.g., 10%) |
| Daily Loss Limit | Monitor daily loss (e.g., 5%) |
| Min Trading Days | Track days traded vs minimum required |
| Visual Progress | Color-coded progress bars (green/amber/red) |
| Status Badges | Active / At Risk / Failed / Passed |
| AI Tips | Daily recommendations for challenge progress |

---

## Roadmap

### Phase 1 (Current — MVP)
- [x] MT5 auto-sync service
- [x] Dashboard with 8 chart types
- [x] Trade journal with filtering
- [x] AI playbooks and insights
- [x] Prop firm challenge tracker
- [x] Trading notebook with markdown
- [x] Risk/lot size calculator
- [x] Performance reports
- [x] Mobile responsive UI

### Phase 2 (Next)
- [ ] User authentication (JWT + OAuth)
- [ ] Multi-account support
- [ ] Screenshot upload with OCR annotation
- [ ] Bar Replay backtesting engine ("Barliplay")
- [ ] Trade plan vs actual comparison
- [ ] Weekly/monthly performance PDF reports
- [ ] Telegram/Discord P&L notifications
- [ ] MT4 support via bridge

### Phase 3 (Future)
- [ ] iOS/Android PWA
- [ ] Social trading journal sharing
- [ ] Community leaderboards
- [ ] AI trade coaching chat
- [ ] Custom strategy backtesting
- [ ] Multi-currency support (INR, EUR, GBP)

---

## Contributing

```bash
# Fork and clone
git clone https://github.com/yourusername/projournx.git

# Create feature branch
git checkout -b feature/my-feature

# Make changes, then:
npm run build    # ensure frontend builds
pytest           # run backend tests

git commit -m "feat: add my feature"
git push origin feature/my-feature
# Open a Pull Request
```

---

## License

MIT License — Free to use, modify, and distribute.

---

## Disclaimer

ProJournX is a trading analysis tool. Past performance does not guarantee future results. Trading carries substantial risk of loss. Always use proper risk management and never risk more than you can afford to lose.

---

*Built with ❤️ for serious traders who want data-driven consistency.*
