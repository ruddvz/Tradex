"""Individual paper fills tied to orders and positions."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy import Enum as SAEnum

from .base import Base
from .paper_order import PaperOrderSide


class PaperFill(Base):
    __tablename__ = "paper_fills"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    paper_order_id = Column(
        String, ForeignKey("paper_orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    paper_position_id = Column(
        String, ForeignKey("paper_positions.id", ondelete="SET NULL"), index=True
    )
    symbol = Column(String(32), nullable=False)
    side = Column(SAEnum(PaperOrderSide), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    slippage = Column(Float, nullable=False, default=0.0)
    spread = Column(Float, nullable=False, default=0.0)
    commission = Column(Float, nullable=False, default=0.0)
    filled_at = Column(DateTime(timezone=True), server_default=func.now())
