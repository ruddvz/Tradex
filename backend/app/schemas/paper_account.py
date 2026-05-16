"""Pydantic schemas for paper accounts API."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PaperAccountCreate(BaseModel):
    name: str = Field(default="Practice account", min_length=1, max_length=200)
    currency: str = Field(default="USD", min_length=3, max_length=8)
    starting_balance: float = Field(default=100_000.0, ge=0)
    is_active: bool = True


class PaperAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    currency: str
    starting_balance: float
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
