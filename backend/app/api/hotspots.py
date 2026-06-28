"""
Hotspot API Routes
===================
Endpoints for HCHO hotspot detection, fire correlation,
wind transport analysis, and GeoJSON map layers.
"""

from datetime import datetime, timezone
from typing import Optional, List

import numpy as np
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import HCHOHotspot, FireEvent
from app.schemas.pydantic_schemas import HCHOHotspotResponse, FireEventResponse
from app.services.gee_service import gee_service
from app.services.hotspot_service import hotspot_service
from app.utils.spatial_processing import hotspots_to_geojson, india_bbox

router = APIRouter(prefix="/api/hotspots", tags=["HCHO Hotspots"])


# ─────────────────────────────────────────────────────────────────
# HCHO Hotspot Detection
# ─────────────────────────────────────────────────────────────────
@router.get("/detect")
def detect_hotspots(
    start_date: str = Query("2024-01-01"),
    end_date: str = Query("2024-01-31"),
):
    """
    Run HCHO hotspot detection pipeline.

    Steps:
    1. Fetch Sentinel-5P HCHO data for the date range.
    2. Apply DBSCAN spatial clustering on elevated pixels.
    3. Correlate with MODIS/VIIRS fire detections.
    4. Estimate wind transport from ERA5 data.
    5. Return detected hotspots as GeoJSON.
    """
    bbox = india_bbox()

    # Step 1: Get HCHO data
    hcho_data = gee_service.get_sentinel5p_data("hcho", start_date, end_date)

    # Step 2: Detect hotspots
    if "grid" in hcho_data:
        hcho_grid = np.array(hcho_data["grid"])
    else:
        # Generate simulated grid for demo
        rng = np.random.default_rng(789)
        hcho_grid = rng.uniform(3e-5, 3e-4, size=(50, 32))
        # Enhance IGP region
        hcho_grid[20:30, 5:15] *= 2.5
        # Enhance central India
        hcho_grid[12:18, 15:22] *= 1.8

    hotspots = hotspot_service.detect_hotspots(
        hcho_grid,
        lat_range=(bbox["south"], bbox["north"]),
        lon_range=(bbox["west"], bbox["east"]),
        detection_date=start_date,
    )

    # Step 3: Get fire data and correlate
    fires_modis = gee_service.get_fire_data("MODIS", start_date, end_date)
    fires_viirs = gee_service.get_fire_data("VIIRS", start_date, end_date)
    all_fires = fires_modis + fires_viirs

    hotspots = hotspot_service.correlate_with_fires(hotspots, all_fires)

    # Step 4: Get wind data and compute transport
    met_data = gee_service.get_era5_meteorology(start_date, end_date)
    wind_u = met_data.get("stats", {}).get("u_wind_10m_mean", 2.0)
    wind_v = met_data.get("stats", {}).get("v_wind_10m_mean", 1.5)
    hotspots = hotspot_service.compute_wind_transport(hotspots, wind_u, wind_v)

    # Convert to GeoJSON
    geojson = hotspots_to_geojson(hotspots)

    return {
        "hotspots": hotspots,
        "geojson": geojson,
        "fires_count": len(all_fires),
        "detection_period": {"start": start_date, "end": end_date},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─────────────────────────────────────────────────────────────────
# Stored Hotspots (from DB)
# ─────────────────────────────────────────────────────────────────
@router.get("/list", response_model=List[HCHOHotspotResponse])
def list_hotspots(
    state: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve previously detected hotspots from the database."""
    query = db.query(HCHOHotspot)
    if state:
        query = query.filter(HCHOHotspot.state == state)
    if source_type:
        query = query.filter(HCHOHotspot.source_type == source_type)
    return query.order_by(HCHOHotspot.detection_date.desc()).limit(limit).all()


@router.get("/geojson")
def get_hotspots_geojson(
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return stored hotspots as a GeoJSON FeatureCollection."""
    query = db.query(HCHOHotspot)
    if state:
        query = query.filter(HCHOHotspot.state == state)
    hotspots = query.all()

    features = []
    for h in hotspots:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [h.centroid_lon, h.centroid_lat],
            },
            "properties": {
                "cluster_id": h.cluster_id,
                "mean_hcho": h.mean_hcho,
                "fire_count": h.fire_count,
                "source_type": h.source_type,
                "state": h.state,
                "area_km2": h.area_km2,
            },
        })
    return {"type": "FeatureCollection", "features": features}


# ─────────────────────────────────────────────────────────────────
# Fire Events
# ─────────────────────────────────────────────────────────────────
@router.get("/fires")
def get_fire_events(
    source: str = Query("MODIS"),
    start_date: str = Query("2024-01-01"),
    end_date: str = Query("2024-01-31"),
):
    """
    Retrieve active fire detections (MODIS or VIIRS).
    Returns fire locations as a GeoJSON FeatureCollection.
    """
    fires = gee_service.get_fire_data(source, start_date, end_date)

    features = []
    for f in fires:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [f["longitude"], f["latitude"]],
            },
            "properties": {
                "source": f.get("source", source),
                "brightness": f.get("brightness"),
                "frp": f.get("frp"),
                "confidence": f.get("confidence"),
                "region": f.get("region"),
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "total_fires": len(fires),
    }


# ─────────────────────────────────────────────────────────────────
# HCHO Heatmap
# ─────────────────────────────────────────────────────────────────
@router.get("/hcho/heatmap")
def get_hcho_heatmap(
    start_date: str = Query("2024-01-01"),
    end_date: str = Query("2024-01-31"),
):
    """
    Return HCHO column density as heatmap-ready data for Leaflet.
    """
    from app.utils.spatial_processing import grid_to_geojson_heatmap

    bbox = india_bbox()
    hcho_data = gee_service.get_sentinel5p_data("hcho", start_date, end_date)

    if "grid" in hcho_data:
        hcho_grid = np.array(hcho_data["grid"])
    else:
        rng = np.random.default_rng(321)
        hcho_grid = rng.uniform(3e-5, 3e-4, size=(50, 32))
        hcho_grid[20:30, 5:15] *= 2.5

    heatmap = grid_to_geojson_heatmap(
        hcho_grid,
        (bbox["south"], bbox["north"]),
        (bbox["west"], bbox["east"]),
    )

    return {
        "heatmap": heatmap,
        "stats": hcho_data.get("stats", {}),
        "bbox": bbox,
    }


# ─────────────────────────────────────────────────────────────────
# Wind Transport Analysis
# ─────────────────────────────────────────────────────────────────
@router.get("/wind-transport")
def get_wind_transport(
    start_date: str = Query("2024-01-01"),
    end_date: str = Query("2024-01-31"),
):
    """
    Return wind field data for transport visualization.
    Generates a grid of wind vectors over India.
    """
    met_data = gee_service.get_era5_meteorology(start_date, end_date)
    stats = met_data.get("stats", {})

    bbox = india_bbox()
    rng = np.random.default_rng(654)

    # Generate wind vector field (simplified)
    lat_steps = 20
    lon_steps = 15
    lats = np.linspace(bbox["south"], bbox["north"], lat_steps)
    lons = np.linspace(bbox["west"], bbox["east"], lon_steps)

    base_u = stats.get("u_wind_10m_mean", 2.0)
    base_v = stats.get("v_wind_10m_mean", 1.5)

    wind_vectors = []
    for lat in lats:
        for lon in lons:
            u = base_u + rng.normal(0, 1.0)
            v = base_v + rng.normal(0, 1.0)
            speed = float(np.sqrt(u**2 + v**2))
            direction = float(np.degrees(np.arctan2(v, u))) % 360
            wind_vectors.append({
                "lat": round(float(lat), 2),
                "lon": round(float(lon), 2),
                "u": round(float(u), 2),
                "v": round(float(v), 2),
                "speed": round(speed, 2),
                "direction": round(direction, 1),
            })

    return {
        "wind_vectors": wind_vectors,
        "mean_wind": {
            "u": base_u,
            "v": base_v,
            "speed": round(float(np.sqrt(base_u**2 + base_v**2)), 2),
        },
        "bbox": bbox,
    }
