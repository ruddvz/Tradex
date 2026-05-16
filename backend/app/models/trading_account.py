"""User trading accounts (live / demo / paper / prop) for metrics scoping."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Float, String, func

from .base import Base


class TradingAccountType(str, enum.Enum):
    DEMO = "demo"
    LIVE = "live"
    PAPER = "paper"
    PROP = "prop"


class TradingAccount(Base):
    __tablename__ = "trading_accounts"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    broker = Column(String(120))
    account_type = Column(SAEnum(TradingAccountType), nullable=False, default=TradingAccountType.DEMO)
    base_currency = Column(String(8), nullable=False, default="USD")
    starting_balance = Column(Float, nullable=False, default=10000.0)
    current_balance = Column(Float, nullable=False, default=10000.0)
    current_equity = Column(Float, nullable=False, default=10000.0)
    risk_per_trade_default = Column(Float, nullable=False, default=1.0)
    max_daily_loss = Column(Float)
    max_total_drawdown = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
