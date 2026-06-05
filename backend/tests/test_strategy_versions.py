"""Strategy version immutability tests."""

from __future__ import annotations

import json

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.strategy import Strategy
from app.models.strategy_version import StrategyVersion  # noqa: F401
from app.models.user import User
from app.services.strategy_versions import create_strategy_version


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add(User(id="u1", email="v@example.com", hashed_password="x", name="V"))
    session.commit()
    yield session
    session.close()


def test_create_strategy_version_increments(db):
    strat = Strategy(
        id="strat-1",
        user_id="u1",
        name="Test",
        symbol="EURUSD",
        rules_json=json.dumps({"lookback": 10}),
    )
    db.add(strat)
    db.flush()
    v1 = create_strategy_version(db, strategy=strat, change_note="v1")
    strat.rules_json = json.dumps({"lookback": 12})
    v2 = create_strategy_version(db, strategy=strat, change_note="v2")
    assert v1.version_number == 1
    assert v2.version_number == 2
    assert json.loads(v1.rules_json)["lookback"] == 10
    assert json.loads(v2.rules_json)["lookback"] == 12
