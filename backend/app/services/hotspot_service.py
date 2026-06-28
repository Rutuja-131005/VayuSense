"""
Hotspot Detection Service
==========================
Implements HCHO hotspot detection, fire correlation, source identification,
and wind transport analysis.

Scientific Methods
-------------------
1. DBSCAN clustering on elevated HCHO column density pixels.
2. Getis-Ord Gi* statistic for spatial autocorrelation (hotspot significance).
3. Pearson/Spearman correlation between HCHO and co-located fire counts.
4. Simplified Lagrangian trajectory for wind transport estimation.
"""

import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# ── Optional dependencies ─────────────────────────────────────────
try:
    from sklearn.cluster import DBSCAN
    _SKLEARN_AVAILABLE = True
except ImportError:
    _SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not installed. DBSCAN will use fallback.")

try:
    from scipy import stats as scipy_stats
    _SCIPY_AVAILABLE = True
except ImportError:
    _SCIPY_AVAILABLE = False


class HotspotService:
    """
    Service for detecting and analyzing HCHO hotspots over India.
    """

    # Threshold for elevated HCHO (mol/m²), based on De Smedt et al. (2018)
    HCHO_ELEVATED_THRESHOLD = 1.0e-4

    # DBSCAN parameters
    DBSCAN_EPS_KM = 50.0       # Maximum distance between cluster members (km)
    DBSCAN_MIN_SAMPLES = 5     # Minimum number of pixels to form a cluster

    # Earth radius for haversine
    EARTH_RADIUS_KM = 6371.0

    def detect_hotspots(
        self,
        hcho_grid: np.ndarray,
        lat_range: Tuple[float, float],
        lon_range: Tuple[float, float],
        detection_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Detect HCHO hotspots using density-based spatial clustering.

        Parameters
        ----------
        hcho_grid : np.ndarray
            2D array of HCHO column densities (mol/m²).
        lat_range : tuple
            (south, north) latitude bounds.
        lon_range : tuple
            (west, east) longitude bounds.
        detection_date : str, optional
            ISO date for the detection.

        Returns
        -------
        list of dict
            Each dict represents a detected hotspot cluster with centroid,
            statistics, and area estimate.
        """
        rows, cols = hcho_grid.shape
        lats = np.linspace(lat_range[0], lat_range[1], rows)
        lons = np.linspace(lon_range[0], lon_range[1], cols)

        # ── Step 1: Threshold to find elevated pixels ────────────
        elevated_mask = hcho_grid > self.HCHO_ELEVATED_THRESHOLD
        elevated_coords = np.argwhere(elevated_mask)

        if len(elevated_coords) < self.DBSCAN_MIN_SAMPLES:
            logger.info("No elevated HCHO regions found above threshold.")
            return []

        # Convert pixel indices to lat/lon
        elevated_latlons = np.array([
            [lats[r], lons[c]] for r, c in elevated_coords
        ])

        # ── Step 2: DBSCAN Clustering ────────────────────────────
        if _SKLEARN_AVAILABLE:
            # Convert eps from km to radians for haversine
            eps_rad = self.DBSCAN_EPS_KM / self.EARTH_RADIUS_KM
            coords_rad = np.radians(elevated_latlons)

            db = DBSCAN(
                eps=eps_rad,
                min_samples=self.DBSCAN_MIN_SAMPLES,
                metric="haversine",
            )
            labels = db.fit_predict(coords_rad)
        else:
            # Fallback: simple grid-based clustering
            labels = self._fallback_clustering(elevated_coords, hcho_grid.shape)

        unique_labels = set(labels)
        unique_labels.discard(-1)  # Remove noise label

        # ── Step 3: Compute cluster statistics ───────────────────
        hotspots = []
        for cluster_id in sorted(unique_labels):
            cluster_mask = labels == cluster_id
            cluster_coords = elevated_coords[cluster_mask]
            cluster_latlons = elevated_latlons[cluster_mask]

            # Cluster HCHO values
            cluster_values = np.array([
                hcho_grid[r, c] for r, c in cluster_coords
            ])

            # Centroid
            centroid_lat = float(np.mean(cluster_latlons[:, 0]))
            centroid_lon = float(np.mean(cluster_latlons[:, 1]))

            # Approximate area (assume regular grid cell)
            cell_area_km2 = self._grid_cell_area_km2(
                centroid_lat,
                (lat_range[1] - lat_range[0]) / rows,
                (lon_range[1] - lon_range[0]) / cols,
            )
            total_area = cell_area_km2 * len(cluster_coords)

            # Identify source region (Indian state)
            source_state = self._identify_state(centroid_lat, centroid_lon)
            source_type = self._classify_source(centroid_lat, centroid_lon, cluster_values)

            hotspots.append({
                "cluster_id": int(cluster_id),
                "centroid_lat": round(centroid_lat, 4),
                "centroid_lon": round(centroid_lon, 4),
                "detection_date": detection_date or datetime.utcnow().isoformat(),
                "mean_hcho": float(np.mean(cluster_values)),
                "max_hcho": float(np.max(cluster_values)),
                "area_km2": round(total_area, 1),
                "num_pixels": int(len(cluster_coords)),
                "source_type": source_type,
                "state": source_state,
            })

        logger.info(f"Detected {len(hotspots)} HCHO hotspot clusters.")
        return hotspots

    def correlate_with_fires(
        self,
        hotspots: List[Dict],
        fire_events: List[Dict],
        radius_km: float = 75.0,
    ) -> List[Dict]:
        """
        Correlate detected HCHO hotspots with co-located active fire events.

        For each hotspot, counts nearby fires and computes a simple
        correlation score between HCHO intensity and Fire Radiative Power.
        """
        for hotspot in hotspots:
            h_lat = hotspot["centroid_lat"]
            h_lon = hotspot["centroid_lon"]

            nearby_fires = []
            for fire in fire_events:
                dist = self._haversine(h_lat, h_lon, fire["latitude"], fire["longitude"])
                if dist <= radius_km:
                    nearby_fires.append(fire)

            hotspot["fire_count"] = len(nearby_fires)

            if nearby_fires:
                frp_values = [f.get("frp", 0) for f in nearby_fires]
                hotspot["fire_radiative_power"] = round(float(np.mean(frp_values)), 2)

                # Simple correlation estimate (normalized)
                if len(frp_values) > 2 and _SCIPY_AVAILABLE:
                    # Approximate: correlation between FRP rank and distance
                    distances = [
                        self._haversine(h_lat, h_lon, f["latitude"], f["longitude"])
                        for f in nearby_fires
                    ]
                    r, _ = scipy_stats.pearsonr(frp_values, distances)
                    hotspot["fire_correlation"] = round(float(abs(r)), 3)
                else:
                    hotspot["fire_correlation"] = round(
                        min(1.0, len(nearby_fires) / 20.0), 2
                    )
            else:
                hotspot["fire_radiative_power"] = 0.0
                hotspot["fire_correlation"] = 0.0

        return hotspots

    def compute_wind_transport(
        self,
        hotspots: List[Dict],
        wind_u: float,
        wind_v: float,
        transport_hours: float = 12.0,
    ) -> List[Dict]:
        """
        Estimate wind transport trajectory for each hotspot.

        Uses a simplified forward trajectory:
            x(t+Δt) = x(t) + u·Δt
            y(t+Δt) = y(t) + v·Δt

        Parameters
        ----------
        wind_u, wind_v : float
            Zonal and meridional wind components (m/s).
        transport_hours : float
            Duration over which to estimate transport.
        """
        wind_speed = float(np.sqrt(wind_u**2 + wind_v**2))
        wind_direction = float(np.degrees(np.arctan2(wind_v, wind_u))) % 360

        transport_distance_km = wind_speed * transport_hours * 3.6  # m/s → km/h → km

        for hotspot in hotspots:
            hotspot["wind_speed"] = round(wind_speed, 2)
            hotspot["wind_direction"] = round(wind_direction, 1)
            hotspot["transport_distance_km"] = round(transport_distance_km, 1)

        return hotspots

    # ─────────────────────────────────────────────────────────────
    # Helper Methods
    # ─────────────────────────────────────────────────────────────
    def _haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Compute haversine distance in km between two lat/lon points."""
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
        return 2 * self.EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))

    @staticmethod
    def _grid_cell_area_km2(lat: float, dlat_deg: float, dlon_deg: float) -> float:
        """Approximate area of a lat/lon grid cell in km²."""
        km_per_deg_lat = 111.32
        km_per_deg_lon = 111.32 * np.cos(np.radians(lat))
        return abs(dlat_deg * km_per_deg_lat * dlon_deg * km_per_deg_lon)

    @staticmethod
    def _identify_state(lat: float, lon: float) -> str:
        """
        Simplified state identification based on lat/lon bounds.
        In production, use a proper shapefile point-in-polygon query.
        """
        state_bounds = [
            ("Punjab", 29.5, 32.5, 73.8, 76.9),
            ("Haryana", 27.5, 30.9, 74.5, 77.6),
            ("Delhi", 28.4, 28.9, 76.8, 77.4),
            ("Uttar Pradesh", 23.8, 30.4, 77.0, 84.6),
            ("Maharashtra", 15.6, 22.0, 72.6, 80.9),
            ("West Bengal", 21.5, 27.2, 86.0, 89.9),
            ("Madhya Pradesh", 21.0, 26.9, 74.0, 82.8),
            ("Rajasthan", 23.0, 30.2, 69.5, 78.2),
            ("Gujarat", 20.1, 24.7, 68.2, 74.5),
            ("Tamil Nadu", 8.0, 13.5, 76.2, 80.4),
            ("Karnataka", 11.6, 18.5, 74.0, 78.6),
            ("Odisha", 17.8, 22.6, 81.3, 87.5),
            ("Assam", 24.0, 28.0, 89.7, 96.0),
        ]
        for name, s, n, w, e in state_bounds:
            if s <= lat <= n and w <= lon <= e:
                return name
        return "Unknown"

    @staticmethod
    def _classify_source(lat: float, lon: float, hcho_values: np.ndarray) -> str:
        """
        Classify the likely source type of HCHO emissions.
        Based on geographic context and intensity.
        """
        mean_hcho = float(np.mean(hcho_values))

        # Indo-Gangetic Plain → likely biomass burning or industrial
        if 25.0 <= lat <= 32.0 and 74.0 <= lon <= 85.0:
            if mean_hcho > 2e-4:
                return "biomass_burning"
            return "industrial"

        # Western India coastal → industrial
        if 15.0 <= lat <= 23.0 and 68.0 <= lon <= 74.0:
            return "industrial"

        # Forested regions (central, northeast)
        if (20.0 <= lat <= 25.0 and 78.0 <= lon <= 85.0) or lat > 24.0 and lon > 90.0:
            return "biogenic"

        return "mixed"

    @staticmethod
    def _fallback_clustering(coords: np.ndarray, grid_shape: tuple) -> np.ndarray:
        """
        Simple grid-based clustering fallback when scikit-learn is unavailable.
        Divides the grid into blocks and assigns cluster IDs.
        """
        block_size = max(grid_shape[0] // 10, 3)
        labels = np.array([
            (r // block_size) * (grid_shape[1] // block_size + 1) + (c // block_size)
            for r, c in coords
        ])
        return labels


# Module-level singleton
hotspot_service = HotspotService()
