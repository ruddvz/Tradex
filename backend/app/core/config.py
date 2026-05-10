from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Tradex API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/tradex"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # MT5
    MT5_SERVER: Optional[str] = None
    MT5_LOGIN: Optional[int] = None
    MT5_PASSWORD: Optional[str] = None

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Trade screenshots (Phase 2) — served under /uploads
    UPLOAD_ROOT: str = "uploads"

    # Phase 4 — daily email (SMTP optional; when unset, sends are logged-only / skipped)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "Tradex <noreply@tradex.local>"
    # Hour (0–23) UTC for Celery beat daily digest (per-user local 8 PM requires timezone field — future)
    DAILY_REPORT_HOUR_UTC: int = 20
    # Shared secret for POST /notifications/send-daily (cron / internal); generate for production
    NOTIFICATIONS_CRON_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
