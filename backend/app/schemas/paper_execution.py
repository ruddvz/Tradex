"""Pydantic schemas for paper orders, positions, and fills."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaperOrderCreate(BaseModel):
    paper_account_id: str = Field(min_length=8)
    symbol: str = Field(min_length=2, max_length=32)
    side: str = Field(pattern="^(buy|sell|BUY|SELL)$")
    lot_size: float = Field(gt=0)
    reference_price: float = Field(gt=0, description="Last known or user-supplied price for fill simulation")
    stop_loss: float = Field(gt=0)
    take_profit: Optional[float] = None


class PaperOrderOut(BaseModel):
    id: str
    paper_account_id: str
    symbol: str
    side: str
    order_type: str
    status: str
    requested_price: float
    filled_avg_price: Optional[float] = None
    lot_size: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    rejection_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    filled_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None


class PaperPositionOut(BaseModel):
    id: str
    paper_account_id: str
    symbol: str
    side: str
    lot_size: float
    avg_entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    status: str
    opened_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class PaperPositionClose(BaseModel):
    exit_price: float = Field(gt=0)


class PaperFillOut(BaseModel):
    id: str
    paper_order_id: str
    paper_position_id: Optional[str] = None
    symbol: str
    side: str
    quantity: float
    price: float
    slippage: float
    spread: float
    commission: float
    filled_at: Optional[datetime] = None
