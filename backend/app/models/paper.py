"""Paper trading — virtual accounts and closed simulated trades."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, func

from .base import Base


class PaperOrderDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class PaperAccount(Base):
    __tablename__ = "paper_accounts"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    currency = Column(String(8), nullable=False, default="USD")
    balance = Column(Float, nullable=False)
    equity = Column(Float, nullable=False)
    max_daily_loss = Column(Float, nullable=False, default=500.0)
    max_risk_per_trade_percent = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaperTrade(Base):
    """One closed round-trip simulated trade."""

    __tablename__ = "paper_trades"

    id = Column(String, primary_key=True)
    paper_account_id = Column(String, ForeignKey("paper_accounts.id"), nullable=False, index=True)
    symbol = Column(String(32), nullable=False)
    direction = Column(SAEnum(PaperOrderDirection), nullable=False)
    lot_size = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    entry_time = Column(DateTime, nullable=False)
    exit_time = Column(DateTime, nullable=False)
    pnl = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
