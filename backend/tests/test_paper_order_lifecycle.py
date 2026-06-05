"""Paper order state transitions: submitted → accepted → filled / rejected."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.paper_account import PaperAccount
from app.models.paper_order import PaperOrderSide, PaperOrderStatus
from app.models.user import User  # noqa: F401
from app.services.paper_execution import submit_paper_market_order


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
        fill_spread_multiplier=1.0,
        fill_slippage_factor=0.5,
        fill_commission_per_lot=3.5,
        is_active=True,
    )
    defaults.update(kwargs)
    return PaperAccount(**defaults)


def test_market_order_lifecycle_filled(db):
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
    assert order.status == PaperOrderStatus.FILLED
    assert order.submitted_at is not None
    assert order.filled_at is not None


def test_market_order_lifecycle_rejected(db):
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
        stop_loss=None,
        take_profit=1.12,
    )
    assert err is not None
    assert position is None
    assert order.status == PaperOrderStatus.REJECTED
    assert order.submitted_at is not None
