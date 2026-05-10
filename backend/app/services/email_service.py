"""Send HTML emails via SMTP (Phase 4 — NEXT_STEPS)."""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Any, Dict

from ..core.config import settings

logger = logging.getLogger(__name__)


def send_html_email(to_address: str, subject: str, html_body: str, text_fallback: str = "") -> bool:
    """
    Send a single HTML email. Returns True if accepted by SMTP (or dev skip).
    When SMTP_HOST is unset, logs and returns False (no exception).
    """
    host = settings.SMTP_HOST
    if not host:
        logger.warning(
            "SMTP_HOST not set — skipping email send (configure SMTP in .env for production)."
        )
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_address
    msg.set_content(text_fallback or "Open this email in an HTML-capable client.")
    msg.add_alternative(html_body, subtype="html")

    try:
        if settings.SMTP_USE_TLS and settings.SMTP_PORT != 465:
            with smtplib.SMTP(host, settings.SMTP_PORT, timeout=30) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP_SSL(host, settings.SMTP_PORT, timeout=30) as smtp:
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                smtp.send_message(msg)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_address)
        return False


def build_daily_report_html(
    display_name: str,
    report_date: str,
    stats: Dict[str, Any],
) -> tuple[str, str]:
    """Returns (html, plain_text)."""
    today_pnl = stats.get("today_pnl", 0)
    today_trades = stats.get("today_trades", 0)
    win_rate = stats.get("today_win_rate", 0)
    equity = stats.get("equity", 0)
    total_trades = stats.get("all_trades", 0)

    pnl_color = "#10b981" if today_pnl >= 0 else "#ef4444"
    sign = "+" if today_pnl >= 0 else ""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#0b0f16;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#141b2d;border-radius:16px;border:1px solid #2a3550;">
    <tr><td style="padding:28px 24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Tradex daily digest</p>
      <h1 style="margin:0 0 8px;font-size:22px;color:#f8fafc;">Hi {display_name}</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;">{report_date}</p>
      <div style="border-radius:12px;background:#0f141c;padding:20px;margin-bottom:20px;border:1px solid #2a3550;">
        <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;">Today's P&amp;L</p>
        <p style="margin:0;font-size:32px;font-weight:800;color:{pnl_color};">{sign}${abs(today_pnl):,.2f}</p>
      </div>
      <table width="100%" style="border-collapse:collapse;font-size:14px;color:#cbd5e1;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a3550;">Trades today</td><td align="right" style="padding:10px 0;border-bottom:1px solid #2a3550;"><strong>{today_trades}</strong></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a3550;">Win rate (today)</td><td align="right" style="padding:10px 0;border-bottom:1px solid #2a3550;"><strong>{win_rate:.1f}%</strong></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #2a3550;">Est. equity</td><td align="right" style="padding:10px 0;border-bottom:1px solid #2a3550;"><strong>${equity:,.2f}</strong></td></tr>
        <tr><td style="padding:10px 0;">Total trades (all time)</td><td align="right" style="padding:10px 0;"><strong>{total_trades}</strong></td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">Open Tradex for full analytics. You received this because Daily Report is enabled in Settings.</p>
    </td></tr>
  </table>
</body></html>"""

    plain = (
        f"Tradex daily digest for {display_name} — {report_date}\n"
        f"Today's P&L: {sign}${abs(today_pnl):,.2f}\n"
        f"Trades today: {today_trades}\n"
        f"Win rate (today): {win_rate:.1f}%\n"
        f"Est. equity: ${equity:,.2f}\n"
        f"Total trades: {total_trades}\n"
    )
    return html, plain
