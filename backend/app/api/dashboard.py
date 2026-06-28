"""
Dashboard API Routes
=====================
Aggregated endpoints for the main dashboard view.
Provides summary statistics, recent trends, and comparison data.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import numpy as np
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import (
    GroundStation,
    AQIMeasurement,
    AQIPrediction,
    HCHOHotspot,
    FireEvent,
)
from app.schemas.pydantic_schemas import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Return aggregated statistics for the main dashboard.
    """
    total_stations = db.query(GroundStation).count()
    active_stations = db.query(GroundStation).filter(GroundStation.is_active.is_(True)).count()

    # Recent AQI stats (last 24 hours)
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_aqi = (
        db.query(
            func.avg(AQIMeasurement.aqi).label("avg_aqi"),
            func.max(AQIMeasurement.aqi).label("max_aqi"),
        )
        .filter(AQIMeasurement.timestamp >= since)
        .first()
    )

    total_hotspots = db.query(HCHOHotspot).count()
    total_fires = db.query(FireEvent).count()

    latest = (
        db.query(func.max(AQIMeasurement.timestamp))
        .scalar()
    )

    return DashboardSummary(
        total_stations=total_stations or 0,
        active_stations=active_stations or 0,
        avg_aqi=round(recent_aqi.avg_aqi, 1) if recent_aqi and recent_aqi.avg_aqi else None,
        max_aqi=round(recent_aqi.max_aqi, 1) if recent_aqi and recent_aqi.max_aqi else None,
        total_hotspots=total_hotspots or 0,
        total_fire_events=total_fires or 0,
        latest_update=latest,
    )


@router.get("/stats/by-state")
def get_stats_by_state(db: Session = Depends(get_db)):
    """
    Return average AQI per state for the choropleth map.
    """
    results = (
        db.query(
            GroundStation.state,
            func.avg(AQIMeasurement.aqi).label("avg_aqi"),
            func.count(AQIMeasurement.id).label("measurement_count"),
        )
        .join(AQIMeasurement, AQIMeasurement.station_id == GroundStation.id)
        .group_by(GroundStation.state)
        .all()
    )

    state_data = []
    for row in results:
        state_data.append({
            "state": row.state,
            "avg_aqi": round(row.avg_aqi, 1) if row.avg_aqi else None,
            "measurement_count": row.measurement_count,
        })

    # If no real data, provide simulated state-level AQI
    if not state_data:
        state_data = _simulated_state_aqi()

    return {"states": state_data}


@router.get("/stats/pollutant-distribution")
def get_pollutant_distribution(db: Session = Depends(get_db)):
    """
    Return latest average pollutant concentrations across all stations.
    Used for radar/bar charts.
    """
    since = datetime.now(timezone.utc) - timedelta(days=7)
    result = (
        db.query(
            func.avg(AQIMeasurement.pm25).label("pm25"),
            func.avg(AQIMeasurement.pm10).label("pm10"),
            func.avg(AQIMeasurement.no2).label("no2"),
            func.avg(AQIMeasurement.so2).label("so2"),
            func.avg(AQIMeasurement.co).label("co"),
            func.avg(AQIMeasurement.o3).label("o3"),
        )
        .filter(AQIMeasurement.timestamp >= since)
        .first()
    )

    if result and result.pm25 is not None:
        return {
            "PM2.5": round(result.pm25, 2),
            "PM10": round(result.pm10, 2) if result.pm10 else None,
            "NO2": round(result.no2, 2) if result.no2 else None,
            "SO2": round(result.so2, 2) if result.so2 else None,
            "CO": round(result.co, 2) if result.co else None,
            "O3": round(result.o3, 2) if result.o3 else None,
        }

    # Simulated data
    rng = np.random.default_rng(42)
    return {
        "PM2.5": round(float(rng.uniform(40, 120)), 2),
        "PM10": round(float(rng.uniform(80, 200)), 2),
        "NO2": round(float(rng.uniform(20, 80)), 2),
        "SO2": round(float(rng.uniform(10, 50)), 2),
        "CO": round(float(rng.uniform(0.5, 3.0)), 2),
        "O3": round(float(rng.uniform(30, 100)), 2),
    }


@router.get("/recent-predictions")
def get_recent_predictions(
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    """Return recent model predictions for display on the dashboard."""
    predictions = (
        db.query(AQIPrediction)
        .order_by(AQIPrediction.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "latitude": p.latitude,
            "longitude": p.longitude,
            "pred_aqi": p.pred_aqi,
            "pred_category": p.pred_category,
            "confidence_score": p.confidence_score,
            "prediction_time": p.prediction_time.isoformat() if p.prediction_time else None,
        }
        for p in predictions
    ]


# ─────────────────────────────────────────────────────────────────
# Simulated Data for Demo
# ─────────────────────────────────────────────────────────────────
def _simulated_state_aqi():
    """
    Provide scientifically plausible state-level AQI data for demo.
    Based on typical annual average AQI ranges from CPCB reports.
    """
    rng = np.random.default_rng(2026)
    states = {
        "Delhi": (250, 400),
        "Uttar Pradesh": (180, 300),
        "Bihar": (160, 280),
        "Haryana": (150, 260),
        "Punjab": (130, 240),
        "Rajasthan": (100, 200),
        "West Bengal": (120, 220),
        "Maharashtra": (80, 180),
        "Madhya Pradesh": (90, 170),
        "Gujarat": (80, 160),
        "Tamil Nadu": (50, 120),
        "Karnataka": (50, 110),
        "Kerala": (30, 80),
        "Odisha": (70, 150),
        "Jharkhand": (100, 200),
        "Telangana": (60, 140),
        "Andhra Pradesh": (50, 130),
        "Assam": (60, 130),
        "Chhattisgarh": (80, 170),
        "Uttarakhand": (70, 150),
    }
    return [
        {
            "state": name,
            "avg_aqi": round(float(rng.uniform(lo, hi)), 1),
            "measurement_count": int(rng.integers(50, 500)),
        }
        for name, (lo, hi) in states.items()
    ]
