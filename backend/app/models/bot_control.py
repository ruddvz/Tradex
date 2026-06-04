"""Global per-user kill switch and pause state."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, func

from .base import Base


class BotControl(Base):
    __tablename__ = "bot_controls"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    kill_switch_active = Column(Boolean, nullable=False, default=False)
    paper_orders_paused = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
