"""Pydantic schemas for manual tasks API."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChecklistItemIn(BaseModel):
    id: str
    label: str
    completed: bool = False


class ManualTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    category: str = Field(min_length=1, max_length=64)
    priority: Literal["critical", "high", "medium", "low"] = "medium"
    status: Literal["not_started", "in_progress", "blocked", "done", "skipped", "failed"] = "not_started"
    checklist: list[ChecklistItemIn] = Field(default_factory=list)
    action_type: Optional[Literal["internal_route", "external_url", "command", "manual"]] = None
    action_payload: Optional[dict[str, Any]] = None
    due_at: Optional[datetime] = None
    notes: Optional[str] = None


class ManualTaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=64)
    priority: Optional[Literal["critical", "high", "medium", "low"]] = None
    status: Optional[Literal["not_started", "in_progress", "blocked", "done", "skipped", "failed"]] = None
    checklist: Optional[list[ChecklistItemIn]] = None
    action_type: Optional[Literal["internal_route", "external_url", "command", "manual"]] = None
    action_payload: Optional[dict[str, Any]] = None
    due_at: Optional[datetime] = None
    notes: Optional[str] = None


class ManualTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    status: str
    checklist: list[dict[str, Any]] = Field(default_factory=list)
    action_type: Optional[str] = None
    action_payload: Optional[dict[str, Any]] = None
    due_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
