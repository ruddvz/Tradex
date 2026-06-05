"""Legacy paper routes under /paper/* (distinct from /paper-accounts)."""

from __future__ import annotations

import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.paper import PaperAccount, PaperOrderDirection, PaperTrade
from ...models.user import User
from ...services.paper_service import place_paper_trade
from ...services.trade_codec import parse_iso_datetime
from ..deps import get_current_user
from .api_serializers import paper_account_to_dict

router = APIRouter(tags=["paper-legacy"])

_DEPRECATION = "true; use /api/v1/paper-accounts and /api/v1/paper/orders"


def _deprecate(response) -> None:
    response.headers["Deprecation"] = _DEPRECATION
    response.headers["Link"] = '</api/v1/paper-accounts>; rel="successor-version"'


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
    stop_loss: float | None = None
    take_profit: float | None = None
    entry_time: str
    exit_time: str
    notes: str | None = None


def paper_trade_to_dict(t: PaperTrade) -> Dict[str, Any]:
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
def list_paper_accounts(
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _deprecate(response)
    rows = (
        db.execute(
            select(PaperAccount)
            .where(PaperAccount.user_id == user.id)
            .order_by(PaperAccount.created_at.desc())
        )
        .scalars()
        .all()
    )
    return {"accounts": [paper_account_to_dict(p) for p in rows]}


@router.post("/paper/accounts", status_code=201)
def create_paper_account(
    body: PaperAccountCreate,
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _deprecate(response)
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
    return paper_account_to_dict(row)


@router.get("/paper/trades")
def list_paper_trades(
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    paper_account_id: str = Query(..., min_length=8),
):
    _deprecate(response)
    ac = db.execute(
        select(PaperAccount).where(
            PaperAccount.id == paper_account_id, PaperAccount.user_id == user.id
        )
    ).scalar_one_or_none()
    if ac is None:
        raise HTTPException(status_code=404, detail="Paper account not found")
    rows = (
        db.execute(
            select(PaperTrade)
            .where(PaperTrade.paper_account_id == paper_account_id)
            .order_by(PaperTrade.exit_time.desc())
        )
        .scalars()
        .all()
    )
    return {"trades": [paper_trade_to_dict(t) for t in rows]}


@router.post("/paper/trades", status_code=201)
def create_paper_trade_row(
    body: PaperTradeIn,
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _deprecate(response)
    ac = db.execute(
        select(PaperAccount).where(
            PaperAccount.id == body.paper_account_id, PaperAccount.user_id == user.id
        )
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
    return paper_trade_to_dict(trade)
