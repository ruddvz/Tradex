"""paper account fill assumptions columns

Revision ID: a1b2c3d4e5f6
Revises: f7a8b9c0d1e2
Create Date: 2026-06-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "f7a8b9c0d1e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "paper_accounts",
        sa.Column("fill_spread_multiplier", sa.Float(), nullable=False, server_default="1.0"),
    )
    op.add_column(
        "paper_accounts",
        sa.Column("fill_slippage_factor", sa.Float(), nullable=False, server_default="0.5"),
    )
    op.add_column(
        "paper_accounts",
        sa.Column("fill_commission_per_lot", sa.Float(), nullable=False, server_default="3.5"),
    )
    op.add_column(
        "paper_orders",
        sa.Column("expired_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("paper_orders", "expired_at")
    op.drop_column("paper_accounts", "fill_commission_per_lot")
    op.drop_column("paper_accounts", "fill_slippage_factor")
    op.drop_column("paper_accounts", "fill_spread_multiplier")
