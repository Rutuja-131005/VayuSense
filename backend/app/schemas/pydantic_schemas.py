"""
Pydantic Schemas (Request / Response Models)
=============================================
Defines data validation and serialization schemas for the REST API.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


# ─────────────────────────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(...)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


# ─────────────────────────────────────────────────────────────────
# Ground Station Schemas
# ─────────────────────────────────────────────────────────────────
class GroundStationResponse(BaseModel):
    id: int
    station_id: str
    station_name: str
    city: Optional[str]
    state: Optional[str]
    district: Optional[str]
    latitude: float
    longitude: float
    station_type: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────
# AQI Measurement Schemas
# ─────────────────────────────────────────────────────────────────
class AQIMeasurementResponse(BaseModel):
    id: int
    station_id: int
    timestamp: datetime
    pm25: Optional[float]
    pm10: Optional[float]
    no2: Optional[float]
    so2: Optional[float]
    co: Optional[float]
    o3: Optional[float]
    nh3: Optional[float]
    aqi: Optional[float]
    aqi_category: Optional[str]
    prominent_pollutant: Optional[str]

    class Config:
        from_attributes = True


class AQIQueryParams(BaseModel):
    """Query parameters for filtering AQI data."""
    state: Optional[str] = None
    district: Optional[str] = None
    station_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    pollutant: Optional[str] = None  # pm25, no2, so2, co, o3


# ─────────────────────────────────────────────────────────────────
# Prediction Schemas
# ─────────────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    """Request body for generating a new AQI prediction."""
    latitude: float = Field(..., ge=6.0, le=37.0, description="Latitude within India bounds")
    longitude: float = Field(..., ge=68.0, le=98.0, description="Longitude within India bounds")
    date: Optional[datetime] = None


class PredictionResponse(BaseModel):
    latitude: float
    longitude: float
    prediction_time: datetime
    pred_pm25: Optional[float]
    pred_no2: Optional[float]
    pred_so2: Optional[float]
    pred_co: Optional[float]
    pred_o3: Optional[float]
    pred_aqi: Optional[float]
    pred_category: Optional[str]
    confidence_score: Optional[float]
    top_features: Optional[str]
    model_version: str

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────
# HCHO Hotspot Schemas
# ─────────────────────────────────────────────────────────────────
class HCHOHotspotResponse(BaseModel):
    id: int
    cluster_id: int
    centroid_lat: float
    centroid_lon: float
    detection_date: datetime
    mean_hcho: Optional[float]
    max_hcho: Optional[float]
    area_km2: Optional[float]
    num_pixels: Optional[int]
    fire_count: int
    fire_radiative_power: Optional[float]
    fire_correlation: Optional[float]
    source_type: Optional[str]
    state: Optional[str]
    region: Optional[str]
    wind_speed: Optional[float]
    wind_direction: Optional[float]
    transport_distance_km: Optional[float]

    class Config:
        from_attributes = True


class HotspotQueryParams(BaseModel):
    """Query parameters for filtering hotspot data."""
    state: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    source_type: Optional[str] = None
    min_fire_count: Optional[int] = None


# ─────────────────────────────────────────────────────────────────
# Fire Event Schemas
# ─────────────────────────────────────────────────────────────────
class FireEventResponse(BaseModel):
    id: int
    source: str
    latitude: float
    longitude: float
    detection_time: datetime
    brightness: Optional[float]
    frp: Optional[float]
    confidence: Optional[float]
    day_night: Optional[str]
    state: Optional[str]

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────
# Dashboard Schemas
# ─────────────────────────────────────────────────────────────────
class DashboardSummary(BaseModel):
    """Aggregated statistics for the dashboard."""
    total_stations: int
    active_stations: int
    avg_aqi: Optional[float]
    max_aqi: Optional[float]
    total_hotspots: int
    total_fire_events: int
    latest_update: Optional[datetime]


class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    value: float


class TimeSeriesResponse(BaseModel):
    parameter: str
    station_name: Optional[str]
    data: List[TimeSeriesPoint]


# ─────────────────────────────────────────────────────────────────
# GeoJSON Feature Schemas (for map rendering)
# ─────────────────────────────────────────────────────────────────
class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
