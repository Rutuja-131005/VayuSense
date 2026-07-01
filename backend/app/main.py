"""
ISRO AQI & HCHO Hotspot Platform — FastAPI Application
========================================================
Main entry point for the backend server.

Start the server:
    uvicorn app.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, aqi, hotspots, dashboard
from app.services.model_service import model_service

# ── Logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks."""
    logger.info("🚀 Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)

    # Initialize database tables
    init_db()
    logger.info("✅ Database initialized.")

    # Attempt to load the AI model
    model_service.load_model()

    yield

    logger.info("🛑 Shutting down %s", settings.APP_NAME)


# ── FastAPI App ───────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered platform for Surface AQI estimation and HCHO hotspot "
        "identification over India using multi-sensor satellite data. "
        "Developed for ISRO Hackathon 2026."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ─────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(aqi.router)
app.include_router(hotspots.router)
app.include_router(dashboard.router)


# ── Root ──────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    """Health check and API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "aqi": "/api/aqi",
            "hotspots": "/api/hotspots",
            "dashboard": "/api/dashboard",
        },
    }


@app.get("/health", tags=["Root"])
def health():
    """Simple health check endpoint."""
    return {"status": "healthy"}
