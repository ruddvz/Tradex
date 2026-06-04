"""Trade CRUD and screenshot upload."""

from __future__ import annotations

from pathlib import Path
from typing import List, Literal, Optional
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy import and_, func as sql_func, select
from sqlalchemy.orm import Session

from ...core.config import settings
from ...database import get_db
from ...models.trade import Trade, TradeStatus
from ...models.user import User
from ...services.trade_codec import (
    compute_grade_and_rr,
    direction_from_str,
    grade_from_str,
    parse_iso_datetime,
    status_from_str,
    trade_to_api_dict,
)
from ..deps import get_current_user
from .api_common import norm_day_end, norm_day_start, resolve_owned_account_id

router = APIRouter(tags=["trades"])

_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
_MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024


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


class TradeUpdate(BaseModel):
    strategy: Optional[str] = None
    session: Optional[str] = None
    emotion: Optional[str] = None
    emotion_score: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    grade: Optional[str] = None


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
        conditions.append(Trade.entry_time >= norm_day_start(from_date))
    if to_date:
        conditions.append(Trade.entry_time <= norm_day_end(to_date))

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
async def create_trade(
    trade: TradeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
async def get_trade(
    trade_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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
async def delete_trade(
    trade_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trade = db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.user_id == user.id)
    ).scalar_one_or_none()
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()


@router.post("/trades/{trade_id}/screenshot")
async def upload_trade_screenshot(
    trade_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    slot: Literal["before", "after"] = Query("before"),
    file: UploadFile = File(...),
):
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
