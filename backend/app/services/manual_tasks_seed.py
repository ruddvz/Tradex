"""Default Action Center tasks for new users (idempotent seed)."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.manual_task import ManualTask

DEFAULT_TASK_TEMPLATES: list[dict[str, Any]] = [
    {
        "title": "Set secure backend SECRET_KEY",
        "description": "A long random secret protects JWT and sessions. Required before any shared or production deployment.",
        "category": "initial_setup",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Open backend or root .env (not committed)", "completed": False},
            {"id": "2", "label": "Set SECRET_KEY to 32+ random characters", "completed": False},
            {"id": "3", "label": "Restart API after changing secrets", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Confirm database connection",
        "description": "PostgreSQL must be reachable so trades and tasks persist.",
        "category": "initial_setup",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Verify DATABASE_URL in .env", "completed": False},
            {"id": "2", "label": "Open GET /api/v1/health and confirm API is up", "completed": False},
            {"id": "3", "label": "Register or log in and confirm session persists", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/settings"},
    },
    {
        "title": "Create your first account profile",
        "description": "Use Settings to set your display name and preferences.",
        "category": "initial_setup",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Open Settings", "completed": False},
            {"id": "2", "label": "Confirm name and notification preferences", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/settings"},
    },
    {
        "title": "Confirm timezone and session labels",
        "description": "Accurate times improve journal and analytics quality.",
        "category": "initial_setup",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Decide reporting timezone (e.g. UTC vs local)", "completed": False},
            {"id": "2", "label": "Align trade entry times with your broker", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/journal"},
    },
    {
        "title": "Install Tradex as PWA (optional)",
        "description": "Install the app for quicker access and offline shell when deployed to HTTPS.",
        "category": "pwa_setup",
        "priority": "medium",
        "checklist": [
            {"id": "1", "label": "Use Chrome/Edge and choose Install app", "completed": False},
            {"id": "2", "label": "Confirm icon and standalone window", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Confirm .env is never committed",
        "description": "Secrets in git history must be rotated immediately.",
        "category": "security",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Verify .gitignore excludes .env", "completed": False},
            {"id": "2", "label": "Search repo for accidental secret commits", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Set production CORS origins",
        "description": "Restrict browser origins that may call your API in production.",
        "category": "security",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "List real frontend URLs", "completed": False},
            {"id": "2", "label": "Set CORS_ORIGINS in production .env", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Confirm MT5 password encryption",
        "description": "MT5 credentials should be stored encrypted at rest.",
        "category": "security",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Save MT5 password in Settings", "completed": False},
            {"id": "2", "label": "Confirm database stores ciphertext only", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/settings"},
    },
    {
        "title": "Connect MT5 demo or read-only account",
        "description": "Start with demo credentials until paper mode is fully trusted.",
        "category": "broker_connection",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Create or use a demo MT5 account", "completed": False},
            {"id": "2", "label": "Enter server, login, password in Settings", "completed": False},
            {"id": "3", "label": "Never use live passwords during first tests", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/settings"},
    },
    {
        "title": "Run first MT5 sync test",
        "description": "Import history and verify counts vs terminal.",
        "category": "broker_connection",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Open sidebar sync or MT5 modal", "completed": False},
            {"id": "2", "label": "Run sync and read success or error message", "completed": False},
            {"id": "3", "label": "Spot-check a few tickets in Journal", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/journal"},
    },
    {
        "title": "Create paper trading account (planned)",
        "description": "Fake-money accounts let you test execution flow without capital risk. Backend module ships in a later sprint.",
        "category": "paper_trading",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Wait for Paper Trading page in app", "completed": False},
            {"id": "2", "label": "Set starting balance and currency", "completed": False},
            {"id": "3", "label": "Confirm fills are labeled Paper", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/action-center"},
    },
    {
        "title": "Place first simulated order (planned)",
        "description": "Validate order lifecycle in paper mode before any live adapter exists.",
        "category": "paper_trading",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Open Paper Trading when available", "completed": False},
            {"id": "2", "label": "Submit a small test order", "completed": False},
            {"id": "3", "label": "Confirm it does not appear as live journal without source=paper", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/action-center"},
    },
    {
        "title": "Set max risk per trade",
        "description": "Define how much of the account you are willing to lose on one trade.",
        "category": "risk",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Pick a max % or R per trade", "completed": False},
            {"id": "2", "label": "Document the rule in Notebook or Risk Center when available", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/calculator"},
    },
    {
        "title": "Set max daily loss and drawdown limits",
        "description": "Circuit breakers reduce revenge trading and cascade losses.",
        "category": "risk",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Define max daily loss", "completed": False},
            {"id": "2", "label": "Define max total drawdown", "completed": False},
            {"id": "3", "label": "Plan what happens when limit is hit (stop trading)", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/calculator"},
    },
    {
        "title": "Enable emergency stop (concept)",
        "description": "When Risk Center ships, one toggle should block all new orders.",
        "category": "risk",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Decide who can lift the stop (you only)", "completed": False},
            {"id": "2", "label": "Wire emergency stop in Risk Center when available", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Add rule: no live mode without manual confirmation",
        "description": "Live execution must never be silent. Default posture is journal + paper only.",
        "category": "risk",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Treat Tradex as journal-first until risk stack is complete", "completed": False},
            {"id": "2", "label": "Keep broker live keys off this host until explicitly approved", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Create first strategy draft (planned)",
        "description": "Strategy Lab will version definitions for backtest and paper.",
        "category": "strategy_testing",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Write entry/exit rules on paper", "completed": False},
            {"id": "2", "label": "Track in Notebook until Strategy Lab ships", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/notebook"},
    },
    {
        "title": "Run first backtest (planned)",
        "description": "Historical replay before paper weeks.",
        "category": "strategy_testing",
        "priority": "high",
        "checklist": [
            {"id": "1", "label": "Import or connect historical data source", "completed": False},
            {"id": "2", "label": "Save metrics: PF, max DD, streaks", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Add setup tags to recent trades",
        "description": "Tagged setups make Reports and AI insights meaningful.",
        "category": "journal_cleanup",
        "priority": "medium",
        "checklist": [
            {"id": "1", "label": "Open Journal", "completed": False},
            {"id": "2", "label": "Tag last 10–20 trades with playbook/setup", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/journal"},
    },
    {
        "title": "Review largest losing trade",
        "description": "Big losses usually contain the most expensive lessons.",
        "category": "journal_cleanup",
        "priority": "medium",
        "checklist": [
            {"id": "1", "label": "Sort Journal by loss size", "completed": False},
            {"id": "2", "label": "Add screenshot or note what went wrong", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/journal"},
    },
    {
        "title": "Weekly dependency and backup check",
        "description": "Keep Docker images and libraries patched; verify backups if you self-host data.",
        "category": "maintenance",
        "priority": "medium",
        "checklist": [
            {"id": "1", "label": "Pull latest images / npm audit as appropriate", "completed": False},
            {"id": "2", "label": "Confirm Postgres backups if not ephemeral dev", "completed": False},
        ],
        "action_type": "manual",
        "action_payload": None,
    },
    {
        "title": "Resolve any critical sync or auth errors",
        "description": "If MT5 or auth repeatedly fails, capture logs and fix before relying on analytics.",
        "category": "critical_issues",
        "priority": "critical",
        "checklist": [
            {"id": "1", "label": "Reproduce the failure once", "completed": False},
            {"id": "2", "label": "Copy API error detail from Network tab", "completed": False},
            {"id": "3", "label": "Fix credentials, CORS, or service availability", "completed": False},
        ],
        "action_type": "internal_route",
        "action_payload": {"route": "/settings"},
    },
]


def ensure_default_manual_tasks(db: Session, user_id: str) -> dict[str, int]:
    """Insert missing default tasks for user (matched by title). Returns counts."""
    rows = db.execute(select(ManualTask.title).where(ManualTask.user_id == user_id)).scalars().all()
    existing = set(rows)
    created = 0
    for tmpl in DEFAULT_TASK_TEMPLATES:
        title = tmpl["title"]
        if title in existing:
            continue
        row = ManualTask(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            description=tmpl.get("description"),
            category=tmpl["category"],
            priority=tmpl["priority"],
            status="not_started",
            checklist=list(tmpl.get("checklist") or []),
            action_type=tmpl.get("action_type"),
            action_payload=tmpl.get("action_payload"),
        )
        db.add(row)
        existing.add(title)
        created += 1
    if created:
        db.commit()
    return {"created": created}
