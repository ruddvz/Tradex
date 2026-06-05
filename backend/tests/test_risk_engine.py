"""Risk engine and kill switch tests."""

from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.paper_account import PaperAccount  # noqa: F401
from app.models.paper_order import PaperOrderSide
from app.models.paper_violation import PaperViolation  # noqa: F401
from app.models.user import User  # noqa: F401
from app.services.risk_engine import (
    ensure_default_risk_profile,
    evaluate_paper_order,
    get_or_create_bot_control,
)


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def _seed_user(db):
    u = User(
        id="u1",
        email="t@example.com",
        hashed_password="x",
        name="Test",
    )
    db.add(u)
    db.commit()


def test_kill_switch_blocks_order(db):
    _seed_user(db)
    ensure_default_risk_profile(db, "u1")
    c = get_or_create_bot_control(db, "u1")
    c.kill_switch_active = True
    db.commit()

    ok, reason = evaluate_paper_order(
        db,
        user_id="u1",
        symbol="EURUSD",
        side=PaperOrderSide.BUY,
        lot_size=0.01,
        entry_price=1.09,
        stop_loss=1.08,
        account_balance=10_000,
        open_positions_count=0,
        open_positions_same_symbol=0,
        risk_at_stop_dollars=50,
    )
    assert ok is False
    assert reason and "Kill switch" in reason


def test_default_profile_allows_small_risk(db):
    _seed_user(db)
    ensure_default_risk_profile(db, "u1")
    db.commit()

    ok, reason = evaluate_paper_order(
        db,
        user_id="u1",
        symbol="EURUSD",
        side=PaperOrderSide.BUY,
        lot_size=0.01,
        entry_price=1.09,
        stop_loss=1.08,
        account_balance=10_000,
        open_positions_count=0,
        open_positions_same_symbol=0,
        risk_at_stop_dollars=50,
    )
    assert ok is True
    assert reason is None
