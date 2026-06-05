"""Immutable strategy rule snapshots for backtests and paper runs."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func

from .base import Base


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"
    __table_args__ = (UniqueConstraint("strategy_id", "version_number", name="uq_strategy_version"),)

    id = Column(String, primary_key=True)
    strategy_id = Column(
        String, ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    name = Column(String(120), nullable=False)
    symbol = Column(String(32), nullable=False)
    rules_json = Column(Text, nullable=False)
    change_note = Column(Text, nullable=True)
    status = Column(String(24), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
