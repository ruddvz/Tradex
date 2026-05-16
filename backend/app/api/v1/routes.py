"""
FastAPI route handlers for Tradex API v1.
"""
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
import uuid

import aiofiles
from fastapi import APIRouter, Body, Depends, File, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import and_, func as sql_func, select
from sqlalchemy.orm import Session

from ...database import get_db
from ...core.config import settings
from ...models.challenge import PropChallenge
from ...models.notebook import NotebookEntry
from ...models.trade import Trade, TradeGrade, TradeStatus
from ...models.trading_account import TradingAccount, TradingAccountType
from ...models.paper import PaperAccount, PaperTrade, PaperOrderDirection
from ...models.user import User, UserPlan
from ...core.security import hash_password, verify_password, create_access_token
from ...core.mt5_crypto import decrypt_mt5_secret, encrypt_mt5_secret
from ..deps import get_current_user
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
from ...services.paper_service import place_paper_trade
from ...tasks.notifications import merge_notification_prefs, run_daily_report_cycle

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
    account_id: Optional[str] = None
    setup: Optional[str] = None


class TradingAccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    broker: Optional[str] = None
    account_type: str = "demo"
    base_currency: str = "USD"
    starting_balance: float = Field(default=10000.0, gt=0)
    risk_per_trade_default: float = Field(default=1.0, ge=0.1, le=50)
    max_daily_loss: Optional[float] = Field(default=None, gt=0)
    max_total_drawdown: Optional[float] = None


class PaperAccountCreate(BaseModel):
    name: str = "Paper"
    starting_balance: float = Field(default=50000.0, gt=0)
    max_daily_loss: float = Field(default=500.0, gt=0)
    max_risk_per_trade_percent: float = Field(default=1.0, ge=0.05, le=20)


class PaperTradeIn(BaseModel):
    paper_account_id: str
    symbol: str
    direction: str
    lot_size: float = Field(gt=0)
    entry_price: float = Field(gt=0)
    exit_price: float = Field(gt=0)
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    entry_time: str
    exit_time: str
    notes: Optional[str] = None


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


class Mt5SyncIn(BaseModel):
    server: Optional[str] = None
    login: Optional[int] = None
    password: Optional[str] = None
    days: int = Field(default=90, ge=1, le=365)
    account_id: Optional[str] = None


class Mt5SettingsUpdate(BaseModel):
    server: Optional[str] = None
    login: Optional[str] = None
    password: Optional[str] = None


class NotificationsUpdate(BaseModel):
    email: Optional[bool] = None
    push: Optional[bool] = None
    drawdownAlerts: Optional[bool] = None
    dailyReport: Optional[bool] = None


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


def _trading_account_to_dict(a: TradingAccount) -> Dict[str, Any]:
    return {
        "id": a.id,
        "user_id": a.user_id,
        "name": a.name,
        "broker": a.broker,
        "account_type": a.account_type.value if hasattr(a.account_type, "value") else str(a.account_type),
        "base_currency": a.base_currency,
        "starting_balance": a.starting_balance,
        "current_balance": a.current_balance,
        "current_equity": a.current_equity,
        "risk_per_trade_default": a.risk_per_trade_default,
        "max_daily_loss": a.max_daily_loss,
        "max_total_drawdown": a.max_total_drawdown,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


def ensure_trading_accounts(db: Session, user: User) -> List[TradingAccount]:
    rows = list(
        db.execute(
            select(TradingAccount)
            .where(TradingAccount.user_id == user.id)
            .order_by(TradingAccount.created_at.asc())
        )
        .scalars()
        .all()
    )
    if rows:
        return rows
    acc = TradingAccount(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name="Primary",
        broker=None,
        account_type=TradingAccountType.DEMO,
        base_currency="USD",
        starting_balance=10000.0,
        current_balance=10000.0,
        current_equity=10000.0,
        risk_per_trade_default=1.0,
        max_daily_loss=None,
        max_total_drawdown=None,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return [acc]


def resolve_owned_account_id(db: Session, user: User, account_id: Optional[str]) -> str:
    accs = ensure_trading_accounts(db, user)
    if account_id:
        for a in accs:
            if a.id == account_id:
                return account_id
        raise HTTPException(status_code=404, detail="Trading account not found")
    return accs[0].id


def _user_trade_dicts(
    db: Session,
    user_id: str,
    account_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    stmt = select(Trade).where(Trade.user_id == user_id)
    if account_id:
        stmt = stmt.where(Trade.account_id == account_id)
    rows = db.execute(stmt.order_by(Trade.entry_time.desc())).scalars().all()
    return [trade_to_api_dict(t) for t in rows]


def _mt5_settings_public(user: User) -> dict:
    return {
        "server": user.mt5_server,
        "login": user.mt5_login,
        "has_password": bool(user.mt5_password_encrypted),
    }


def _resolve_mt5_credentials(user: User, body: Mt5SyncIn) -> tuple[int, str, str]:
    login_i = body.login
    if login_i is None and user.mt5_login:
        s = user.mt5_login.strip()
        if s.isdigit():
            login_i = int(s)
    server = (body.server or user.mt5_server or "").strip() or None
    password = body.password
    if password is None and user.mt5_password_encrypted:
        password = decrypt_mt5_secret(user.mt5_password_encrypted)
    if login_i is None or not server or not password:
        raise HTTPException(
            status_code=400,
            detail="Missing MT5 credentials. Save server, login, and password in Settings, or include them in this request.",
        )
    return login_i, password, server


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

    acc = TradingAccount(
        id=str(uuid.uuid4()),
        user_id=uid,
        name="Primary",
        broker=None,
        account_type=TradingAccountType.DEMO,
        base_currency="USD",
        starting_balance=10000.0,
        current_balance=10000.0,
        current_equity=10000.0,
        risk_per_trade_default=1.0,
        max_daily_loss=None,
        max_total_drawdown=None,
    )
    db.add(acc)
    db.commit()

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


# ── Trading accounts ───────────────────────────────────────────────────────────


@router.get("/accounts")
def list_trading_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = ensure_trading_accounts(db, user)
    return {"accounts": [_trading_account_to_dict(a) for a in rows]}


@router.post("/accounts", status_code=201)
def create_trading_account(
    body: TradingAccountCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = (body.account_type or "demo").strip().lower()
    try:
        atype = TradingAccountType(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid account_type") from exc
    acc = TradingAccount(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=body.name.strip(),
        broker=body.broker.strip() if body.broker else None,
        account_type=atype,
        base_currency=(body.base_currency or "USD").upper()[:8],
        starting_balance=body.starting_balance,
        current_balance=body.starting_balance,
        current_equity=body.starting_balance,
        risk_per_trade_default=body.risk_per_trade_default,
        max_daily_loss=body.max_daily_loss,
        max_total_drawdown=body.max_total_drawdown,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return _trading_account_to_dict(acc)


# ── Paper trading MVP ──────────────────────────────────────────────────────────


def _paper_trade_to_dict(t: PaperTrade) -> Dict[str, Any]:
    return {
        "id": t.id,
        "paper_account_id": t.paper_account_id,
        "symbol": t.symbol,
        "direction": t.direction.value if hasattr(t.direction, "value") else str(t.direction),
        "lot_size": t.lot_size,
        "entry_price": t.entry_price,
        "exit_price": t.exit_price,
        "stop_loss": t.stop_loss,
        "take_profit": t.take_profit,
        "entry_time": t.entry_time.isoformat() if t.entry_time else None,
        "exit_time": t.exit_time.isoformat() if t.exit_time else None,
        "pnl": t.pnl,
        "duration_minutes": t.duration_minutes,
        "notes": t.notes,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


@router.get("/paper/accounts")
def list_paper_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(PaperAccount).where(PaperAccount.user_id == user.id).order_by(PaperAccount.created_at.desc())
    ).scalars().all()
    return {"accounts": [_paper_account_to_dict(p) for p in rows]}


@router.post("/paper/accounts", status_code=201)
def create_paper_account(
    body: PaperAccountCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = PaperAccount(
        id=str(uuid.uuid4()),
        user_id=user.id,
        name=body.name.strip() or "Paper",
        currency="USD",
        balance=body.starting_balance,
        equity=body.starting_balance,
        max_daily_loss=body.max_daily_loss,
        max_risk_per_trade_percent=body.max_risk_per_trade_percent,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _paper_account_to_dict(row)


@router.get("/paper/trades")
def list_paper_trades(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    paper_account_id: str = Query(..., min_length=8),
):
    ac = db.execute(
        select(PaperAccount).where(PaperAccount.id == paper_account_id, PaperAccount.user_id == user.id)
    ).scalar_one_or_none()
    if ac is None:
        raise HTTPException(status_code=404, detail="Paper account not found")
    rows = db.execute(
        select(PaperTrade)
        .where(PaperTrade.paper_account_id == paper_account_id)
        .order_by(PaperTrade.exit_time.desc())
    ).scalars().all()
    return {"trades": [_paper_trade_to_dict(t) for t in rows]}


@router.post("/paper/trades", status_code=201)
def create_paper_trade_row(
    body: PaperTradeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ac = db.execute(
        select(PaperAccount).where(PaperAccount.id == body.paper_account_id, PaperAccount.user_id == user.id)
    ).scalar_one_or_none()
    if ac is None:
        raise HTTPException(status_code=404, detail="Paper account not found")
    try:
        direction = PaperOrderDirection(body.direction.strip().upper())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="direction must be BUY or SELL") from exc
    et = parse_iso_datetime(body.entry_time)
    xt = parse_iso_datetime(body.exit_time)
    if et is None or xt is None:
        raise HTTPException(status_code=400, detail="Invalid entry_time or exit_time")
    trade, err = place_paper_trade(
        db,
        paper_account=ac,
        symbol=body.symbol,
        direction=direction,
        lot_size=body.lot_size,
        entry_price=body.entry_price,
        exit_price=body.exit_price,
        stop_loss=body.stop_loss,
        take_profit=body.take_profit,
        entry_time=et,
        exit_time=xt,
        notes=body.notes,
    )
    if err:
        raise HTTPException(status_code=400, detail=err)
    assert trade is not None
    return _paper_trade_to_dict(trade)


# ── Trades ──────────────────────────────────────────────────────────────────────


@router.get("/trades")
async def get_trades(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    account_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
):
    conditions = [Trade.user_id == user.id]
    if account_id:
        _ = resolve_owned_account_id(db, user, account_id)
        conditions.append(Trade.account_id == account_id)
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
    aid = resolve_owned_account_id(db, user, trade.account_id)
    row = Trade(
        id=tid,
        user_id=user.id,
        account_id=aid,
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
        setup=trade.setup or trade.strategy,
        session=trade.session,
        emotion=trade.emotion or "Neutral",
        emotion_score=trade.emotion_score,
        notes=trade.notes,
        tags=trade.tags or [],
        duration=trade.duration,
        status=status_from_str(status_str),
        grade=grade_from_str(grade_s),
        r_multiple=r_mult,
        source="manual",
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
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    trades = _user_trade_dicts(db, user.id, aid)
    if from_date:
        trades = [t for t in trades if t.get("entry_time", "") >= _norm_day_start(from_date).isoformat()]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= _norm_day_end(to_date).isoformat()]
    return compute_metrics(trades)


@router.get("/analytics/symbols")
async def get_symbol_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    return compute_symbol_stats(_user_trade_dicts(db, user.id, aid))


@router.get("/analytics/sessions")
async def get_session_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    return compute_session_stats(_user_trade_dicts(db, user.id, aid))


@router.get("/analytics/psychology")
async def get_psychology_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    return compute_psychology_stats(_user_trade_dicts(db, user.id, aid))


@router.get("/analytics/calendar")
async def get_calendar(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 90,
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    from_dt = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    daily_pnl: dict = {}
    for t in _user_trade_dicts(db, user.id, aid):
        day = t.get("entry_time", "")[:10]
        if day >= from_dt:
            daily_pnl[day] = daily_pnl.get(day, {"pnl": 0, "trades": 0})
            daily_pnl[day]["pnl"] += t.get("pnl", 0)
            daily_pnl[day]["trades"] += 1
    return [{"date": k, **v} for k, v in sorted(daily_pnl.items())]


# ── AI Insights ────────────────────────────────────────────────────────────────


@router.post("/ai/insights")
async def get_ai_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    ut = _user_trade_dicts(db, user.id, aid)
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


# ── Trade screenshots (Phase 2) ────────────────────────────────────────────────

_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
_MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024


@router.post("/trades/{trade_id}/screenshot")
async def upload_trade_screenshot(
    trade_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    slot: Literal["before", "after"] = Query("before"),
    file: UploadFile = File(...),
):
    """Upload a before/after chart image for a trade. Stored under uploads/screenshots/{user_id}/."""
    trade = db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.user_id == user.id)
    ).scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")

    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Use PNG, JPEG, WebP, or GIF")

    raw = await file.read()
    if len(raw) > _MAX_SCREENSHOT_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 5 MB)")

    base_dir = Path(settings.UPLOAD_ROOT) / "screenshots" / user.id
    base_dir.mkdir(parents=True, exist_ok=True)
    ext = _ALLOWED_IMAGE_TYPES[ct]
    fname = f"{trade_id}_{slot}{ext}"
    dest = base_dir / fname

    async with aiofiles.open(dest, "wb") as out:
        await out.write(raw)

    public_path = f"/uploads/screenshots/{user.id}/{fname}"
    if slot == "before":
        trade.screenshot_before_url = public_path
    else:
        trade.screenshot_after_url = public_path

    db.commit()
    db.refresh(trade)
    return trade_to_api_dict(trade)


# ── Settings: MT5 credentials ────────────────────────────────────────────────────


@router.get("/settings/mt5")
def get_mt5_settings(user: User = Depends(get_current_user)):
    return _mt5_settings_public(user)


@router.put("/settings/mt5")
def put_mt5_settings(
    body: Mt5SettingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.server is not None:
        user.mt5_server = body.server.strip() if body.server.strip() else None
    if body.login is not None:
        user.mt5_login = body.login.strip() if body.login.strip() else None
    if body.password is not None:
        if body.password == "":
            user.mt5_password_encrypted = None
        else:
            user.mt5_password_encrypted = encrypt_mt5_secret(body.password)
    db.commit()
    db.refresh(user)
    return _mt5_settings_public(user)


@router.get("/settings/notifications")
def get_notification_settings(user: User = Depends(get_current_user)):
    return merge_notification_prefs(user.notification_prefs)


@router.put("/settings/notifications")
def put_notification_settings(
    body: NotificationsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cur = merge_notification_prefs(user.notification_prefs)
    if body.email is not None:
        cur["email"] = body.email
    if body.push is not None:
        cur["push"] = body.push
    if body.drawdownAlerts is not None:
        cur["drawdownAlerts"] = body.drawdownAlerts
    if body.dailyReport is not None:
        cur["dailyReport"] = body.dailyReport
    user.notification_prefs = cur
    db.commit()
    db.refresh(user)
    return merge_notification_prefs(user.notification_prefs)


@router.post("/notifications/send-daily")
def trigger_daily_email_reports(
    db: Session = Depends(get_db),
    x_cron_secret: Optional[str] = Header(None, alias="X-Cron-Secret"),
):
    """
    Run the same digest as Celery beat (for cron or ops). Requires X-Cron-Secret when
    NOTIFICATIONS_CRON_SECRET is set; if unset, only allowed when DEBUG=true.
    """
    secret = settings.NOTIFICATIONS_CRON_SECRET
    if secret:
        if x_cron_secret != secret:
            raise HTTPException(status_code=403, detail="Invalid X-Cron-Secret")
    elif not settings.DEBUG:
        raise HTTPException(
            status_code=503,
            detail="NOTIFICATIONS_CRON_SECRET not configured (set env or DEBUG=true for dev-only trigger)",
        )
    return run_daily_report_cycle(db)


# ── MT5 Sync ───────────────────────────────────────────────────────────────────


@router.post("/sync/mt5")
async def sync_mt5(
    body: Mt5SyncIn = Body(default_factory=Mt5SyncIn),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync trades from MT5; demo samples only when DEBUG and ALLOW_DEMO_MT5_FALLBACK."""
    db.refresh(user)
    login_i, password, server = _resolve_mt5_credentials(user, body)

    from ...services.mt5_sync import MT5SyncService

    service = MT5SyncService(login_i, password, server)
    connected = service.connect()
    from_date = datetime.now() - timedelta(days=body.days)
    trade_account_id = resolve_owned_account_id(db, user, body.account_id)
    try:
        if connected:
            fetched = service.fetch_trades(from_date=from_date)
        else:
            fetched = []
    finally:
        service.disconnect()

    used_demo_fallback = False
    if not fetched and not connected:
        if settings.ALLOW_DEMO_MT5_FALLBACK and settings.DEBUG:
            fetched = MT5SyncService.demo_sample_trades()
            used_demo_fallback = True
        else:
            raise HTTPException(
                status_code=503,
                detail=(
                    "MT5 terminal unavailable. No trades imported. "
                    "Use a running MT5 terminal with valid credentials, or set "
                    "DEBUG=true and ALLOW_DEMO_MT5_FALLBACK=true for local demo samples only."
                ),
            )

    import_source = "mt5_live" if connected else "mt5_demo"

    uid = user.id
    tickets_q = select(Trade.mt5_ticket).where(
        Trade.user_id == uid,
        Trade.account_id == trade_account_id,
        Trade.mt5_ticket.is_not(None),
    )
    existing_tickets = {x for x in db.execute(tickets_q).scalars().all() if x}

    added = 0
    for tr in fetched:
        mt = str(tr.get("mt5_ticket") or tr.get("ticket") or "")
        if mt and mt in existing_tickets:
            continue
        tid = str(uuid.uuid4())
        row = trade_from_mt5_dict(
            uid,
            tid,
            tr,
            source=import_source,
            account_id=trade_account_id,
        )
        db.add(row)
        if mt:
            existing_tickets.add(mt)
        added += 1

    db.commit()

    status = "success" if connected else "demo"
    message = None
    if connected:
        message = None
    elif used_demo_fallback:
        message = (
            "Demo sample import — not live broker data "
            "(ALLOW_DEMO_MT5_FALLBACK + DEBUG)."
        )
    return {
        "status": status,
        "import_kind": import_source,
        "connected": connected,
        "demo_fallback_used": used_demo_fallback,
        "synced": len(fetched),
        "new": added,
        "message": message,
    }
