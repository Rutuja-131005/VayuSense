"""
Spatial Processing Utilities
==============================
Geospatial helper functions for coordinate transforms,
GeoJSON generation, grid interpolation, and AQI colour mapping.
"""

import math
from typing import Dict, List, Tuple, Optional, Any

import numpy as np


# ── AQI Colour Scale (CPCB Standard) ─────────────────────────────
AQI_COLORS = {
    "Good": "#009966",
    "Satisfactory": "#58B453",
    "Moderate": "#FFDE33",
    "Poor": "#FF9933",
    "Very Poor": "#CC0033",
    "Severe": "#660099",
}


def aqi_to_color(aqi: float) -> str:
    """Map a numeric AQI value to its standard CPCB hex colour."""
    if aqi <= 50:
        return AQI_COLORS["Good"]
    elif aqi <= 100:
        return AQI_COLORS["Satisfactory"]
    elif aqi <= 200:
        return AQI_COLORS["Moderate"]
    elif aqi <= 300:
        return AQI_COLORS["Poor"]
    elif aqi <= 400:
        return AQI_COLORS["Very Poor"]
    return AQI_COLORS["Severe"]


def aqi_category(aqi: float) -> str:
    """Map a numeric AQI value to its CPCB category string."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    return "Severe"


# ── GeoJSON Helpers ───────────────────────────────────────────────
def point_to_geojson(
    lat: float, lon: float, properties: Optional[Dict] = None
) -> Dict:
    """Create a GeoJSON Point Feature."""
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": properties or {},
    }


def stations_to_geojson(stations: List[Dict]) -> Dict:
    """
    Convert a list of station dicts to a GeoJSON FeatureCollection.
    Each station must have 'latitude', 'longitude', and optional properties.
    """
    features = []
    for s in stations:
        props = {k: v for k, v in s.items() if k not in ("latitude", "longitude")}
        features.append(point_to_geojson(s["latitude"], s["longitude"], props))
    return {"type": "FeatureCollection", "features": features}


def hotspots_to_geojson(hotspots: List[Dict]) -> Dict:
    """Convert hotspot dicts to a GeoJSON FeatureCollection with circle markers."""
    features = []
    for h in hotspots:
        props = {k: v for k, v in h.items() if k not in ("centroid_lat", "centroid_lon")}
        features.append(
            point_to_geojson(h["centroid_lat"], h["centroid_lon"], props)
        )
    return {"type": "FeatureCollection", "features": features}


def grid_to_geojson_heatmap(
    grid: np.ndarray,
    lat_range: Tuple[float, float],
    lon_range: Tuple[float, float],
    value_key: str = "value",
) -> List[List[float]]:
    """
    Convert a 2D grid to a list of [lat, lon, intensity] triples
    suitable for Leaflet.heat or similar heatmap layers.
    """
    rows, cols = grid.shape
    lats = np.linspace(lat_range[0], lat_range[1], rows)
    lons = np.linspace(lon_range[0], lon_range[1], cols)

    # Normalize to [0, 1]
    grid_min = float(np.nanmin(grid))
    grid_max = float(np.nanmax(grid))
    grid_range = grid_max - grid_min if grid_max > grid_min else 1.0

    points = []
    for i in range(rows):
        for j in range(cols):
            val = grid[i, j]
            if not np.isnan(val):
                intensity = (val - grid_min) / grid_range
                points.append([float(lats[i]), float(lons[j]), round(intensity, 4)])

    return points


# ── Coordinate Utilities ──────────────────────────────────────────
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance (km) between two points."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def india_bbox() -> Dict[str, float]:
    """Return India bounding box as a dict."""
    return {"west": 68.0, "south": 6.0, "east": 98.0, "north": 37.0}


def is_within_india(lat: float, lon: float) -> bool:
    """Check if a coordinate falls within India's bounding box."""
    bbox = india_bbox()
    return bbox["south"] <= lat <= bbox["north"] and bbox["west"] <= lon <= bbox["east"]


# ── Wind Vector Utilities ─────────────────────────────────────────
def wind_to_arrow(u: float, v: float) -> Dict[str, float]:
    """
    Convert u/v wind components to speed and meteorological direction.
    Direction follows meteorological convention (direction FROM which wind blows).
    """
    speed = math.sqrt(u**2 + v**2)
    # Meteorological direction = 270 - atan2(v, u) in degrees
    direction_math = math.degrees(math.atan2(v, u))
    direction_met = (270 - direction_math) % 360
    return {
        "speed_ms": round(speed, 2),
        "direction_deg": round(direction_met, 1),
    }
