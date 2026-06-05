"""Import batch listing API."""

from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.import_batch import ImportBatch
from ...models.user import User
from ..deps import get_current_user

router = APIRouter(prefix="/imports", tags=["imports"])


class ImportBatchOut(BaseModel):
    id: str
    source: str
    source_account_id: Optional[str] = None
    status: str
    records_seen: int
    records_inserted: int
    records_updated: int
    records_skipped_duplicate: int
    records_failed: int
    warnings: list[str] = []
    summary: dict[str, Any] = {}
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


def _parse_json(raw: Optional[str], default: Any) -> Any:
    if not raw:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


def _batch_out(row: ImportBatch) -> ImportBatchOut:
    return ImportBatchOut(
        id=row.id,
        source=row.source,
        source_account_id=row.source_account_id,
        status=row.status,
        records_seen=row.records_seen or 0,
        records_inserted=row.records_inserted or 0,
        records_updated=row.records_updated or 0,
        records_skipped_duplicate=row.records_skipped_duplicate or 0,
        records_failed=row.records_failed or 0,
        warnings=_parse_json(row.warnings_json, []),
        summary=_parse_json(row.raw_summary_json, {}),
        started_at=row.started_at.isoformat() if row.started_at else None,
        completed_at=row.completed_at.isoformat() if row.completed_at else None,
    )


@router.get("/batches", response_model=list[ImportBatchOut])
def list_import_batches(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.execute(
            select(ImportBatch)
            .where(ImportBatch.user_id == user.id)
            .order_by(ImportBatch.started_at.desc())
            .limit(50)
        )
        .scalars()
        .all()
    )
    return [_batch_out(r) for r in rows]


@router.get("/batches/{batch_id}", response_model=ImportBatchOut)
def get_import_batch(
    batch_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(ImportBatch, batch_id)
    if not row or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Import batch not found")
    return _batch_out(row)
