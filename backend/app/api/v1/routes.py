"""
FastAPI route handlers for Tradex API v1.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import and_, func as sql_func, select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.challenge import PropChallenge
from ...models.notebook import NotebookEntry
from ...models.trade import Trade, TradeGrade, TradeStatus
from ...models.user import User, UserPlan
from ...core.security import hash_password, verify_password, create_access_token
from ...services.analytics import (
    compute_metrics,
    compute_symbol_stats,
    compute_session_stats,
    compute_psychology_stats,
)
from ...services.ai_service import generate_ai_insights
from ...services.trade_codec import (
    compute_grade_and_rr,
    grade_from_str,
    parse_iso_datetime,
    direction_from_str,
    status_from_str,
    trade_from_mt5_dict,
    trade_to_api_dict,
)
from ..deps import get_current_user

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


# ── Serialization helpers ───────────────────────────────────────────────────────


def _notebook_to_dict(n: NotebookEntry) -> Dict[str, Any]:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "content": n.content,
        "type": n.entry_type,
        "tags": n.tags or [],
        "pinned": n.pinned,
        "created_at": n.created_at.isoformat() if n.created_at else None,
        "updated_at": n.updated_at.isoformat() if n.updated_at else None,
    }


def _challenge_to_dict(c: PropChallenge) -> Dict[str, Any]:
    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "firm": c.firm,
        "account_size": c.account_size,
        "profit_target": c.profit_target,
        "max_drawdown": c.max_drawdown,
        "daily_drawdown": c.daily_drawdown,
        "min_trading_days": c.min_trading_days,
        "start_date": c.start_date,
        "end_date": c.end_date,
        "current_pnl": c.current_pnl,
        "current_drawdown": c.current_drawdown,
        "daily_loss": c.daily_loss,
        "status": c.status,
        "trades": c.trades_count,
        "days_traded": c.days_traded,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "plan": user.plan.value if hasattr(user.plan, "value") else str(user.plan),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def _norm_day_start(s: str) -> datetime:
    raw = s.strip()
    if len(raw) == 10:
        raw = raw + "T00:00:00"
    dt = parse_iso_datetime(raw)
    return dt or datetime.min


def _norm_day_end(s: str) -> datetime:
    raw = s.strip()
    if len(raw) == 10:
        raw = raw + "T23:59:59"
    dt = parse_iso_datetime(raw)
    return dt or datetime.max


def _user_trade_dicts(db: Session, user_id: str) -> List[Dict[str, Any]]:
    rows = db.execute(
        select(Trade).where(Trade.user_id == user_id).order_by(Trade.entry_time.desc())
    ).scalars().all()
    return [trade_to_api_dict(t) for t in rows]


# ── Health (public) ─────────────────────────────────────────────────────────────


@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}


# ── Auth ────────────────────────────────────────────────────────────────────────


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
    db: Session = Depends(get_db),
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
):
    conditions = [Trade.user_id == user.id]
    if symbol:
        conditions.append(Trade.symbol == symbol)
    if status:
        try:
            conditions.append(Trade.status == TradeStatus[status.upper()])
        except KeyError as exc:
            raise HTTPException(status_code=400, detail="Invalid status filter") from exc
    if from_date:
        conditions.append(Trade.entry_time >= _norm_day_start(from_date))
    if to_date:
        conditions.append(Trade.entry_time <= _norm_day_end(to_date))

    base_where = and_(*conditions)
    total = db.execute(select(sql_func.count()).select_from(Trade).where(base_where)).scalar() or 0

    stmt = (
        select(Trade)
        .where(base_where)
        .order_by(Trade.entry_time.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = db.execute(stmt).scalars().all()
    return {"trades": [trade_to_api_dict(t) for t in rows], "total": total}


@router.post("/trades", status_code=201)
async def create_trade(trade: TradeIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pnl = trade.pnl
    status_str = "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN"
    grade_s, r_mult = compute_grade_and_rr(pnl, status_str)

    entry_time = parse_iso_datetime(trade.entry_time)
    if entry_time is None:
        raise HTTPException(status_code=400, detail="Invalid entry_time")
    exit_time = parse_iso_datetime(trade.exit_time)

    try:
        direction = direction_from_str(trade.direction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    tid = str(uuid.uuid4())
    row = Trade(
        id=tid,
        user_id=user.id,
        symbol=trade.symbol,
        direction=direction,
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        lot_size=trade.lot_size,
        entry_time=entry_time,
        exit_time=exit_time,
        pnl=trade.pnl,
        commission=trade.commission,
        swap=trade.swap,
        stop_loss=trade.stop_loss,
        take_profit=trade.take_profit,
        strategy=trade.strategy,
        session=trade.session,
        emotion=trade.emotion or "Neutral",
        emotion_score=trade.emotion_score,
        notes=trade.notes,
        tags=trade.tags or [],
        duration=trade.duration,
        status=status_from_str(status_str),
        grade=grade_from_str(grade_s),
        r_multiple=r_mult,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return trade_to_api_dict(row)


@router.get("/trades/{trade_id}")
async def get_trade(trade_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.user_id == user.id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade_to_api_dict(row)


@router.patch("/trades/{trade_id}")
async def update_trade(
    trade_id: str,
    updates: TradeUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.user_id == user.id)
    ).scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")

    for k, v in updates.model_dump(exclude_none=True).items():
        if k == "grade" and v is not None:
            trade.grade = grade_from_str(str(v))
        elif k == "tags":
            trade.tags = v
        elif hasattr(trade, k):
            setattr(trade, k, v)

    db.commit()
    db.refresh(trade)
    return trade_to_api_dict(trade)


@router.delete("/trades/{trade_id}", status_code=204)
async def delete_trade(trade_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trade = db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.user_id == user.id)
    ).scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()


# ── Analytics ──────────────────────────────────────────────────────────────────


@router.get("/analytics/metrics")
async def get_metrics(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    trades = _user_trade_dicts(db, user.id)
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= _norm_day_start(from_date).isoformat()]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= _norm_day_end(to_date).isoformat()]
    return compute_metrics(trades)


@router.get("/analytics/symbols")
async def get_symbol_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return compute_symbol_stats(_user_trade_dicts(db, user.id))


@router.get("/analytics/sessions")
async def get_session_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return compute_session_stats(_user_trade_dicts(db, user.id))


@router.get("/analytics/psychology")
async def get_psychology_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return compute_psychology_stats(_user_trade_dicts(db, user.id))


@router.get("/analytics/calendar")
async def get_calendar(user: User = Depends(get_current_user), db: Session = Depends(get_db), days: int = 90):
    from_dt = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    daily_pnl: dict = {}
    for t in _user_trade_dicts(db, user.id):
        day = t.get("entry_time", "")[:10]
        if day >= from_dt:
            daily_pnl[day] = daily_pnl.get(day, {"pnl": 0, "trades": 0})
            daily_pnl[day]["pnl"] += t.get("pnl", 0)
            daily_pnl[day]["trades"] += 1
    return [{"date": k, **v} for k, v in sorted(daily_pnl.items())]


# ── AI Insights ────────────────────────────────────────────────────────────────


@router.post("/ai/insights")
async def get_ai_insights(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ut = _user_trade_dicts(db, user.id)
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
async def get_notebook(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(NotebookEntry)
        .where(NotebookEntry.user_id == user.id)
        .order_by(NotebookEntry.pinned.desc(), NotebookEntry.updated_at.desc())
    ).scalars().all()
    return {"entries": [_notebook_to_dict(n) for n in rows]}


@router.post("/notebook", status_code=201)
async def create_note(entry: NotebookEntryIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payload = entry.model_dump()
    row = NotebookEntry(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=payload["title"],
        content=payload["content"],
        entry_type=payload["type"],
        tags=payload.get("tags") or [],
        pinned=payload.get("pinned") or False,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _notebook_to_dict(row)


@router.patch("/notebook/{entry_id}")
async def update_note(
    entry_id: str,
    updates: Dict[str, Any] = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        select(NotebookEntry).where(NotebookEntry.id == entry_id, NotebookEntry.user_id == user.id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    allowed = {"title", "content", "tags", "pinned", "type"}
    for k, v in updates.items():
        if k not in allowed:
            continue
        if k == "type":
            row.entry_type = v
        elif k == "tags":
            row.tags = v
        elif k == "pinned":
            row.pinned = bool(v)
        elif k in ("title", "content"):
            setattr(row, k, v)

    db.commit()
    db.refresh(row)
    return _notebook_to_dict(row)


@router.delete("/notebook/{entry_id}", status_code=204)
async def delete_note(entry_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.execute(
        select(NotebookEntry).where(NotebookEntry.id == entry_id, NotebookEntry.user_id == user.id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(row)
    db.commit()


# ── Prop Firm Challenges ───────────────────────────────────────────────────────


@router.get("/challenges")
async def get_challenges(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(PropChallenge)
        .where(PropChallenge.user_id == user.id)
        .order_by(PropChallenge.created_at.desc())
    ).scalars().all()
    return {"challenges": [_challenge_to_dict(c) for c in rows]}


@router.post("/challenges", status_code=201)
async def create_challenge(
    challenge: PropChallengeIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    data = challenge.model_dump()
    row = PropChallenge(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=data["name"],
        firm=data["firm"],
        account_size=data["account_size"],
        profit_target=data["profit_target"],
        max_drawdown=data["max_drawdown"],
        daily_drawdown=data["daily_drawdown"],
        min_trading_days=data["min_trading_days"],
        start_date=data["start_date"],
        end_date=data["end_date"],
        current_pnl=0,
        current_drawdown=0,
        daily_loss=0,
        status="active",
        trades_count=0,
        days_traded=0,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _challenge_to_dict(row)


# ── MT5 Sync ───────────────────────────────────────────────────────────────────


@router.post("/sync/mt5")
async def sync_mt5(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
    sync_trades = service.fetch_trades(from_date=from_date)
    service.disconnect()

    uid = user.id
    tickets_q = select(Trade.mt5_ticket).where(
        Trade.user_id == uid,
        Trade.mt5_ticket.is_not(None),
    )
    existing_tickets = {x for x in db.execute(tickets_q).scalars().all() if x}

    added = 0
    for tr in sync_trades:
        mt = str(tr.get("mt5_ticket") or tr.get("ticket") or "")
        if mt and mt in existing_tickets:
            continue
        tid = str(uuid.uuid4())
        row = trade_from_mt5_dict(uid, tid, tr)
        db.add(row)
        if mt:
            existing_tickets.add(mt)
        added += 1

    db.commit()
    return {"status": "success", "synced": len(sync_trades), "new": added}
