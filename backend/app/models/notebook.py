"""Notebook entry ORM — stored per user."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, JSON, String, Text, func

from .base import Base


class NotebookEntry(Base):
    __tablename__ = "notebook_entries"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    entry_type = Column(String(50), nullable=False, default="note")
    tags = Column(JSON, default=list)
    pinned = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
