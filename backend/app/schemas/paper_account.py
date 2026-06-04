"""Pydantic schemas for paper accounts API."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PaperAccountCreate(BaseModel):
    name: str = Field(default="Practice account", min_length=1, max_length=200)
    currency: str = Field(default="USD", min_length=3, max_length=8)
    starting_balance: float = Field(default=100_000.0, ge=0)
    max_daily_loss: float = Field(default=500.0, ge=0)
    max_risk_per_trade_percent: float = Field(default=1.0, ge=0.1, le=100)
    is_active: bool = True


class PaperAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    currency: str
    starting_balance: float
    balance: float = 100_000.0
    equity: float = 100_000.0
    max_daily_loss: float = 500.0
    max_risk_per_trade_percent: float = 1.0
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
