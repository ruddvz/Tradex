"""User ORM model — persisted in PostgreSQL."""

from __future__ import annotations

import enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, String, func

from .base import Base


class UserPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    plan = Column(SAEnum(UserPlan), nullable=False, default=UserPlan.FREE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
