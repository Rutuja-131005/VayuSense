"""
Application Configuration Module
=================================
Centralized configuration using Pydantic BaseSettings.
All values can be overridden via environment variables or a .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """
    Application-wide settings.
    Reads from environment variables and .env file.
    """

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "ISRO AQI & HCHO Hotspot Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Server ───────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Database ─────────────────────────────────────────────────
    # Default: SQLite for local standalone; switch to PostgreSQL via env
    DATABASE_URL: str = "sqlite:///./aqi_platform.db"

    # ── Security ─────────────────────────────────────────────────
    SECRET_KEY: str = "isro-aqi-hackathon-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"

    # ── Google Earth Engine ──────────────────────────────────────
    GEE_SERVICE_ACCOUNT: Optional[str] = None
    GEE_KEY_FILE: Optional[str] = None

    # ── CPCB API ─────────────────────────────────────────────────
    CPCB_API_URL: str = "https://app.cpcbccr.com/ccr_docs/LATEST"

    # ── File Paths ───────────────────────────────────────────────
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "data")
    MODEL_WEIGHTS_DIR: str = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "ai_models", "pretrained_weights"
    )

    # ── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton settings instance
settings = Settings()
