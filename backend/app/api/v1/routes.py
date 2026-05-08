"""
FastAPI route handlers for Tradex API v1.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User, UserPlan
from ...core.security import hash_password, verify_password, create_access_token
from ..deps import get_current_user
from ...services.analytics import (
    compute_metrics,
    compute_symbol_stats,
    compute_session_stats,
    compute_psychology_stats,
)
from ...services.ai_service import generate_ai_insights

router = APIRouter(prefix="/api/v1")

# ── Schemas ────────────────────────────────────────────────────────────────────


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


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


# ── In-memory store (replaced with DB queries in slice 1.2) ────────────────────
_trades: List[dict] = []
_notebook: List[dict] = []
_challenges: List[dict] = []


def _user_trades(user_id: str) -> List[dict]:
    return [t for t in _trades if t.get("user_id") == user_id]


def _find_trade(trade_id: str, user_id: str) -> Optional[dict]:
    for t in _trades:
        if t["id"] == trade_id and t.get("user_id") == user_id:
            return t
    return None


def _user_notebook(user_id: str) -> List[dict]:
    return [n for n in _notebook if n.get("user_id") == user_id]


def _find_note(entry_id: str, user_id: str) -> Optional[dict]:
    for n in _notebook:
        if n["id"] == entry_id and n.get("user_id") == user_id:
            return n
    return None


def _user_challenges(user_id: str) -> List[dict]:
    return [c for c in _challenges if c.get("user_id") == user_id]


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan.value if hasattr(user.plan, "value") else str(user.plan),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Health (public) ─────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}


# ── Auth (public except /me) ────────────────────────────────────────────────────


@router.post("/auth/register", status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    uid = str(uuid.uuid4())
    user = User(
        id=uid,
        email=email,
        hashed_password=hash_password(body.password),
        name=body.name.strip(),
        plan=UserPlan.FREE,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/auth/login")
def login(body: UserLogin, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/auth/me")
def auth_me(user: User = Depends(get_current_user)):
    return _serialize_user(user)


# ── Trades ──────────────────────────────────────────────────────────────────────


@router.get("/trades")
async def get_trades(
    user: User = Depends(get_current_user),
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
):
    trades = _user_trades(user.id)
    if symbol:
        trades = [t for t in trades if t["symbol"] == symbol]
    if status:
        trades = [t for t in trades if t.get("status") == status]
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= from_date]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= to_date]
    return {"trades": trades[offset : offset + limit], "total": len(trades)}


@router.post("/trades", status_code=201)
async def create_trade(trade: TradeIn, user: User = Depends(get_current_user)):
    pnl = trade.pnl
    status_str = "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN"
    grade = "A" if pnl > 300 else "B" if pnl > 100 else "C" if pnl > 0 else "D" if pnl > -100 else "F"
    rr = abs(pnl) / max(abs(pnl * 0.4), 1)

    new_trade = {
        "id": str(uuid.uuid4()),
        "user_id": user.id,
        **trade.model_dump(),
        "status": status_str,
        "grade": grade,
        "r_multiple": round(rr, 2) if status_str == "WIN" else -round(rr * 0.5, 2),
        "created_at": datetime.utcnow().isoformat(),
    }
    _trades.insert(0, new_trade)
    return new_trade


@router.get("/trades/{trade_id}")
async def get_trade(trade_id: str, user: User = Depends(get_current_user)):
    trade = _find_trade(trade_id, user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.patch("/trades/{trade_id}")
async def update_trade(trade_id: str, updates: TradeUpdate, user: User = Depends(get_current_user)):
    trade = _find_trade(trade_id, user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    for k, v in updates.model_dump(exclude_none=True).items():
        trade[k] = v
    return trade


@router.delete("/trades/{trade_id}", status_code=204)
async def delete_trade(trade_id: str, user: User = Depends(get_current_user)):
    global _trades
    if _find_trade(trade_id, user.id) is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    _trades = [t for t in _trades if not (t["id"] == trade_id and t.get("user_id") == user.id)]


# ── Analytics ──────────────────────────────────────────────────────────────────


@router.get("/analytics/metrics")
async def get_metrics(
    user: User = Depends(get_current_user),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    trades = _user_trades(user.id)
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= from_date]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= to_date]
    return compute_metrics(trades)


@router.get("/analytics/symbols")
async def get_symbol_stats(user: User = Depends(get_current_user)):
    return compute_symbol_stats(_user_trades(user.id))


@router.get("/analytics/sessions")
async def get_session_stats(user: User = Depends(get_current_user)):
    return compute_session_stats(_user_trades(user.id))


@router.get("/analytics/psychology")
async def get_psychology_stats(user: User = Depends(get_current_user)):
    return compute_psychology_stats(_user_trades(user.id))


@router.get("/analytics/calendar")
async def get_calendar(user: User = Depends(get_current_user), days: int = 90):
    from_dt = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    daily_pnl: dict = {}
    for t in _user_trades(user.id):
        day = t.get("entry_time", "")[:10]
        if day >= from_dt:
            daily_pnl[day] = daily_pnl.get(day, {"pnl": 0, "trades": 0})
            daily_pnl[day]["pnl"] += t.get("pnl", 0)
            daily_pnl[day]["trades"] += 1
    return [{"date": k, **v} for k, v in sorted(daily_pnl.items())]


# ── AI Insights ────────────────────────────────────────────────────────────────


@router.post("/ai/insights")
async def get_ai_insights(user: User = Depends(get_current_user)):
    ut = _user_trades(user.id)
    if not ut:
        return {"insights": []}
    metrics = compute_metrics(ut)
    summary = {
        "symbols": compute_symbol_stats(ut),
        "sessions": compute_session_stats(ut),
        "psychology": compute_psychology_stats(ut),
    }
    insights = await generate_ai_insights(metrics, summary)
    return {"insights": insights}


# ── Notebook ───────────────────────────────────────────────────────────────────


@router.get("/notebook")
async def get_notebook(user: User = Depends(get_current_user)):
    return {"entries": _user_notebook(user.id)}


@router.post("/notebook", status_code=201)
async def create_note(entry: NotebookEntryIn, user: User = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    new_entry = {
        "id": str(uuid.uuid4()),
        "user_id": user.id,
        **entry.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    _notebook.insert(0, new_entry)
    return new_entry


@router.patch("/notebook/{entry_id}")
async def update_note(entry_id: str, updates: dict, user: User = Depends(get_current_user)):
    entry = _find_note(entry_id, user.id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.update(updates)
    entry["updated_at"] = datetime.utcnow().isoformat()
    return entry


@router.delete("/notebook/{entry_id}", status_code=204)
async def delete_note(entry_id: str, user: User = Depends(get_current_user)):
    global _notebook
    if _find_note(entry_id, user.id) is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    _notebook = [n for n in _notebook if not (n["id"] == entry_id and n.get("user_id") == user.id)]


# ── Prop Firm Challenges ───────────────────────────────────────────────────────


@router.get("/challenges")
async def get_challenges(user: User = Depends(get_current_user)):
    return {"challenges": _user_challenges(user.id)}


@router.post("/challenges", status_code=201)
async def create_challenge(challenge: PropChallengeIn, user: User = Depends(get_current_user)):
    new = {
        "id": str(uuid.uuid4()),
        "user_id": user.id,
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
    user: User = Depends(get_current_user),
    login: int = Query(...),
    password: str = Query(...),
    server: str = Query(...),
    days: int = Query(default=90),
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

    uid = user.id
    existing_tickets = {
        t.get("mt5_ticket")
        for t in _trades
        if t.get("user_id") == uid and t.get("mt5_ticket")
    }
    added = 0
    for trade in trades:
        if trade.get("mt5_ticket") not in existing_tickets:
            _trades.insert(
                0,
                {**trade, "id": str(uuid.uuid4()), "user_id": uid},
            )
            added += 1

    return {"status": "success", "synced": len(trades), "new": added}
