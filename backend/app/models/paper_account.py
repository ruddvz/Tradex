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
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
