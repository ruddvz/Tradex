"""User-defined strategy definitions for backtesting."""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func

from .base import Base


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    symbol = Column(String(32), nullable=False, default="EURUSD")
    rules_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
