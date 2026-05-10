"""Daily digest emails — Celery task + shared runner for cron HTTP trigger."""

from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models.trade import Trade
from app.models.user import User
from app.services.analytics import compute_metrics
from app.services.email_service import build_daily_report_html, send_html_email
from app.services.trade_codec import trade_to_api_dict

logger = logging.getLogger(__name__)

DEFAULT_PREFS: Dict[str, bool] = {
    "email": True,
    "push": True,
    "drawdownAlerts": True,
    "dailyReport": False,
}


def merge_notification_prefs(raw: Any) -> Dict[str, bool]:
    base = dict(DEFAULT_PREFS)
    if isinstance(raw, dict):
        for k in base:
            if k in raw and isinstance(raw[k], bool):
                base[k] = raw[k]
    return base


def _today_iso() -> str:
    return date.today().isoformat()


def _stats_for_user(db: Session, user: User) -> Dict[str, Any]:
    rows = db.execute(select(Trade).where(Trade.user_id == user.id)).scalars().all()
    trades: List[Dict[str, Any]] = [trade_to_api_dict(t) for t in rows]

    today_prefix = _today_iso()
    today_trades = [t for t in trades if (t.get("entry_time") or "").startswith(today_prefix)]

    m_today = compute_metrics(today_trades)
    m_all = compute_metrics(trades)

    wins_today = [t for t in today_trades if t.get("status") == "WIN"]
    wr_today = (len(wins_today) / len(today_trades) * 100) if today_trades else 0.0

    equity_curve = m_all.get("equity_curve") or []
    if equity_curve:
        equity = float(equity_curve[-1].get("equity", 10000))
    else:
        equity = 10000.0 + float(m_all.get("total_pnl", 0))

    return {
        "today_pnl": float(m_today.get("total_pnl", 0)),
        "today_trades": len(today_trades),
        "today_win_rate": wr_today,
        "equity": equity,
        "all_trades": int(m_all.get("total_trades", 0)),
        "win_rate_all": float(m_all.get("win_rate", 0)),
    }


def run_daily_report_cycle(db: Session) -> Dict[str, Any]:
    """Send daily HTML digest to every user with dailyReport enabled."""
    users = db.execute(select(User)).scalars().all()
    sent = 0
    skipped = 0
    errors = 0

    report_date = datetime.now().strftime("%A, %b %d, %Y")

    for user in users:
        prefs = merge_notification_prefs(user.notification_prefs)
        if not prefs.get("dailyReport"):
            skipped += 1
            continue
        if not prefs.get("email"):
            skipped += 1
            continue

        stats = _stats_for_user(db, user)
        html, plain = build_daily_report_html(user.name or "Trader", report_date, stats)
        subject = f"Tradex daily — {_today_iso()} · P&L ${stats['today_pnl']:+,.2f}"
        ok = send_html_email(user.email, subject, html, plain)
        if ok:
            sent += 1
        else:
            errors += 1

    return {"sent": sent, "skipped": skipped, "failed_no_smtp_or_error": errors}


@celery_app.task(name="app.tasks.notifications.send_daily_reports")
def send_daily_reports() -> Dict[str, Any]:
    db = SessionLocal()
    try:
        result = run_daily_report_cycle(db)
        logger.info("send_daily_reports: %s", result)
        return result
    finally:
        db.close()
