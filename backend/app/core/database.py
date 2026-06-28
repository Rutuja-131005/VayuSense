"""
Database Connection Module
===========================
Provides SQLAlchemy engine, session factory, and Base class.
Supports both SQLite (default local) and PostgreSQL + PostGIS (production).
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings


# ── Engine ────────────────────────────────────────────────────────
# For SQLite, enable WAL mode and foreign keys
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=(
        {"check_same_thread": False}
        if settings.DATABASE_URL.startswith("sqlite")
        else {}
    ),
    echo=settings.DEBUG,
)

# Enable WAL mode for SQLite for better concurrency
if settings.DATABASE_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()


# ── Session ───────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Base ──────────────────────────────────────────────────────────
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session.
    Ensures proper cleanup after request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables defined in the ORM models.
    Called on application startup.
    """
    from app.models import db_models  # noqa: F401 – registers models with Base

    Base.metadata.create_all(bind=engine)
