"""Simulated paper trading accounts (Sprint 4 foundation)."""

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, func

from .base import Base


class PaperAccount(Base):
    __tablename__ = "paper_accounts"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    currency = Column(String(8), nullable=False, default="USD")
    starting_balance = Column(Float, nullable=False, default=100_000.0)
    balance = Column(Float, nullable=False, default=100_000.0)
    equity = Column(Float, nullable=False, default=100_000.0)
    max_daily_loss = Column(Float, nullable=False, default=500.0)
    max_risk_per_trade_percent = Column(Float, nullable=False, default=1.0)
    fill_spread_multiplier = Column(Float, nullable=False, default=1.0)
    fill_slippage_factor = Column(Float, nullable=False, default=0.5)
    fill_commission_per_lot = Column(Float, nullable=False, default=3.5)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
