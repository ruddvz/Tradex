"""
FastAPI route handlers for ProJournX API v1.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid

from ...services.analytics import (
    compute_metrics, compute_symbol_stats,
    compute_session_stats, compute_psychology_stats,
)
from ...services.ai_service import generate_ai_insights

router = APIRouter(prefix="/api/v1")

# ── Schemas ────────────────────────────────────────────────────────────────────

class TradeIn(BaseModel):
    symbol: str
    direction: str
    entry_price: float
    exit_price: Optional[float] = None
    lot_size: float
    entry_time: str
    exit_time: Optional[str] = None
    pnl: float = 0
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    strategy: Optional[str] = None
    session: Optional[str] = None
    emotion: Optional[str] = "Neutral"
    emotion_score: int = 5
    notes: Optional[str] = ""
    tags: List[str] = []
    duration: int = 0
    commission: float = 0
    swap: float = 0

class TradeUpdate(BaseModel):
    strategy: Optional[str] = None
    session: Optional[str] = None
    emotion: Optional[str] = None
    emotion_score: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    grade: Optional[str] = None

class NotebookEntryIn(BaseModel):
    title: str
    content: str
    type: str = "note"
    tags: List[str] = []
    pinned: bool = False

class PropChallengeIn(BaseModel):
    name: str
    firm: str
    account_size: float
    profit_target: float
    max_drawdown: float
    daily_drawdown: float
    min_trading_days: int = 10
    start_date: str
    end_date: str

# ── In-memory store (replace with DB in production) ────────────────────────────
_trades: List[dict] = []
_notebook: List[dict] = []
_challenges: List[dict] = []

# ── Health ──────────────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}

# ── Trades ──────────────────────────────────────────────────────────────────────

@router.get("/trades")
async def get_trades(
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
):
    trades = list(_trades)
    if symbol:
        trades = [t for t in trades if t["symbol"] == symbol]
    if status:
        trades = [t for t in trades if t.get("status") == status]
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= from_date]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= to_date]
    return {"trades": trades[offset:offset + limit], "total": len(trades)}


@router.post("/trades", status_code=201)
async def create_trade(trade: TradeIn):
    pnl = trade.pnl
    status = "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN"
    grade = "A" if pnl > 300 else "B" if pnl > 100 else "C" if pnl > 0 else "D" if pnl > -100 else "F"
    rr = abs(pnl) / max(abs(pnl * 0.4), 1)

    new_trade = {
        "id": str(uuid.uuid4()),
        **trade.model_dump(),
        "status": status,
        "grade": grade,
        "r_multiple": round(rr, 2) if status == "WIN" else -round(rr * 0.5, 2),
        "created_at": datetime.utcnow().isoformat(),
    }
    _trades.insert(0, new_trade)
    return new_trade


@router.get("/trades/{trade_id}")
async def get_trade(trade_id: str):
    trade = next((t for t in _trades if t["id"] == trade_id), None)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.patch("/trades/{trade_id}")
async def update_trade(trade_id: str, updates: TradeUpdate):
    trade = next((t for t in _trades if t["id"] == trade_id), None)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    for k, v in updates.model_dump(exclude_none=True).items():
        trade[k] = v
    return trade


@router.delete("/trades/{trade_id}", status_code=204)
async def delete_trade(trade_id: str):
    global _trades
    _trades = [t for t in _trades if t["id"] != trade_id]


# ── Analytics ──────────────────────────────────────────────────────────────────

@router.get("/analytics/metrics")
async def get_metrics(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    trades = list(_trades)
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= from_date]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= to_date]
    return compute_metrics(trades)


@router.get("/analytics/symbols")
async def get_symbol_stats():
    return compute_symbol_stats(_trades)


@router.get("/analytics/sessions")
async def get_session_stats():
    return compute_session_stats(_trades)


@router.get("/analytics/psychology")
async def get_psychology_stats():
    return compute_psychology_stats(_trades)


@router.get("/analytics/calendar")
async def get_calendar(days: int = 90):
    from datetime import date
    from_dt = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    daily_pnl: dict = {}
    for t in _trades:
        day = t.get("entry_time", "")[:10]
        if day >= from_dt:
            daily_pnl[day] = daily_pnl.get(day, {"pnl": 0, "trades": 0})
            daily_pnl[day]["pnl"] += t.get("pnl", 0)
            daily_pnl[day]["trades"] += 1
    return [{"date": k, **v} for k, v in sorted(daily_pnl.items())]


# ── AI Insights ────────────────────────────────────────────────────────────────

@router.post("/ai/insights")
async def get_ai_insights():
    if not _trades:
        return {"insights": []}
    metrics = compute_metrics(_trades)
    summary = {
        "symbols": compute_symbol_stats(_trades),
        "sessions": compute_session_stats(_trades),
        "psychology": compute_psychology_stats(_trades),
    }
    insights = await generate_ai_insights(metrics, summary)
    return {"insights": insights}


# ── Notebook ───────────────────────────────────────────────────────────────────

@router.get("/notebook")
async def get_notebook():
    return {"entries": _notebook}


@router.post("/notebook", status_code=201)
async def create_note(entry: NotebookEntryIn):
    now = datetime.utcnow().isoformat()
    new_entry = {
        "id": str(uuid.uuid4()),
        **entry.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    _notebook.insert(0, new_entry)
    return new_entry


@router.patch("/notebook/{entry_id}")
async def update_note(entry_id: str, updates: dict):
    entry = next((n for n in _notebook if n["id"] == entry_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.update(updates)
    entry["updated_at"] = datetime.utcnow().isoformat()
    return entry


@router.delete("/notebook/{entry_id}", status_code=204)
async def delete_note(entry_id: str):
    global _notebook
    _notebook = [n for n in _notebook if n["id"] != entry_id]


# ── Prop Firm Challenges ───────────────────────────────────────────────────────

@router.get("/challenges")
async def get_challenges():
    return {"challenges": _challenges}


@router.post("/challenges", status_code=201)
async def create_challenge(challenge: PropChallengeIn):
    new = {
        "id": str(uuid.uuid4()),
        **challenge.model_dump(),
        "current_pnl": 0,
        "current_drawdown": 0,
        "daily_loss": 0,
        "status": "active",
        "trades": 0,
        "days_traded": 0,
        "created_at": datetime.utcnow().isoformat(),
    }
    _challenges.append(new)
    return new


# ── MT5 Sync ───────────────────────────────────────────────────────────────────

@router.post("/sync/mt5")
async def sync_mt5(
    login: int,
    password: str,
    server: str,
    days: int = 90,
):
    """Sync trades from MT5 terminal."""
    from ...services.mt5_sync import MT5SyncService
    service = MT5SyncService(login, password, server)
    connected = service.connect()
    if not connected:
        return {"status": "demo", "message": "MT5 not available; using demo data", "trades": []}

    from_date = datetime.now() - timedelta(days=days)
    trades = service.fetch_trades(from_date=from_date)
    service.disconnect()

    added = 0
    existing_tickets = {t.get("mt5_ticket") for t in _trades}
    for trade in trades:
        if trade.get("mt5_ticket") not in existing_tickets:
            _trades.insert(0, {**trade, "id": str(uuid.uuid4())})
            added += 1

    return {"status": "success", "synced": len(trades), "new": added}
