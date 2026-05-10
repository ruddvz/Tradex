"""Celery application — Redis broker + beat schedule for daily emails (Phase 4)."""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "tradex",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.timezone = "UTC"
celery_app.conf.imports = ("app.tasks.notifications",)

_hour = max(0, min(23, settings.DAILY_REPORT_HOUR_UTC))
celery_app.conf.beat_schedule = {
    "daily-email-reports": {
        "task": "app.tasks.notifications.send_daily_reports",
        "schedule": crontab(hour=_hour, minute=0),
    },
}
