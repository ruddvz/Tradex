"""Paper violation logging tests."""

from __future__ import annotations

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.paper_account import PaperAccount  # noqa: F401
from app.models.paper_violation import PaperViolation  # noqa: F401
from app.models.user import User
from app.services.risk_engine import evaluate_paper_order, ensure_default_risk_profile
from app.models.paper_order import PaperOrderSide


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add(
        User(id="u1", email="v@example.com", hashed_password="x", name="V")
    )
    session.commit()
    yield session
    session.close()


def test_risk_block_creates_violation_row(db):
    ensure_default_risk_profile(db, "u1")
    db.commit()
    ok, reason = evaluate_paper_order(
        db,
        user_id="u1",
        symbol="EURUSD",
        side=PaperOrderSide.BUY,
        lot_size=10.0,
        entry_price=1.09,
        stop_loss=1.08,
        account_balance=1000.0,
        open_positions_count=0,
        open_positions_same_symbol=0,
        risk_at_stop_dollars=50_000.0,
        paper_account_id="pa1",
    )
    db.commit()
    assert ok is False
    assert reason
    rows = db.execute(select(PaperViolation).where(PaperViolation.user_id == "u1")).scalars().all()
    assert len(rows) >= 1
    assert rows[0].violation_type == "ORDER_BLOCKED_RISK_PER_TRADE"
