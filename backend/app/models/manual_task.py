"""Per-user manual / setup tasks (Action Center)."""

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String, Text, func

from .base import Base


class ManualTask(Base):
    __tablename__ = "manual_tasks"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    category = Column(String(64), nullable=False, index=True)
    priority = Column(String(32), nullable=False, default="medium")
    status = Column(String(32), nullable=False, default="not_started", index=True)
    checklist = Column(JSON, nullable=False, default=list)
    action_type = Column(String(32))
    action_payload = Column(JSON)
    due_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
