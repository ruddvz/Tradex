from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from .base import Base


class TradeDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class TradeStatus(str, enum.Enum):
    WIN = "WIN"
    LOSS = "LOSS"
    BREAKEVEN = "BREAKEVEN"


class TradeGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class Trade(Base):
    __tablename__ = "trades"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    account_id = Column(String, index=True)

    # Core trade data
    symbol = Column(String(20), nullable=False, index=True)
    direction = Column(SAEnum(TradeDirection), nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float)
    lot_size = Column(Float, nullable=False)
    entry_time = Column(DateTime, nullable=False, index=True)
    exit_time = Column(DateTime)

    # P&L
    pnl = Column(Float, default=0)
    pnl_percent = Column(Float, default=0)
    r_multiple = Column(Float, default=0)
    commission = Column(Float, default=0)
    swap = Column(Float, default=0)

    # Risk
    stop_loss = Column(Float)
    take_profit = Column(Float)
    risk_reward = Column(Float)
    max_drawdown = Column(Float, default=0)

    # Classification
    strategy = Column(String(100))
    session = Column(String(50))
    setup = Column(String(100))
    status = Column(SAEnum(TradeStatus))
    grade = Column(SAEnum(TradeGrade))

    # Psychology
    emotion = Column(String(50))
    emotion_score = Column(Integer, default=5)

    # Journal
    notes = Column(Text)
    tags = Column(JSON, default=list)
    screenshot_url = Column(String)  # legacy single URL
    screenshot_before_url = Column(String)
    screenshot_after_url = Column(String)

    # Meta
    duration = Column(Integer, default=0)  # minutes
    broker = Column(String(100))
    mt5_ticket = Column(String, index=True)  # scoped per user in app logic; no global unique (multi-tenant)

    source = Column(String(32), nullable=False, default="manual", index=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "direction": self.direction,
            "entry_price": self.entry_price,
            "exit_price": self.exit_price,
            "lot_size": self.lot_size,
            "entry_time": self.entry_time.isoformat() if self.entry_time else None,
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "pnl": self.pnl,
            "pnl_percent": self.pnl_percent,
            "r_multiple": self.r_multiple,
            "commission": self.commission,
            "stop_loss": self.stop_loss,
            "take_profit": self.take_profit,
            "strategy": self.strategy,
            "session": self.session,
            "status": self.status,
            "grade": self.grade,
            "emotion": self.emotion,
            "emotion_score": self.emotion_score,
            "notes": self.notes,
            "tags": self.tags or [],
            "duration": self.duration,
            "broker": self.broker,
        }
