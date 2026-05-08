"""Prop firm challenge ORM — stored per user."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func

from .base import Base


class PropChallenge(Base):
    __tablename__ = "prop_challenges"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    firm = Column(String(255), nullable=False)
    account_size = Column(Float, nullable=False)
    profit_target = Column(Float, nullable=False)
    max_drawdown = Column(Float, nullable=False)
    daily_drawdown = Column(Float, nullable=False)
    min_trading_days = Column(Integer, nullable=False, default=10)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    current_pnl = Column(Float, nullable=False, default=0)
    current_drawdown = Column(Float, nullable=False, default=0)
    daily_loss = Column(Float, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active")
    trades_count = Column("trades", Integer, nullable=False, default=0)
    days_traded = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
