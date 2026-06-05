"""Paper (or future) strategy execution runs."""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func

from .base import Base


class StrategyRun(Base):
    __tablename__ = "strategy_runs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    strategy_id = Column(
        String, ForeignKey("strategies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    paper_account_id = Column(
        String, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    strategy_version_id = Column(String, nullable=True, index=True)
    mode = Column(String(16), nullable=False, default="paper")
    status = Column(String(24), nullable=False, default="running")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    stopped_at = Column(DateTime(timezone=True), nullable=True)
    config_snapshot_json = Column(Text, nullable=True)
    result_summary_json = Column(Text, nullable=True)
