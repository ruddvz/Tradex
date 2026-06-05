"""Analytics endpoints derived from user trades."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from ...services.analytics import (
    compute_metrics,
    compute_psychology_stats,
    compute_session_stats,
    compute_symbol_stats,
)
from ..deps import get_current_user
from .api_common import norm_day_end, norm_day_start, resolve_owned_account_id, user_trade_dicts

router = APIRouter(tags=["analytics"])


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
    trades = user_trade_dicts(db, user.id, aid)
    if from_date:
        trades = [
            t for t in trades if t.get("entry_time", "") >= norm_day_start(from_date).isoformat()
        ]
    if to_date:
        trades = [t for t in trades if t.get("entry_time", "") <= norm_day_end(to_date).isoformat()]
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
    return compute_symbol_stats(user_trade_dicts(db, user.id, aid))


@router.get("/analytics/sessions")
async def get_session_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    return compute_session_stats(user_trade_dicts(db, user.id, aid))


@router.get("/analytics/psychology")
async def get_psychology_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    account_id: Optional[str] = None,
):
    aid = account_id
    if aid:
        _ = resolve_owned_account_id(db, user, aid)
    return compute_psychology_stats(user_trade_dicts(db, user.id, aid))


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
    for t in user_trade_dicts(db, user.id, aid):
        day = t.get("entry_time", "")[:10]
        if day >= from_dt:
            daily_pnl[day] = daily_pnl.get(day, {"pnl": 0, "trades": 0})
            daily_pnl[day]["pnl"] += t.get("pnl", 0)
            daily_pnl[day]["trades"] += 1
    return [{"date": k, **v} for k, v in sorted(daily_pnl.items())]
