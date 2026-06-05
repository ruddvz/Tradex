"""Create immutable strategy version snapshots."""

from __future__ import annotations

import json
import uuid
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.strategy import Strategy
from ..models.strategy_version import StrategyVersion


def create_strategy_version(
    db: Session,
    *,
    strategy: Strategy,
    change_note: str | None = None,
    status: str = "draft",
) -> StrategyVersion:
    max_num = db.execute(
        select(func.max(StrategyVersion.version_number)).where(
            StrategyVersion.strategy_id == strategy.id
        )
    ).scalar()
    version_number = int(max_num or 0) + 1
    row = StrategyVersion(
        id=str(uuid.uuid4()),
        strategy_id=strategy.id,
        user_id=strategy.user_id,
        version_number=version_number,
        name=strategy.name,
        symbol=strategy.symbol,
        rules_json=strategy.rules_json,
        change_note=change_note,
        status=status,
    )
    db.add(row)
    db.flush()
    return row


def resolve_rules_from_version(
    db: Session, *, user_id: str, strategy_version_id: str | None, fallback_rules: dict[str, Any]
) -> tuple[dict[str, Any], StrategyVersion | None]:
    if not strategy_version_id:
        return fallback_rules, None
    ver = db.get(StrategyVersion, strategy_version_id)
    if not ver or ver.user_id != user_id:
        raise ValueError("Strategy version not found")
    try:
        rules = json.loads(ver.rules_json)
    except json.JSONDecodeError:
        rules = fallback_rules
    return rules, ver
