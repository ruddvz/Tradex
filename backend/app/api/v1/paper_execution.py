"""Paper orders, positions, fills — slice 8.2."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.paper_account import PaperAccount
from ...models.paper_fill import PaperFill
from ...models.paper_order import PaperOrder, PaperOrderSide
from ...models.paper_position import PaperPosition, PaperPositionStatus
from ...models.user import User
from ...schemas.paper_execution import (
    PaperFillOut,
    PaperOrderCreate,
    PaperOrderOut,
    PaperPositionClose,
    PaperPositionOut,
)
from ...services.paper_execution import close_paper_position, submit_paper_market_order
from ...services.trade_codec import trade_to_api_dict
from ..deps import get_current_user

router = APIRouter(prefix="/paper", tags=["paper-execution"])


def _order_out(o: PaperOrder) -> PaperOrderOut:
    return PaperOrderOut(
        id=o.id,
        paper_account_id=o.paper_account_id,
        symbol=o.symbol,
        side=o.side.value if hasattr(o.side, "value") else str(o.side),
        order_type=o.order_type.value if hasattr(o.order_type, "value") else str(o.order_type),
        status=o.status.value if hasattr(o.status, "value") else str(o.status),
        requested_price=o.requested_price,
        filled_avg_price=o.filled_avg_price,
        lot_size=o.lot_size,
        stop_loss=o.stop_loss,
        take_profit=o.take_profit,
        rejection_reason=o.rejection_reason,
        created_at=o.created_at,
        filled_at=o.filled_at,
    )


def _position_out(p: PaperPosition) -> PaperPositionOut:
    return PaperPositionOut(
        id=p.id,
        paper_account_id=p.paper_account_id,
        symbol=p.symbol,
        side=p.side.value if hasattr(p.side, "value") else str(p.side),
        lot_size=p.lot_size,
        avg_entry_price=p.avg_entry_price,
        current_price=p.current_price,
        unrealized_pnl=p.unrealized_pnl,
        realized_pnl=p.realized_pnl,
        stop_loss=p.stop_loss,
        take_profit=p.take_profit,
        status=p.status.value if hasattr(p.status, "value") else str(p.status),
        opened_at=p.opened_at,
        closed_at=p.closed_at,
    )


def _fill_out(f: PaperFill) -> PaperFillOut:
    return PaperFillOut(
        id=f.id,
        paper_order_id=f.paper_order_id,
        paper_position_id=f.paper_position_id,
        symbol=f.symbol,
        side=f.side.value if hasattr(f.side, "value") else str(f.side),
        quantity=f.quantity,
        price=f.price,
        slippage=f.slippage,
        spread=f.spread,
        commission=f.commission,
        filled_at=f.filled_at,
    )


def _get_account(db: Session, user_id: str, paper_account_id: str) -> PaperAccount:
    ac = db.execute(
        select(PaperAccount).where(
            PaperAccount.id == paper_account_id,
            PaperAccount.user_id == user_id,
        )
    ).scalar_one_or_none()
    if ac is None:
        raise HTTPException(status_code=404, detail="Paper account not found")
    return ac


@router.get("/orders", response_model=list[PaperOrderOut])
def list_paper_orders(
    paper_account_id: str = Query(..., min_length=8),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_account(db, user.id, paper_account_id)
    rows = db.execute(
        select(PaperOrder)
        .where(
            PaperOrder.paper_account_id == paper_account_id,
            PaperOrder.user_id == user.id,
        )
        .order_by(PaperOrder.created_at.desc())
    ).scalars().all()
    return [_order_out(o) for o in rows]


@router.post("/orders", response_model=dict, status_code=201)
def create_paper_order(
    body: PaperOrderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ac = _get_account(db, user.id, body.paper_account_id)
    try:
        side = PaperOrderSide(body.side.strip().lower())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="side must be buy or sell") from exc

    order, position, err = submit_paper_market_order(
        db,
        user_id=user.id,
        account=ac,
        symbol=body.symbol,
        side=side,
        lot_size=body.lot_size,
        reference_price=body.reference_price,
        stop_loss=body.stop_loss,
        take_profit=body.take_profit,
    )
    if err and position is None:
        return {"order": _order_out(order), "position": None, "error": err}
    return {
        "order": _order_out(order),
        "position": _position_out(position) if position else None,
        "error": err,
    }


@router.get("/positions", response_model=list[PaperPositionOut])
def list_paper_positions(
    paper_account_id: str = Query(..., min_length=8),
    status: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_account(db, user.id, paper_account_id)
    q = select(PaperPosition).where(
        PaperPosition.paper_account_id == paper_account_id,
        PaperPosition.user_id == user.id,
    )
    if status:
        st = status.strip().lower()
        if st == "open":
            q = q.where(PaperPosition.status == PaperPositionStatus.OPEN)
        elif st == "closed":
            q = q.where(PaperPosition.status == PaperPositionStatus.CLOSED)
    rows = db.execute(q.order_by(PaperPosition.opened_at.desc())).scalars().all()
    return [_position_out(p) for p in rows]


@router.post("/positions/{position_id}/close", response_model=dict)
def close_position(
    position_id: str,
    body: PaperPositionClose,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    position = db.execute(
        select(PaperPosition).where(
            PaperPosition.id == position_id,
            PaperPosition.user_id == user.id,
        )
    ).scalar_one_or_none()
    if position is None:
        raise HTTPException(status_code=404, detail="Position not found")
    ac = _get_account(db, user.id, position.paper_account_id)
    trade, err = close_paper_position(
        db,
        user_id=user.id,
        account=ac,
        position=position,
        exit_price=body.exit_price,
    )
    if err:
        raise HTTPException(status_code=400, detail=err)
    return {
        "position": _position_out(position),
        "journal_trade": trade_to_api_dict(trade) if trade else None,
    }


@router.get("/fills", response_model=list[PaperFillOut])
def list_paper_fills(
    paper_account_id: str = Query(..., min_length=8),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_account(db, user.id, paper_account_id)
    rows = db.execute(
        select(PaperFill)
        .join(PaperOrder, PaperFill.paper_order_id == PaperOrder.id)
        .where(
            PaperOrder.paper_account_id == paper_account_id,
            PaperFill.user_id == user.id,
        )
        .order_by(PaperFill.filled_at.desc())
    ).scalars().all()
    return [_fill_out(f) for f in rows]
