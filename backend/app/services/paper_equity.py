"""Mark-to-market equity for paper accounts."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.paper_account import PaperAccount
from ..models.paper_order import PaperOrderSide
from ..models.paper_position import PaperPosition, PaperPositionStatus

_PNL_UNIT = 100.0


def unrealized_pnl_for_position(position: PaperPosition, mark_price: float | None = None) -> float:
    price = mark_price if mark_price is not None else position.current_price
    if position.side == PaperOrderSide.BUY:
        gross = (price - position.avg_entry_price) * position.lot_size * _PNL_UNIT
    else:
        gross = (position.avg_entry_price - price) * position.lot_size * _PNL_UNIT
    return round(gross, 2)


def refresh_open_position_marks(db: Session, paper_account_id: str) -> None:
    """Refresh unrealized PnL on open positions (mark = last current_price)."""
    rows = db.execute(
        select(PaperPosition).where(
            PaperPosition.paper_account_id == paper_account_id,
            PaperPosition.status == PaperPositionStatus.OPEN,
        )
    ).scalars().all()
    for pos in rows:
        pos.unrealized_pnl = unrealized_pnl_for_position(pos)


def refresh_paper_account_equity(db: Session, account: PaperAccount) -> None:
    refresh_open_position_marks(db, account.id)
    unrealized = sum(
        p.unrealized_pnl
        for p in db.execute(
            select(PaperPosition).where(
                PaperPosition.paper_account_id == account.id,
                PaperPosition.status == PaperPositionStatus.OPEN,
            )
        ).scalars().all()
    )
    account.equity = round(account.balance + unrealized, 2)
