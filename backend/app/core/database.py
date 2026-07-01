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

    # Seed global case studies if table is empty
    from app.models.db_models import GlobalCaseStudy
    import json

    db = SessionLocal()
    try:
        if db.query(GlobalCaseStudy).count() == 0:
            default_cases = [
                {
                    "target_city": "Paris",
                    "target_country": "France",
                    "historical_aqi": 95,
                    "aqi_category": "Moderate",
                    "context": "Spring smog episodes driven by agricultural ammonium nitrate aerosols and traffic.",
                    "policies": json.dumps([
                        "Temporary speed limit reductions (by 20 km/h) on major bypass expressways.",
                        "Residential wood-burning restrictions enforced during high-emission periods.",
                        "Subsidized public transit and residential parking to discourage private car usage."
                    ]),
                    "impact": "Reduced local particulate traffic emissions by 15-20% within 48 hours.",
                    "source_docs": "Paris Prefecture of Police (Airparif Monitoring)"
                },
                {
                    "target_city": "Seoul",
                    "target_country": "South Korea",
                    "historical_aqi": 178,
                    "aqi_category": "Poor",
                    "context": "Fine dust (PM2.5) buildup combined with transboundary pollution from regional industrial belts.",
                    "policies": json.dumps([
                        "Alternative-day driving (odd-even license plate rules) enforced for public sector employees.",
                        "Operation curbs on coal-fired power plants (capping at maximum 80% capacity).",
                        "High-pressure water flushing trucks deployed on 500+ kilometers of central urban roads."
                    ]),
                    "impact": "Decreased PM2.5 concentrations in target zones by 12% over 3 days.",
                    "source_docs": "Seoul Metropolitan Government (Clean Air Policy Division)"
                },
                {
                    "target_city": "London",
                    "target_country": "United Kingdom",
                    "historical_aqi": 240,
                    "aqi_category": "Very Poor",
                    "context": "Historical winter smog and modern diesel NO2 emissions.",
                    "policies": json.dumps([
                        "Introduction of the Ultra Low Emission Zone (ULEZ) charging high-pollution vehicles entering the center.",
                        "Retrofitting 100% of public transit buses to Euro VI low-emission standards.",
                        "Dynamic smart traffic signals to prevent vehicle idling in heavy emission gridlock spots."
                    ]),
                    "impact": "Contributed to a 44% reduction in roadside nitrogen dioxide (NO2) over 2 years.",
                    "source_docs": "Transport for London (TfL Clean Air Reports)"
                },
                {
                    "target_city": "Beijing",
                    "target_country": "China",
                    "historical_aqi": 420,
                    "aqi_category": "Severe",
                    "context": "Severe winter coal heating emissions and stagnant meteorological inversion layers.",
                    "policies": json.dumps([
                        "Enforcement of 'Red Alert' protocols: total shutdown of 1,200+ heavy manufacturing factories.",
                        "Mandatory odd-even driving restrictions for all private passenger vehicles.",
                        "Complete transition of all residential heating from coal-burning boilers to natural gas."
                    ]),
                    "impact": "Led to a 35% reduction in annual PM2.5 concentrations over a 4-year clean air action plan.",
                    "source_docs": "Beijing Municipal Ecology and Environment Bureau (UNEP Clean Air Report)"
                }
            ]
            for case_data in default_cases:
                case = GlobalCaseStudy(**case_data)
                db.add(case)
            db.commit()
            print("Seeded default global case studies into database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

