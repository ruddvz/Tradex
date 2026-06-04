"""playbooks and paper_violations tables

Revision ID: f7a8b9c0d1e2
Revises: 6bcb32ddfb52
Create Date: 2026-06-04 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f7a8b9c0d1e2"
down_revision: Union[str, None] = "6bcb32ddfb52"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "playbooks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("playbook_type", sa.String(length=32), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("rules", sa.JSON(), nullable=False),
        sa.Column("strategy_tag", sa.String(length=100), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_playbooks_user_id"), "playbooks", ["user_id"], unique=False)
    op.create_index(op.f("ix_playbooks_strategy_tag"), "playbooks", ["strategy_tag"], unique=False)

    op.create_table(
        "paper_violations",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("paper_account_id", sa.String(), nullable=True),
        sa.Column("paper_order_id", sa.String(), nullable=True),
        sa.Column("violation_type", sa.String(length=64), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=True),
        sa.ForeignKeyConstraint(["paper_account_id"], ["paper_accounts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_paper_violations_user_id"), "paper_violations", ["user_id"], unique=False)
    op.create_index(op.f("ix_paper_violations_paper_account_id"), "paper_violations", ["paper_account_id"], unique=False)
    op.create_index(op.f("ix_paper_violations_paper_order_id"), "paper_violations", ["paper_order_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_paper_violations_paper_order_id"), table_name="paper_violations")
    op.drop_index(op.f("ix_paper_violations_paper_account_id"), table_name="paper_violations")
    op.drop_index(op.f("ix_paper_violations_user_id"), table_name="paper_violations")
    op.drop_table("paper_violations")
    op.drop_index(op.f("ix_playbooks_strategy_tag"), table_name="playbooks")
    op.drop_index(op.f("ix_playbooks_user_id"), table_name="playbooks")
    op.drop_table("playbooks")
