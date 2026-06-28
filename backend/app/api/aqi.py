"""
AQI API Routes
===============
Endpoints for air quality data retrieval, predictions, satellite data,
and explainable AI analysis.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List

import numpy as np
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import GroundStation, AQIMeasurement, AQIPrediction
from app.schemas.pydantic_schemas import (
    AQIMeasurementResponse,
    GroundStationResponse,
    PredictionRequest,
    PredictionResponse,
    GeoJSONCollection,
    GeoJSONFeature,
    TimeSeriesResponse,
    TimeSeriesPoint,
)
from app.services.gee_service import gee_service
from app.services.model_service import model_service
from app.utils.xai_shap import xai_engine
from app.utils.spatial_processing import (
    aqi_to_color,
    stations_to_geojson,
    grid_to_geojson_heatmap,
    india_bbox,
)

router = APIRouter(prefix="/api/aqi", tags=["Air Quality Index"])


# ─────────────────────────────────────────────────────────────────
# Ground Stations
# ─────────────────────────────────────────────────────────────────
@router.get("/stations", response_model=List[GroundStationResponse])
def get_stations(
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve CPCB ground monitoring stations.
    Optionally filter by state.
    """
    query = db.query(GroundStation)
    if state:
        query = query.filter(GroundStation.state == state)
    return query.all()


@router.get("/stations/geojson")
def get_stations_geojson(
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return all stations as a GeoJSON FeatureCollection for map rendering."""
    query = db.query(GroundStation)
    if state:
        query = query.filter(GroundStation.state == state)
    stations = query.all()

    features = []
    for s in stations:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [s.longitude, s.latitude]},
            "properties": {
                "station_id": s.station_id,
                "station_name": s.station_name,
                "city": s.city,
                "state": s.state,
            },
        })
    return {"type": "FeatureCollection", "features": features}


# ─────────────────────────────────────────────────────────────────
# AQI Measurements
# ─────────────────────────────────────────────────────────────────
@router.get("/measurements", response_model=List[AQIMeasurementResponse])
def get_measurements(
    station_id: Optional[int] = Query(None),
    state: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
):
    """
    Retrieve AQI measurements with optional filters.
    """
    query = db.query(AQIMeasurement)

    if station_id:
        query = query.filter(AQIMeasurement.station_id == station_id)
    if state:
        query = query.join(GroundStation).filter(GroundStation.state == state)
    if start_date:
        query = query.filter(AQIMeasurement.timestamp >= start_date)
    if end_date:
        query = query.filter(AQIMeasurement.timestamp <= end_date)

    return query.order_by(AQIMeasurement.timestamp.desc()).limit(limit).all()


@router.get("/timeseries")
def get_timeseries(
    station_id: int = Query(...),
    parameter: str = Query("aqi"),
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
):
    """
    Get time-series data for a specific station and parameter.
    Used for line charts and trend analysis.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    measurements = (
        db.query(AQIMeasurement)
        .filter(
            AQIMeasurement.station_id == station_id,
            AQIMeasurement.timestamp >= since,
        )
        .order_by(AQIMeasurement.timestamp.asc())
        .all()
    )

    valid_params = {"aqi", "pm25", "pm10", "no2", "so2", "co", "o3", "nh3"}
    if parameter not in valid_params:
        raise HTTPException(status_code=400, detail=f"Invalid parameter. Choose from: {valid_params}")

    data = []
    for m in measurements:
        value = getattr(m, parameter, None)
        if value is not None:
            data.append({"timestamp": m.timestamp.isoformat(), "value": value})

    station = db.query(GroundStation).filter(GroundStation.id == station_id).first()

    return {
        "parameter": parameter,
        "station_name": station.station_name if station else None,
        "data": data,
    }


# ─────────────────────────────────────────────────────────────────
# Satellite Data
# ─────────────────────────────────────────────────────────────────
@router.get("/satellite/{pollutant}")
def get_satellite_data(
    pollutant: str,
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD"),
):
    """
    Retrieve Sentinel-5P satellite data for a given pollutant.
    Returns spatial statistics and a grid suitable for heatmap rendering.
    """
    valid = {"no2", "so2", "co", "o3", "hcho"}
    if pollutant not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid pollutant. Choose from: {valid}")

    result = gee_service.get_sentinel5p_data(pollutant, start_date, end_date)

    # If simulated, convert grid to heatmap format
    if "grid" in result:
        bbox = india_bbox()
        heatmap_data = grid_to_geojson_heatmap(
            np.array(result["grid"]),
            (bbox["south"], bbox["north"]),
            (bbox["west"], bbox["east"]),
        )
        result["heatmap"] = heatmap_data
        del result["grid"]  # Don't send raw grid to frontend

    return result


@router.get("/satellite/meteorology")
def get_meteorology(
    start_date: str = Query(...),
    end_date: str = Query(...),
):
    """Retrieve ERA5 meteorological parameters."""
    return gee_service.get_era5_meteorology(start_date, end_date)


# ─────────────────────────────────────────────────────────────────
# AQI Prediction
# ─────────────────────────────────────────────────────────────────
@router.post("/predict", response_model=PredictionResponse)
def predict_aqi(request: PredictionRequest):
    """
    Generate an AI-based AQI prediction for a given location.

    The prediction pipeline:
    1. Fetches satellite observations (or uses cached/simulated data).
    2. Retrieves meteorological parameters.
    3. Runs the CNN-LSTM model (or heuristic fallback).
    4. Returns predicted pollutant concentrations and AQI.
    """
    # Assemble feature vector
    # In production, this would fetch real-time satellite and met data
    rng = np.random.default_rng(
        int(request.latitude * 1000 + request.longitude * 100) % 99999
    )

    features = {
        "aod": float(rng.uniform(0.1, 1.5)),
        "no2": float(rng.uniform(1e-5, 2e-4)),
        "so2": float(rng.uniform(5e-6, 1e-4)),
        "co": float(rng.uniform(0.02, 0.05)),
        "o3": float(rng.uniform(0.10, 0.15)),
        "temperature": float(rng.uniform(290, 315)),
        "humidity": float(rng.uniform(30, 85)),
        "wind_speed": float(rng.uniform(0.5, 8.0)),
        "pblh": float(rng.uniform(300, 2500)),
    }

    prediction = model_service.predict(features)
    prediction["latitude"] = request.latitude
    prediction["longitude"] = request.longitude
    prediction["prediction_time"] = (
        request.date or datetime.now(timezone.utc)
    ).isoformat()

    # Set defaults for optional fields
    prediction.setdefault("top_features", None)

    return prediction


@router.post("/predict/explain")
def predict_with_explanation(request: PredictionRequest):
    """
    Generate AQI prediction with Explainable AI analysis.
    Returns prediction + feature importance + scientific explanation.
    """
    rng = np.random.default_rng(
        int(request.latitude * 1000 + request.longitude * 100) % 99999
    )

    features = {
        "aod": float(rng.uniform(0.1, 1.5)),
        "no2": float(rng.uniform(1e-5, 2e-4)),
        "so2": float(rng.uniform(5e-6, 1e-4)),
        "co": float(rng.uniform(0.02, 0.05)),
        "o3": float(rng.uniform(0.10, 0.15)),
        "temperature": float(rng.uniform(290, 315)),
        "humidity": float(rng.uniform(30, 85)),
        "wind_speed": float(rng.uniform(0.5, 8.0)),
        "pblh": float(rng.uniform(300, 2500)),
    }

    prediction = model_service.predict(features)
    explanation = xai_engine.explain_prediction(features, prediction)

    return {
        "prediction": prediction,
        "explanation": explanation,
        "input_features": features,
    }


# ─────────────────────────────────────────────────────────────────
# India-wide AQI Map Data
# ─────────────────────────────────────────────────────────────────
@router.get("/map/india")
def get_india_aqi_map():
    """
    Generate a grid of AQI predictions across India for spatial mapping.
    Returns heatmap-ready data for the Leaflet frontend.
    """
    bbox = india_bbox()
    lat_steps = 40
    lon_steps = 30
    lats = np.linspace(bbox["south"], bbox["north"], lat_steps)
    lons = np.linspace(bbox["west"], bbox["east"], lon_steps)

    rng = np.random.default_rng(2026)
    aqi_grid = np.zeros((lat_steps, lon_steps))

    for i, lat in enumerate(lats):
        for j, lon in enumerate(lons):
            # Base AQI varies by region
            base = 50 + 30 * np.sin(np.radians(lat * 3)) + 20 * np.cos(np.radians(lon * 2))

            # IGP pollution belt enhancement
            if 25 <= lat <= 31 and 74 <= lon <= 86:
                base += rng.uniform(80, 200)
            # Western India industrial corridor
            elif 18 <= lat <= 24 and 70 <= lon <= 76:
                base += rng.uniform(30, 100)
            # South India — generally cleaner
            elif lat < 15:
                base -= rng.uniform(10, 30)

            base += rng.normal(0, 15)
            aqi_grid[i, j] = max(20, min(500, base))

    heatmap = grid_to_geojson_heatmap(
        aqi_grid, (bbox["south"], bbox["north"]), (bbox["west"], bbox["east"])
    )

    return {
        "heatmap": heatmap,
        "bbox": bbox,
        "grid_shape": [lat_steps, lon_steps],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
