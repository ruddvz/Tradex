"""Unit tests for paper order risk gates and fill simulator."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.paper_account import PaperAccount
from app.models.paper_order import PaperOrderSide
from app.models.user import User  # noqa: F401
from app.services.fill_simulator import simulate_market_fill
from app.services.paper_execution import evaluate_paper_order_risk, submit_paper_market_order


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def _account(**kwargs) -> PaperAccount:
    defaults = dict(
        id=str(uuid.uuid4()),
        user_id="user-1",
        name="Test",
        currency="USD",
        starting_balance=10_000.0,
        balance=10_000.0,
        equity=10_000.0,
        max_daily_loss=500.0,
        max_risk_per_trade_percent=1.0,
        is_active=True,
    )
    defaults.update(kwargs)
    return PaperAccount(**defaults)


def test_simulate_market_fill_adds_spread():
    q = simulate_market_fill(symbol="EURUSD", side="buy", reference_price=1.0, lot_size=0.1)
    assert q.fill_price > 1.0
    assert q.commission > 0


def test_risk_blocks_missing_stop_loss(db):
    ac = _account()
    db.add(ac)
    db.commit()
    err = evaluate_paper_order_risk(
        ac,
        user_id="user-1",
        symbol="EURUSD",
        side=PaperOrderSide.BUY,
        entry_price=1.09,
        stop_loss=None,
        lot_size=0.1,
        db=db,
    )
    assert err is not None
    assert "Stop loss" in err


def test_submit_order_creates_position(db):
    ac = _account()
    db.add(ac)
    db.commit()
    order, position, err = submit_paper_market_order(
        db,
        user_id="user-1",
        account=ac,
        symbol="EURUSD",
        side=PaperOrderSide.BUY,
        lot_size=0.01,
        reference_price=1.09,
        stop_loss=1.08,
        take_profit=1.12,
    )
    assert err is None
    assert order is not None
    assert position is not None
    assert order.status.value == "filled"
    db.refresh(ac)
    assert ac.balance == 10_000.0  # unrealized until close
