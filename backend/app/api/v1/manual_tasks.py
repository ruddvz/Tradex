"""Manual tasks (Action Center) API."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.manual_task import ManualTask
from ...models.user import User
from ...schemas.manual_task import ManualTaskCreate, ManualTaskOut, ManualTaskUpdate
from ...services.manual_tasks_seed import ensure_default_manual_tasks
from ..deps import get_current_user

router = APIRouter()


def _get_owned_task(db: Session, user_id: str, task_id: str) -> ManualTask:
    row = db.execute(
        select(ManualTask).where(ManualTask.id == task_id, ManualTask.user_id == user_id)
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return row


def _out(row: ManualTask) -> ManualTaskOut:
    return ManualTaskOut.model_validate(row)


@router.get("", response_model=list[ManualTaskOut])
def list_manual_tasks(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    categories: Optional[str] = Query(
        None,
        description="Comma-separated categories (e.g. initial_setup,risk)",
    ),
):
    stmt = select(ManualTask).where(ManualTask.user_id == user.id).order_by(
        ManualTask.created_at.asc(),
    )
    if category:
        stmt = stmt.where(ManualTask.category == category)
    if categories:
        parts = [c.strip() for c in categories.split(",") if c.strip()]
        if parts:
            stmt = stmt.where(ManualTask.category.in_(parts))
    if status:
        stmt = stmt.where(ManualTask.status == status)
    if priority:
        stmt = stmt.where(ManualTask.priority == priority)

    rows = db.execute(stmt).scalars().all()

    def _sort_key(r: ManualTask) -> tuple[int, datetime]:
        pr = {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(r.priority, 9)
        c = r.created_at
        if c is None:
            t = datetime(1970, 1, 1, tzinfo=timezone.utc)
        elif c.tzinfo is None:
            t = c.replace(tzinfo=timezone.utc)
        else:
            t = c
        return (pr, t)

    rows_sorted = sorted(rows, key=_sort_key)
    return [_out(r) for r in rows_sorted]


@router.post("/generate-defaults")
def generate_default_manual_tasks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ensure_default_manual_tasks(db, user.id)


@router.post("", status_code=201, response_model=ManualTaskOut)
def create_manual_task(
    body: ManualTaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = ManualTask(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=body.title.strip(),
        description=body.description,
        category=body.category.strip(),
        priority=body.priority,
        status=body.status,
        checklist=[c.model_dump() for c in body.checklist],
        action_type=body.action_type,
        action_payload=body.action_payload,
        due_at=body.due_at,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.get("/{task_id}", response_model=ManualTaskOut)
def get_manual_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _get_owned_task(db, user.id, task_id)
    return _out(row)


@router.patch("/{task_id}", response_model=ManualTaskOut)
def patch_manual_task(
    task_id: str,
    body: ManualTaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _get_owned_task(db, user.id, task_id)
    data = body.model_dump(exclude_none=True)
    if "checklist" in data and body.checklist is not None:
        data["checklist"] = [c.model_dump() for c in body.checklist]
    for k, v in data.items():
        if hasattr(row, k):
            setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return _out(row)


@router.delete("/{task_id}", status_code=204)
def delete_manual_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _get_owned_task(db, user.id, task_id)
    db.delete(row)
    db.commit()


@router.post("/{task_id}/complete", response_model=ManualTaskOut)
def complete_manual_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _get_owned_task(db, user.id, task_id)
    now = datetime.now(timezone.utc)
    row.status = "done"
    row.completed_at = now
    db.commit()
    db.refresh(row)
    return _out(row)


@router.post("/{task_id}/skip", response_model=ManualTaskOut)
def skip_manual_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = _get_owned_task(db, user.id, task_id)
    now = datetime.now(timezone.utc)
    row.status = "skipped"
    row.completed_at = now
    db.commit()
    db.refresh(row)
    return _out(row)
