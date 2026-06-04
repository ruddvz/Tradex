"""Playbooks service tests."""

from __future__ import annotations

import uuid
from datetime import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.playbook import Playbook
from app.models.trade import Trade, TradeDirection, TradeStatus
from app.models.user import User
from app.services.playbook_stats import stats_from_trades, trades_for_strategy


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add(User(id="u1", email="pb@example.com", hashed_password="x", name="PB"))
    session.commit()
    yield session
    session.close()


def test_stats_from_trades_and_strategy_filter(db):
    t1 = Trade(
        id=str(uuid.uuid4()),
        user_id="u1",
        symbol="EURUSD",
        direction=TradeDirection.BUY,
        entry_price=1.0,
        exit_price=1.01,
        lot_size=0.1,
        entry_time=datetime(2026, 1, 1, 10, 0),
        exit_time=datetime(2026, 1, 1, 11, 0),
        pnl=100.0,
        status=TradeStatus.WIN,
        r_multiple=2.0,
        strategy="London Breakout",
        source="manual",
    )
    t2 = Trade(
        id=str(uuid.uuid4()),
        user_id="u1",
        symbol="GBPUSD",
        direction=TradeDirection.SELL,
        entry_price=1.2,
        exit_price=1.21,
        lot_size=0.1,
        entry_time=datetime(2026, 1, 2, 10, 0),
        exit_time=datetime(2026, 1, 2, 11, 0),
        pnl=-50.0,
        status=TradeStatus.LOSS,
        r_multiple=-1.0,
        strategy="Other",
        source="manual",
    )
    db.add_all([t1, t2])
    db.commit()

    filtered = trades_for_strategy(db, "u1", "London Breakout")
    assert len(filtered) == 1
    stats = stats_from_trades(filtered)
    assert stats["trades"] == 1
    assert stats["profit"] == 100.0

    row = Playbook(
        id=str(uuid.uuid4()),
        user_id="u1",
        name="London Breakout",
        playbook_type="strategy",
        description="Rules",
        rules=["Rule 1"],
        strategy_tag="London Breakout",
        tags=[],
    )
    db.add(row)
    db.commit()
    assert db.get(Playbook, row.id) is not None
