"""P1 import batches, strategy versions, candle datasets

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-05 18:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "import_batches",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("source_account_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("records_seen", sa.Integer(), nullable=False),
        sa.Column("records_inserted", sa.Integer(), nullable=False),
        sa.Column("records_updated", sa.Integer(), nullable=False),
        sa.Column("records_skipped_duplicate", sa.Integer(), nullable=False),
        sa.Column("records_failed", sa.Integer(), nullable=False),
        sa.Column("warnings_json", sa.Text(), nullable=True),
        sa.Column("raw_summary_json", sa.Text(), nullable=True),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=True,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["source_account_id"], ["trading_accounts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_import_batches_source"), "import_batches", ["source"], unique=False)
    op.create_index(op.f("ix_import_batches_user_id"), "import_batches", ["user_id"], unique=False)

    op.create_table(
        "strategy_versions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("strategy_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("rules_json", sa.Text(), nullable=False),
        sa.Column("change_note", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["strategy_id"], ["strategies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("strategy_id", "version_number", name="uq_strategy_version"),
    )
    op.create_index(
        op.f("ix_strategy_versions_strategy_id"), "strategy_versions", ["strategy_id"], unique=False
    )
    op.create_index(op.f("ix_strategy_versions_user_id"), "strategy_versions", ["user_id"], unique=False)

    op.create_table(
        "candle_datasets",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("import_batch_id", sa.String(), nullable=True),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=True),
        sa.Column("candle_count", sa.Integer(), nullable=False),
        sa.Column("date_start", sa.String(length=32), nullable=True),
        sa.Column("date_end", sa.String(length=32), nullable=True),
        sa.Column("storage_path", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["import_batch_id"], ["import_batches.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_candle_datasets_symbol"), "candle_datasets", ["symbol"], unique=False)
    op.create_index(op.f("ix_candle_datasets_user_id"), "candle_datasets", ["user_id"], unique=False)

    with op.batch_alter_table("trades", schema=None) as batch_op:
        batch_op.add_column(sa.Column("import_batch_id", sa.String(), nullable=True))
        batch_op.create_index(batch_op.f("ix_trades_import_batch_id"), ["import_batch_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_trades_import_batch_id",
            "import_batches",
            ["import_batch_id"],
            ["id"],
            ondelete="SET NULL",
        )

    with op.batch_alter_table("backtests", schema=None) as batch_op:
        batch_op.add_column(sa.Column("strategy_version_id", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("candle_dataset_id", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("data_label", sa.String(length=32), nullable=True))
        batch_op.create_foreign_key(
            "fk_backtests_strategy_version_id",
            "strategy_versions",
            ["strategy_version_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_foreign_key(
            "fk_backtests_candle_dataset_id",
            "candle_datasets",
            ["candle_dataset_id"],
            ["id"],
            ondelete="SET NULL",
        )

    with op.batch_alter_table("strategy_runs", schema=None) as batch_op:
        batch_op.add_column(sa.Column("strategy_version_id", sa.String(), nullable=True))
        batch_op.create_foreign_key(
            "fk_strategy_runs_strategy_version_id",
            "strategy_versions",
            ["strategy_version_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("strategy_runs", schema=None) as batch_op:
        batch_op.drop_constraint("fk_strategy_runs_strategy_version_id", type_="foreignkey")
        batch_op.drop_column("strategy_version_id")

    with op.batch_alter_table("backtests", schema=None) as batch_op:
        batch_op.drop_constraint("fk_backtests_candle_dataset_id", type_="foreignkey")
        batch_op.drop_constraint("fk_backtests_strategy_version_id", type_="foreignkey")
        batch_op.drop_column("data_label")
        batch_op.drop_column("candle_dataset_id")
        batch_op.drop_column("strategy_version_id")

    with op.batch_alter_table("trades", schema=None) as batch_op:
        batch_op.drop_constraint("fk_trades_import_batch_id", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_trades_import_batch_id"))
        batch_op.drop_column("import_batch_id")

    op.drop_table("candle_datasets")
    op.drop_table("strategy_versions")
    op.drop_table("import_batches")
