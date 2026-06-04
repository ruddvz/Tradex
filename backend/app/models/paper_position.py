"""Open / closed paper positions."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Float, ForeignKey, String, func

from .base import Base
from .paper_order import PaperOrderSide


class PaperPositionStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"


class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    paper_account_id = Column(String, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(32), nullable=False)
    side = Column(SAEnum(PaperOrderSide), nullable=False)
    lot_size = Column(Float, nullable=False)
    avg_entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    unrealized_pnl = Column(Float, nullable=False, default=0.0)
    realized_pnl = Column(Float, nullable=False, default=0.0)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    status = Column(SAEnum(PaperPositionStatus), nullable=False, default=PaperPositionStatus.OPEN)
    opened_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True))
