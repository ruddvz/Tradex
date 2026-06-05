"""Import batch audit trail for MT5 sync, CSV trades, CSV candles."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from .base import Base


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(32), nullable=False, index=True)
    source_account_id = Column(
        String, ForeignKey("trading_accounts.id", ondelete="SET NULL"), nullable=True
    )
    status = Column(String(24), nullable=False, default="running")
    records_seen = Column(Integer, nullable=False, default=0)
    records_inserted = Column(Integer, nullable=False, default=0)
    records_updated = Column(Integer, nullable=False, default=0)
    records_skipped_duplicate = Column(Integer, nullable=False, default=0)
    records_failed = Column(Integer, nullable=False, default=0)
    warnings_json = Column(Text, nullable=True)
    raw_summary_json = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
