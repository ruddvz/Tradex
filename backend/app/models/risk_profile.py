"""Per-user risk limits for paper and future execution."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from .base import Base


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False, default="Default")
    max_risk_per_trade_percent = Column(Float, nullable=False, default=1.0)
    max_daily_loss_percent = Column(Float, nullable=False, default=5.0)
    max_open_positions = Column(Integer, nullable=False, default=5)
    max_positions_per_symbol = Column(Integer, nullable=False, default=2)
    min_rr = Column(Float, nullable=True)
    require_stop_loss = Column(Integer, nullable=False, default=1)
    blocked_symbols = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
