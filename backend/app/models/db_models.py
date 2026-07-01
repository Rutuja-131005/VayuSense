"""
Database ORM Models
====================
SQLAlchemy models for the AQI & HCHO Hotspot platform.
Designed for SQLite (local) or PostgreSQL + PostGIS (production).
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    Text,
    Boolean,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# ─────────────────────────────────────────────────────────────────
# 1. Users & Authentication
# ─────────────────────────────────────────────────────────────────
class User(Base):
    """Platform user for authentication and access control."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="viewer")  # viewer | analyst | admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ─────────────────────────────────────────────────────────────────
# 2. CPCB Ground Stations
# ─────────────────────────────────────────────────────────────────
class GroundStation(Base):
    """
    CPCB Continuous Ambient Air Quality Monitoring Station (CAAQMS).
    Each station has a fixed lat/lon and belongs to a State/District.
    """

    __tablename__ = "ground_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), unique=True, nullable=False)
    station_name = Column(String(200), nullable=False)
    city = Column(String(100))
    state = Column(String(100), index=True)
    district = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    station_type = Column(String(50))  # CAAQMS, NAAQMS, Manual
    is_active = Column(Boolean, default=True)

    # Relationship to measurements
    measurements = relationship("AQIMeasurement", back_populates="station")


# ─────────────────────────────────────────────────────────────────
# 3. AQI Measurements
# ─────────────────────────────────────────────────────────────────
class AQIMeasurement(Base):
    """
    Hourly or daily air quality measurements from a CPCB ground station.
    Stores individual pollutant concentrations and the computed AQI.
    """

    __tablename__ = "aqi_measurements"
    __table_args__ = (
        Index("ix_aqi_station_time", "station_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(
        Integer, ForeignKey("ground_stations.id"), nullable=False
    )
    timestamp = Column(DateTime, nullable=False, index=True)

    # Pollutant concentrations (µg/m³ or mg/m³ as per CPCB)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)   # mg/m³
    o3 = Column(Float, nullable=True)
    nh3 = Column(Float, nullable=True)

    # Computed AQI (National AQI standard)
    aqi = Column(Float, nullable=True)
    aqi_category = Column(String(30), nullable=True)
    prominent_pollutant = Column(String(10), nullable=True)

    # Relationship
    station = relationship("GroundStation", back_populates="measurements")


# ─────────────────────────────────────────────────────────────────
# 4. Satellite Data Metadata
# ─────────────────────────────────────────────────────────────────
class SatelliteDataset(Base):
    """
    Metadata for downloaded/processed satellite raster datasets.
    Tracks INSAT-3D, Sentinel-5P, ERA5, MODIS/VIIRS products.
    """

    __tablename__ = "satellite_datasets"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(30), nullable=False)     # INSAT-3D, Sentinel-5P, ERA5, MODIS, VIIRS
    product = Column(String(50), nullable=False)     # AOD, NO2, SO2, CO, O3, HCHO, Fire
    date = Column(DateTime, nullable=False, index=True)
    spatial_resolution = Column(Float, nullable=True)  # km
    bbox_west = Column(Float)
    bbox_east = Column(Float)
    bbox_south = Column(Float)
    bbox_north = Column(Float)
    file_path = Column(Text, nullable=True)
    processing_status = Column(String(20), default="pending")  # pending | processed | failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ─────────────────────────────────────────────────────────────────
# 5. Model Predictions
# ─────────────────────────────────────────────────────────────────
class AQIPrediction(Base):
    """
    AI model predictions for surface AQI at a given location and time.
    Links back to the ground station for validation.
    """

    __tablename__ = "aqi_predictions"
    __table_args__ = (
        Index("ix_pred_location_time", "latitude", "longitude", "prediction_time"),
    )

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    prediction_time = Column(DateTime, nullable=False)

    # Predicted pollutant concentrations
    pred_pm25 = Column(Float)
    pred_no2 = Column(Float)
    pred_so2 = Column(Float)
    pred_co = Column(Float)
    pred_o3 = Column(Float)

    # Predicted AQI
    pred_aqi = Column(Float)
    pred_category = Column(String(30))
    confidence_score = Column(Float)

    # SHAP / XAI top contributing features
    top_features = Column(Text, nullable=True)  # JSON string

    model_version = Column(String(20), default="v1.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ─────────────────────────────────────────────────────────────────
# 6. HCHO Hotspots
# ─────────────────────────────────────────────────────────────────
class HCHOHotspot(Base):
    """
    Detected HCHO hotspot clusters with associated fire correlation
    and wind transport metadata.
    """

    __tablename__ = "hcho_hotspots"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, nullable=False)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    detection_date = Column(DateTime, nullable=False, index=True)

    # HCHO statistics for the cluster
    mean_hcho = Column(Float)         # mol/m²
    max_hcho = Column(Float)
    area_km2 = Column(Float)
    num_pixels = Column(Integer)

    # Fire correlation
    fire_count = Column(Integer, default=0)
    fire_radiative_power = Column(Float, nullable=True)  # MW
    fire_correlation = Column(Float, nullable=True)       # Pearson r

    # Source identification
    source_type = Column(String(50))  # biomass_burning, industrial, biogenic, mixed
    state = Column(String(100))
    region = Column(String(200))

    # Wind transport
    wind_speed = Column(Float, nullable=True)      # m/s
    wind_direction = Column(Float, nullable=True)   # degrees
    transport_distance_km = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# ─────────────────────────────────────────────────────────────────
# 7. Fire Events
# ─────────────────────────────────────────────────────────────────
class FireEvent(Base):
    """
    MODIS / VIIRS active fire detections over India.
    """

    __tablename__ = "fire_events"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(10), nullable=False)  # MODIS or VIIRS
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    detection_time = Column(DateTime, nullable=False, index=True)
    brightness = Column(Float, nullable=True)     # K (brightness temperature)
    frp = Column(Float, nullable=True)            # Fire Radiative Power (MW)
    confidence = Column(Float, nullable=True)     # Detection confidence (%)
    day_night = Column(String(1), nullable=True)  # D or N
    state = Column(String(100))


# ─────────────────────────────────────────────────────────────────
# 8. Global Case Studies (Solutions Comparison)
# ─────────────────────────────────────────────────────────────────
class GlobalCaseStudy(Base):
    """
    Historical international case studies documenting how specific cities/regions
    combated similar air pollution episodes in the past.
    """

    __tablename__ = "global_case_studies"

    id = Column(Integer, primary_key=True, index=True)
    target_city = Column(String(100), nullable=False)
    target_country = Column(String(100), nullable=False)
    historical_aqi = Column(Integer, nullable=False)
    aqi_category = Column(String(50), nullable=False)  # Moderate, Poor, Very Poor, Severe
    context = Column(Text, nullable=False)              # Background context of the event
    policies = Column(Text, nullable=False)             # JSON list of policy measures
    impact = Column(Text, nullable=False)               # Quantitative or qualitative impact metrics
    source_docs = Column(Text, nullable=True)           # Original documentation source info or links

    __table_args__ = (
        Index("ix_case_study_aqi", "historical_aqi"),
    )

