"""User-defined playbooks (strategy playbooks persisted in DB)."""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.types import JSON

from .base import Base


class Playbook(Base):
    __tablename__ = "playbooks"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    playbook_type = Column(String(32), nullable=False, default="strategy")
    description = Column(Text, nullable=False, default="")
    rules = Column(JSON, nullable=False, default=list)
    strategy_tag = Column(String(100), nullable=True, index=True)
    tags = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
