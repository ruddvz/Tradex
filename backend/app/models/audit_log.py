"""Risk and safety audit events."""

from sqlalchemy import Column, DateTime, String, Text, func

from .base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64))
    event_type = Column(String(64), nullable=False, index=True)
    severity = Column(String(16), nullable=False, default="info")
    message = Column(Text, nullable=False)
    metadata_json = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
