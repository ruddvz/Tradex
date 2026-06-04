"""Strategy runner unit tests."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.paper_account import PaperAccount
from app.models.strategy import Strategy
from app.models.user import User  # noqa: F401
from app.services.strategy_runner import start_strategy_run, stop_strategy_run, tick_strategy_run


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def _seed(db):
    uid = "u1"
    db.add(User(id=uid, email="s@example.com", hashed_password="x", name="S"))
    sid = str(uuid.uuid4())
    db.add(
        Strategy(
            id=sid,
            user_id=uid,
            name="Breakout",
            symbol="EURUSD",
            rules_json='{"lot_size":0.01,"stop_pips":12,"rr_target":2}',
        )
    )
    aid = str(uuid.uuid4())
    db.add(
        PaperAccount(
            id=aid,
            user_id=uid,
            name="Paper 1",
            starting_balance=100_000,
            balance=100_000,
            equity=100_000,
            currency="USD",
            is_active=True,
        )
    )
    db.commit()
    return uid, sid, aid


def test_start_and_tick_paper_run(db):
    uid, sid, aid = _seed(db)
    run = start_strategy_run(db, user_id=uid, strategy_id=sid, paper_account_id=aid)
    db.commit()
    assert run.status == "running"
    assert run.mode == "paper"

    result = tick_strategy_run(db, user_id=uid, run_id=run.id)
    assert result["action"] in ("filled", "rejected", "skipped")

    stop_strategy_run(db, user_id=uid, run_id=run.id)
    db.commit()
    db.refresh(run)
    assert run.status == "stopped"
