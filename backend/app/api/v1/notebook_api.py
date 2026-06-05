"""Notebook CRUD."""

from __future__ import annotations

import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.notebook import NotebookEntry
from ...models.user import User
from ..deps import get_current_user
from .api_serializers import notebook_to_dict

router = APIRouter(tags=["notebook"])


class NotebookEntryIn(BaseModel):
    title: str
    content: str
    type: str = "note"
    tags: List[str] = []
    pinned: bool = False


@router.get("/notebook")
async def get_notebook(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(NotebookEntry)
            .where(NotebookEntry.user_id == user.id)
            .order_by(NotebookEntry.pinned.desc(), NotebookEntry.updated_at.desc())
        )
        .scalars()
        .all()
    )
    return {"entries": [notebook_to_dict(n) for n in rows]}


@router.post("/notebook", status_code=201)
async def create_note(
    entry: NotebookEntryIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    payload = entry.model_dump()
    row = NotebookEntry(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=payload["title"],
        content=payload["content"],
        entry_type=payload["type"],
        tags=payload.get("tags") or [],
        pinned=payload.get("pinned") or False,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return notebook_to_dict(row)


@router.patch("/notebook/{entry_id}")
async def update_note(
    entry_id: str,
    updates: Dict[str, Any] = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(
        select(NotebookEntry).where(NotebookEntry.id == entry_id, NotebookEntry.user_id == user.id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")

    allowed = {"title", "content", "tags", "pinned", "type"}
    for k, v in updates.items():
        if k not in allowed:
            continue
        if k == "type":
            row.entry_type = v
        elif k == "tags":
            row.tags = v
        elif k == "pinned":
            row.pinned = bool(v)
        elif k in ("title", "content"):
            setattr(row, k, v)

    db.commit()
    db.refresh(row)
    return notebook_to_dict(row)


@router.delete("/notebook/{entry_id}", status_code=204)
async def delete_note(
    entry_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    row = db.execute(
        select(NotebookEntry).where(NotebookEntry.id == entry_id, NotebookEntry.user_id == user.id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(row)
    db.commit()
