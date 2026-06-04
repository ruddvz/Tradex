"""Trading accounts API."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.trading_account import TradingAccount, TradingAccountType
from ...models.user import User
from ..deps import get_current_user
from .api_common import ensure_trading_accounts
from .api_serializers import trading_account_to_dict

router = APIRouter(tags=["accounts"])


class TradingAccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    broker: str | None = None
    account_type: str = "demo"
    base_currency: str = "USD"
    starting_balance: float = Field(default=10000.0, gt=0)
    risk_per_trade_default: float = Field(default=1.0, ge=0.1, le=50)
    max_daily_loss: float | None = Field(default=None, gt=0)
    max_total_drawdown: float | None = None


@router.get("/accounts")
def list_trading_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = ensure_trading_accounts(db, user)
    return {"accounts": [trading_account_to_dict(a) for a in rows]}


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
    return trading_account_to_dict(acc)
