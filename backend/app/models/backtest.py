"""Backtest run snapshots (trades, equity, metrics stored as JSON)."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text, func

from .base import Base


class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id = Column(String, ForeignKey("strategies.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(160), nullable=False)
    symbol = Column(String(32), nullable=False, default="EURUSD")
    status = Column(String(32), nullable=False, default="completed")
    starting_balance = Column(Float, nullable=False, default=100_000.0)
    assumptions_json = Column(Text, nullable=True)
    metrics_json = Column(Text, nullable=True)
    trades_json = Column(Text, nullable=True)
    equity_curve_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
