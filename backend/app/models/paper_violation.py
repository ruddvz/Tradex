"""Dedicated paper trading rule violations (distinct from generic audit log)."""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func

from .base import Base


class PaperViolation(Base):
    __tablename__ = "paper_violations"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_account_id = Column(
        String, ForeignKey("paper_accounts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    paper_order_id = Column(String, nullable=True, index=True)
    violation_type = Column(String(64), nullable=False)
    reason = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False, default="warning")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
