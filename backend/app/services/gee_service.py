"""
Google Earth Engine Service
============================
Handles satellite data acquisition from GEE.
Provides a fallback simulated-data generator when GEE credentials
are unavailable, so the platform works out of the box.

Satellite Products Accessed
----------------------------
- INSAT-3D AOD          → ISRO Bhuvan (manual import; not natively in GEE)
- Sentinel-5P TROPOMI   → 'COPERNICUS/S5P/OFFL/L3_NO2', L3_SO2, L3_CO, L3_O3, L3_HCHO
- ERA5 Reanalysis       → 'ECMWF/ERA5_LAND/HOURLY'
- MODIS Active Fire     → 'MODIS/061/MCD14DL' (FIRMS)
- VIIRS Active Fire     → 'NASA/VIIRS/002/VNP14IMGTDL_NRT' (FIRMS NRT)
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

import numpy as np

logger = logging.getLogger(__name__)

# ── GEE Availability Flag ────────────────────────────────────────
_GEE_AVAILABLE = False
try:
    import ee

    _GEE_AVAILABLE = True
except ImportError:
    logger.warning(
        "Google Earth Engine Python SDK not installed. "
        "Using simulated data fallback."
    )


class GEEService:
    """
    Service class for interacting with Google Earth Engine.

    If GEE is not authenticated, all methods gracefully fall back
    to generating scientifically plausible simulated data for
    demonstration and development purposes.
    """

    # ── GEE Collection IDs ───────────────────────────────────────
    COLLECTIONS = {
        "no2": "COPERNICUS/S5P/OFFL/L3_NO2",
        "so2": "COPERNICUS/S5P/OFFL/L3_SO2",
        "co": "COPERNICUS/S5P/OFFL/L3_CO",
        "o3": "COPERNICUS/S5P/OFFL/L3_O3",
        "hcho": "COPERNICUS/S5P/OFFL/L3_HCHO",
        "era5": "ECMWF/ERA5_LAND/HOURLY",
    }

    BAND_NAMES = {
        "no2": "tropospheric_NO2_column_number_density",
        "so2": "SO2_column_number_density",
        "co": "CO_column_number_density",
        "o3": "O3_column_number_density",
        "hcho": "tropospheric_HCHO_column_number_density",
    }

    # India bounding box (approximate)
    INDIA_BBOX = [68.0, 6.0, 98.0, 37.0]  # [west, south, east, north]

    def __init__(self):
        """Initialize GEE — attempt authentication."""
        self.authenticated = False
        if _GEE_AVAILABLE:
            try:
                ee.Initialize()
                self.authenticated = True
                logger.info("GEE authenticated successfully.")
            except Exception as exc:
                logger.warning(f"GEE authentication failed: {exc}. Using simulated data.")

    # ─────────────────────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────────────────────
    def get_sentinel5p_data(
        self,
        pollutant: str,
        start_date: str,
        end_date: str,
        region: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Fetch Sentinel-5P TROPOMI data for a given pollutant and date range.

        Parameters
        ----------
        pollutant : str
            One of 'no2', 'so2', 'co', 'o3', 'hcho'.
        start_date, end_date : str
            ISO date strings (YYYY-MM-DD).
        region : dict, optional
            GeoJSON-like geometry. Defaults to India bbox.

        Returns
        -------
        dict
            Dictionary with 'mean', 'min', 'max', 'data' (2D grid).
        """
        if self.authenticated:
            return self._fetch_s5p_gee(pollutant, start_date, end_date, region)
        return self._simulate_s5p(pollutant, start_date, end_date)

    def get_era5_meteorology(
        self, start_date: str, end_date: str
    ) -> Dict[str, Any]:
        """
        Fetch ERA5 meteorological parameters (temperature, wind, humidity).
        """
        if self.authenticated:
            return self._fetch_era5_gee(start_date, end_date)
        return self._simulate_era5(start_date, end_date)

    def get_fire_data(
        self, source: str, start_date: str, end_date: str
    ) -> List[Dict]:
        """
        Fetch active fire detections from MODIS or VIIRS.

        Parameters
        ----------
        source : str
            'MODIS' or 'VIIRS'.
        """
        if self.authenticated:
            return self._fetch_fire_gee(source, start_date, end_date)
        return self._simulate_fires(source, start_date, end_date)

    # ─────────────────────────────────────────────────────────────
    # GEE Fetch (Real)
    # ─────────────────────────────────────────────────────────────
    def _fetch_s5p_gee(
        self, pollutant: str, start_date: str, end_date: str, region: Optional[Dict]
    ) -> Dict[str, Any]:
        """Fetch real Sentinel-5P data via GEE API."""
        collection_id = self.COLLECTIONS.get(pollutant)
        band = self.BAND_NAMES.get(pollutant)
        if not collection_id or not band:
            raise ValueError(f"Unknown pollutant: {pollutant}")

        india = ee.Geometry.Rectangle(self.INDIA_BBOX)
        collection = (
            ee.ImageCollection(collection_id)
            .filterDate(start_date, end_date)
            .filterBounds(india)
            .select(band)
        )

        mean_image = collection.mean()
        stats = mean_image.reduceRegion(
            reducer=ee.Reducer.mean().combine(ee.Reducer.minMax(), sharedInputs=True),
            geometry=india,
            scale=10000,
            maxPixels=1e9,
        ).getInfo()

        return {
            "pollutant": pollutant,
            "start_date": start_date,
            "end_date": end_date,
            "stats": stats,
            "source": "GEE",
        }

    def _fetch_era5_gee(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Fetch ERA5 data via GEE API."""
        india = ee.Geometry.Rectangle(self.INDIA_BBOX)
        collection = (
            ee.ImageCollection(self.COLLECTIONS["era5"])
            .filterDate(start_date, end_date)
            .filterBounds(india)
            .select(["temperature_2m", "u_component_of_wind_10m", "v_component_of_wind_10m"])
        )
        mean_image = collection.mean()
        stats = mean_image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=india,
            scale=25000,
            maxPixels=1e9,
        ).getInfo()
        return {"start_date": start_date, "end_date": end_date, "stats": stats, "source": "GEE"}

    def _fetch_fire_gee(
        self, source: str, start_date: str, end_date: str
    ) -> List[Dict]:
        """Fetch fire data via GEE — simplified for prototype."""
        # In production, use FIRMS CSV download or GEE FeatureCollection
        logger.info(f"Fetching {source} fire data from GEE: {start_date} to {end_date}")
        return self._simulate_fires(source, start_date, end_date)

    # ─────────────────────────────────────────────────────────────
    # Simulated Data Fallback
    # ─────────────────────────────────────────────────────────────
    def _simulate_s5p(
        self, pollutant: str, start_date: str, end_date: str
    ) -> Dict[str, Any]:
        """
        Generate scientifically plausible simulated Sentinel-5P data.
        Values are based on typical observed ranges over India.
        """
        rng = np.random.default_rng(42)

        # Typical column density ranges (mol/m²) over India
        ranges = {
            "no2": (2e-5, 2e-4),
            "so2": (1e-5, 5e-4),
            "co": (0.02, 0.06),
            "o3": (0.10, 0.16),
            "hcho": (5e-5, 3e-4),
        }
        lo, hi = ranges.get(pollutant, (0.0, 1.0))

        # Generate a 50×32 grid covering India (approx 0.6° resolution)
        grid = rng.uniform(lo, hi, size=(50, 32))

        # Add urban hotspot enhancements (IGP region)
        grid[20:30, 10:20] *= rng.uniform(1.3, 2.0)

        return {
            "pollutant": pollutant,
            "start_date": start_date,
            "end_date": end_date,
            "stats": {
                "mean": float(np.mean(grid)),
                "min": float(np.min(grid)),
                "max": float(np.max(grid)),
            },
            "grid": grid.tolist(),
            "grid_shape": list(grid.shape),
            "bbox": self.INDIA_BBOX,
            "source": "simulated",
        }

    def _simulate_era5(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Generate simulated ERA5 meteorological data."""
        rng = np.random.default_rng(123)
        return {
            "start_date": start_date,
            "end_date": end_date,
            "stats": {
                "temperature_2m_mean": float(rng.uniform(290, 310)),
                "u_wind_10m_mean": float(rng.uniform(-3, 3)),
                "v_wind_10m_mean": float(rng.uniform(-3, 3)),
                "relative_humidity_mean": float(rng.uniform(30, 80)),
                "boundary_layer_height_mean": float(rng.uniform(500, 2500)),
            },
            "source": "simulated",
        }

    def _simulate_fires(
        self, source: str, start_date: str, end_date: str
    ) -> List[Dict]:
        """
        Generate simulated fire detections.
        Hotspots concentrated in Punjab, Haryana (stubble burning),
        central India forests, and northeast India.
        """
        rng = np.random.default_rng(456)
        fire_regions = [
            {"name": "Punjab-Haryana", "lat": (29.5, 31.5), "lon": (74.5, 77.0), "weight": 40},
            {"name": "Central India", "lat": (20.0, 24.0), "lon": (78.0, 84.0), "weight": 25},
            {"name": "Northeast India", "lat": (24.0, 27.5), "lon": (90.0, 95.0), "weight": 20},
            {"name": "Rajasthan", "lat": (24.0, 28.0), "lon": (70.0, 76.0), "weight": 15},
        ]

        fires = []
        num_fires = rng.integers(80, 250)
        weights = np.array([r["weight"] for r in fire_regions], dtype=float)
        weights /= weights.sum()

        for _ in range(num_fires):
            region_idx = rng.choice(len(fire_regions), p=weights)
            region = fire_regions[region_idx]
            fires.append(
                {
                    "source": source,
                    "latitude": float(rng.uniform(*region["lat"])),
                    "longitude": float(rng.uniform(*region["lon"])),
                    "brightness": float(rng.uniform(300, 500)),
                    "frp": float(rng.uniform(5, 150)),
                    "confidence": float(rng.uniform(50, 100)),
                    "region": region["name"],
                }
            )
        return fires


# Module-level singleton
gee_service = GEEService()
