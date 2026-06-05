"""Paper order lifecycle (pending → filled / rejected)."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Float, ForeignKey, String, Text, func

from .base import Base


class PaperOrderSide(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"


class PaperOrderType(str, enum.Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"


class PaperOrderStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    # Legacy alias kept for existing rows
    PENDING = "pending"


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    paper_account_id = Column(String, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(32), nullable=False)
    side = Column(SAEnum(PaperOrderSide), nullable=False)
    order_type = Column(SAEnum(PaperOrderType), nullable=False, default=PaperOrderType.MARKET)
    status = Column(SAEnum(PaperOrderStatus), nullable=False, default=PaperOrderStatus.PENDING)
    requested_price = Column(Float, nullable=False)
    filled_avg_price = Column(Float)
    lot_size = Column(Float, nullable=False)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    rejection_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True))
    filled_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    expired_at = Column(DateTime(timezone=True))
