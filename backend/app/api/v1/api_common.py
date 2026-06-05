"""Shared helpers for v1 trade and analytics routes."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...models.trade import Trade
from ...models.trading_account import TradingAccount, TradingAccountType
from ...models.user import User
from ...services.trade_codec import parse_iso_datetime, trade_to_api_dict


def norm_day_start(s: str) -> datetime:
    raw = s.strip()
    if len(raw) == 10:
        raw = raw + "T00:00:00"
    dt = parse_iso_datetime(raw)
    return dt or datetime.min


def norm_day_end(s: str) -> datetime:
    raw = s.strip()
    if len(raw) == 10:
        raw = raw + "T23:59:59"
    dt = parse_iso_datetime(raw)
    return dt or datetime.max


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


def user_trade_dicts(
    db: Session,
    user_id: str,
    account_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    stmt = select(Trade).where(Trade.user_id == user_id)
    if account_id:
        stmt = stmt.where(Trade.account_id == account_id)
    rows = db.execute(stmt.order_by(Trade.entry_time.desc())).scalars().all()
    return [trade_to_api_dict(t) for t in rows]
