"""Uploaded CSV candle datasets for honest backtests."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from .base import Base


class CandleDataset(Base):
    __tablename__ = "candle_datasets"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    import_batch_id = Column(
        String, ForeignKey("import_batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    symbol = Column(String(32), nullable=False, index=True)
    filename = Column(String(255), nullable=True)
    candle_count = Column(Integer, nullable=False, default=0)
    date_start = Column(String(32), nullable=True)
    date_end = Column(String(32), nullable=True)
    storage_path = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
