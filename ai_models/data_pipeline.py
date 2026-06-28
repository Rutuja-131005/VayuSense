"""
Data Pipeline Module
=====================
Handles data collection, preprocessing, feature engineering, and
spatiotemporal matching for the CNN-LSTM model.

Data Sources
-------------
1. INSAT-3D AOD (Bhuvan / GEE)
2. Sentinel-5P TROPOMI (NO2, SO2, CO, O3, HCHO)
3. CPCB Ground Station Measurements (PM2.5, PM10, NO2, SO2, CO, O3, NH3)
4. ERA5 / IMDAA / MERRA-2 Meteorological Reanalysis
5. MODIS / VIIRS Active Fire Hotspots

Preprocessing Steps
--------------------
1. Missing Value Handling: Forward-fill + linear interpolation
2. Outlier Removal: IQR-based filtering for ground measurements
3. Normalization: Min-Max or Z-score standardization
4. Spatial Matching: Bilinear interpolation of satellite grids to station coordinates
5. Temporal Matching: Resample all sources to common temporal resolution (daily)
6. Feature Engineering: Lag features, rolling means, wind-derived features
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class DataPipeline:
    """
    End-to-end data pipeline from raw satellite/ground observations
    to model-ready feature tensors.
    """

    # Feature columns for the model
    SATELLITE_FEATURES = ["aod", "no2_col", "so2_col", "co_col", "o3_col"]
    MET_FEATURES = ["temperature", "humidity", "wind_speed", "wind_direction", "pblh"]
    TARGET_COLUMNS = ["pm25", "no2", "so2", "co", "o3", "aqi"]

    # Temporal sequence length for LSTM (7 days lookback)
    SEQUENCE_LENGTH = 7

    def __init__(self):
        self.scaler_params = {}  # Store normalization parameters

    # ─────────────────────────────────────────────────────────────
    # 1. Data Collection
    # ─────────────────────────────────────────────────────────────
    def collect_cpcb_data(self, csv_path: Optional[str] = None) -> pd.DataFrame:
        """
        Load CPCB ground station measurements.

        In production, this fetches from the CPCB API or database.
        For development, loads from CSV or generates simulated data.
        """
        if csv_path:
            try:
                df = pd.read_csv(csv_path, parse_dates=["timestamp"])
                logger.info(f"Loaded {len(df)} CPCB records from {csv_path}")
                return df
            except FileNotFoundError:
                logger.warning(f"CSV not found: {csv_path}. Generating simulated data.")

        return self._generate_simulated_ground_data()

    def collect_satellite_data(
        self, source: str = "simulated"
    ) -> pd.DataFrame:
        """
        Collect satellite observation data.
        Returns a DataFrame with columns: date, lat, lon, and satellite features.
        """
        if source == "simulated":
            return self._generate_simulated_satellite_data()
        # TODO: Implement GEE-based collection
        raise NotImplementedError(f"Source '{source}' not implemented yet.")

    def collect_meteorological_data(
        self, source: str = "simulated"
    ) -> pd.DataFrame:
        """
        Collect ERA5 / IMDAA meteorological data.
        """
        if source == "simulated":
            return self._generate_simulated_met_data()
        raise NotImplementedError(f"Source '{source}' not implemented yet.")

    # ─────────────────────────────────────────────────────────────
    # 2. Preprocessing
    # ─────────────────────────────────────────────────────────────
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values using a multi-strategy approach:
        1. Forward-fill for temporally ordered data
        2. Linear interpolation for intermediate gaps
        3. Median imputation for remaining NaN values
        """
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        # Forward fill (limit to 3 consecutive values)
        df[numeric_cols] = df[numeric_cols].ffill(limit=3)

        # Linear interpolation
        df[numeric_cols] = df[numeric_cols].interpolate(method="linear", limit_direction="both")

        # Median imputation for remaining NaN
        for col in numeric_cols:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val if not np.isnan(median_val) else 0.0)

        logger.info(f"Missing value handling complete. Remaining NaN: {df.isnull().sum().sum()}")
        return df

    def remove_outliers(
        self, df: pd.DataFrame, columns: List[str], iqr_factor: float = 2.5
    ) -> pd.DataFrame:
        """
        Remove outliers using the IQR method.

        IQR = Q3 - Q1
        Lower bound = Q1 - iqr_factor × IQR
        Upper bound = Q3 + iqr_factor × IQR

        Values outside these bounds are clipped.
        """
        for col in columns:
            if col in df.columns:
                q1 = df[col].quantile(0.25)
                q3 = df[col].quantile(0.75)
                iqr = q3 - q1
                lower = q1 - iqr_factor * iqr
                upper = q3 + iqr_factor * iqr
                outlier_count = ((df[col] < lower) | (df[col] > upper)).sum()
                df[col] = df[col].clip(lower=lower, upper=upper)
                if outlier_count > 0:
                    logger.info(f"Clipped {outlier_count} outliers in '{col}'")
        return df

    def normalize(
        self, df: pd.DataFrame, columns: List[str], method: str = "minmax"
    ) -> pd.DataFrame:
        """
        Normalize features using Min-Max or Z-score standardization.

        Min-Max: x_norm = (x - x_min) / (x_max - x_min)
        Z-score: x_norm = (x - μ) / σ
        """
        for col in columns:
            if col not in df.columns:
                continue

            if method == "minmax":
                x_min = df[col].min()
                x_max = df[col].max()
                x_range = x_max - x_min if x_max > x_min else 1.0
                df[col] = (df[col] - x_min) / x_range
                self.scaler_params[col] = {"method": "minmax", "min": x_min, "max": x_max}

            elif method == "zscore":
                mean = df[col].mean()
                std = df[col].std()
                std = std if std > 0 else 1.0
                df[col] = (df[col] - mean) / std
                self.scaler_params[col] = {"method": "zscore", "mean": mean, "std": std}

        return df

    def denormalize(self, values: np.ndarray, column: str) -> np.ndarray:
        """Reverse normalization for predictions."""
        params = self.scaler_params.get(column)
        if not params:
            return values

        if params["method"] == "minmax":
            return values * (params["max"] - params["min"]) + params["min"]
        elif params["method"] == "zscore":
            return values * params["std"] + params["mean"]
        return values

    # ─────────────────────────────────────────────────────────────
    # 3. Feature Engineering
    # ─────────────────────────────────────────────────────────────
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create derived features that enhance model performance.

        Engineered Features:
        - Temporal: day of year, month, hour, is_winter
        - Lag features: previous 1, 3, 7 day pollutant values
        - Rolling statistics: 3-day and 7-day rolling mean/std
        - Wind-derived: u/v components, ventilation coefficient
        """
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df["day_of_year"] = df["timestamp"].dt.dayofyear
            df["month"] = df["timestamp"].dt.month
            df["is_winter"] = df["month"].isin([10, 11, 12, 1, 2]).astype(int)

        # Lag features for PM2.5
        if "pm25" in df.columns:
            df["pm25_lag1"] = df["pm25"].shift(1)
            df["pm25_lag3"] = df["pm25"].shift(3)
            df["pm25_lag7"] = df["pm25"].shift(7)
            df["pm25_roll3_mean"] = df["pm25"].rolling(3, min_periods=1).mean()
            df["pm25_roll7_mean"] = df["pm25"].rolling(7, min_periods=1).mean()
            df["pm25_roll7_std"] = df["pm25"].rolling(7, min_periods=1).std().fillna(0)

        # Ventilation coefficient (wind_speed × PBLH)
        if "wind_speed" in df.columns and "pblh" in df.columns:
            df["ventilation_coeff"] = df["wind_speed"] * df["pblh"]

        # Wind u/v decomposition
        if "wind_speed" in df.columns and "wind_direction" in df.columns:
            df["wind_u"] = df["wind_speed"] * np.cos(np.radians(df["wind_direction"]))
            df["wind_v"] = df["wind_speed"] * np.sin(np.radians(df["wind_direction"]))

        # Fill NaN from lag/rolling operations
        df = df.fillna(method="bfill").fillna(0)

        logger.info(f"Feature engineering complete. Total features: {len(df.columns)}")
        return df

    # ─────────────────────────────────────────────────────────────
    # 4. Spatiotemporal Matching
    # ─────────────────────────────────────────────────────────────
    def spatial_match(
        self,
        station_df: pd.DataFrame,
        satellite_df: pd.DataFrame,
        match_radius_km: float = 25.0,
    ) -> pd.DataFrame:
        """
        Match satellite observations to ground station locations.
        Uses nearest-neighbour matching within a specified radius.

        In production, this would use bilinear interpolation of
        satellite raster grids to station lat/lon coordinates.
        """
        merged = station_df.copy()

        # Simple merge on date for simulated data
        if "date" in satellite_df.columns and "timestamp" in merged.columns:
            merged["date"] = pd.to_datetime(merged["timestamp"]).dt.date
            satellite_df["date"] = pd.to_datetime(satellite_df["date"]).dt.date

            merged = merged.merge(satellite_df, on="date", how="left", suffixes=("", "_sat"))

        logger.info(f"Spatiotemporal matching complete. Merged shape: {merged.shape}")
        return merged

    # ─────────────────────────────────────────────────────────────
    # 5. Sequence Creation for LSTM
    # ─────────────────────────────────────────────────────────────
    def create_sequences(
        self,
        df: pd.DataFrame,
        feature_cols: List[str],
        target_cols: List[str],
        seq_length: int = 7,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create overlapping sequences for LSTM input.

        Parameters
        ----------
        df : DataFrame
            Preprocessed data with features and targets.
        feature_cols : list
            Column names to use as input features.
        target_cols : list
            Column names to use as prediction targets.
        seq_length : int
            Number of timesteps in each sequence.

        Returns
        -------
        X : np.ndarray, shape (n_samples, seq_length, n_features)
        y : np.ndarray, shape (n_samples, n_targets)
        """
        features = df[feature_cols].values.astype(np.float32)
        targets = df[target_cols].values.astype(np.float32)

        X, y = [], []
        for i in range(len(features) - seq_length):
            X.append(features[i : i + seq_length])
            y.append(targets[i + seq_length])

        X = np.array(X)
        y = np.array(y)

        logger.info(f"Created {len(X)} sequences. X shape: {X.shape}, y shape: {y.shape}")
        return X, y

    # ─────────────────────────────────────────────────────────────
    # 6. Full Pipeline
    # ─────────────────────────────────────────────────────────────
    def run_pipeline(
        self, cpcb_csv: Optional[str] = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Execute the complete data pipeline end-to-end.

        Returns
        -------
        X, y : np.ndarray
            Model-ready sequences and targets.
        """
        logger.info("=" * 60)
        logger.info("Starting Data Pipeline")
        logger.info("=" * 60)

        # Collect
        ground_df = self.collect_cpcb_data(cpcb_csv)
        sat_df = self.collect_satellite_data()
        met_df = self.collect_meteorological_data()

        # Merge ground + satellite + met
        merged = self.spatial_match(ground_df, sat_df)
        if "date" in met_df.columns:
            met_df["date"] = pd.to_datetime(met_df["date"]).dt.date
            merged = merged.merge(met_df, on="date", how="left", suffixes=("", "_met"))

        # Preprocess
        merged = self.handle_missing_values(merged)
        merged = self.remove_outliers(merged, ["pm25", "pm10", "no2", "so2", "co", "o3"])
        merged = self.engineer_features(merged)

        # Select features
        feature_cols = [
            c for c in merged.columns
            if c not in self.TARGET_COLUMNS + ["timestamp", "date", "station_id", "station_name"]
            and merged[c].dtype in [np.float64, np.float32, np.int64, np.int32]
        ]
        target_cols = [c for c in self.TARGET_COLUMNS if c in merged.columns]

        # Normalize features
        merged = self.normalize(merged, feature_cols, method="minmax")

        # Create sequences
        X, y = self.create_sequences(merged, feature_cols, target_cols)

        logger.info("Pipeline complete.")
        logger.info(f"Feature columns ({len(feature_cols)}): {feature_cols[:10]}...")
        logger.info(f"Target columns: {target_cols}")
        return X, y

    # ─────────────────────────────────────────────────────────────
    # Simulated Data Generators
    # ─────────────────────────────────────────────────────────────
    def _generate_simulated_ground_data(self, n_days: int = 365) -> pd.DataFrame:
        """Generate 1 year of simulated CPCB data for 10 stations."""
        rng = np.random.default_rng(42)
        records = []

        stations = [
            ("ST001", "ITO Delhi", 28.63, 77.25),
            ("ST002", "Anand Vihar Delhi", 28.65, 77.32),
            ("ST003", "Lucknow", 26.85, 80.95),
            ("ST004", "Patna", 25.60, 85.10),
            ("ST005", "Kolkata", 22.57, 88.36),
            ("ST006", "Mumbai", 19.08, 72.88),
            ("ST007", "Chennai", 13.08, 80.27),
            ("ST008", "Bengaluru", 12.97, 77.59),
            ("ST009", "Hyderabad", 17.39, 78.49),
            ("ST010", "Ahmedabad", 23.02, 72.57),
        ]

        base_date = datetime(2023, 1, 1)
        for day in range(n_days):
            date = base_date + timedelta(days=day)
            month = date.month

            # Seasonal factor (winter = worse AQ in IGP)
            seasonal = 1.0 + 0.5 * np.cos(2 * np.pi * (month - 1) / 12)

            for sid, sname, lat, lng in stations:
                # Regional baseline
                if lat > 25:  # North India
                    base_pm25 = 80 * seasonal
                elif lat > 18:  # Central
                    base_pm25 = 50 * seasonal
                else:  # South
                    base_pm25 = 35 * seasonal

                pm25 = max(5, base_pm25 + rng.normal(0, 20))
                pm10 = pm25 * rng.uniform(1.5, 2.5)
                no2 = max(2, 30 * seasonal + rng.normal(0, 10))
                so2 = max(1, 15 * seasonal + rng.normal(0, 8))
                co = max(0.3, 1.2 * seasonal + rng.normal(0, 0.3))
                o3 = max(5, 40 + rng.normal(0, 15))

                records.append({
                    "timestamp": date,
                    "station_id": sid,
                    "station_name": sname,
                    "latitude": lat,
                    "longitude": lng,
                    "pm25": round(pm25, 2),
                    "pm10": round(pm10, 2),
                    "no2": round(no2, 2),
                    "so2": round(so2, 2),
                    "co": round(co, 2),
                    "o3": round(o3, 2),
                    "aqi": round(max(pm25, no2, o3) * 1.2, 1),
                })

        df = pd.DataFrame(records)
        logger.info(f"Generated {len(df)} simulated ground measurements.")
        return df

    def _generate_simulated_satellite_data(self, n_days: int = 365) -> pd.DataFrame:
        """Generate simulated satellite data aligned with ground data dates."""
        rng = np.random.default_rng(123)
        base_date = datetime(2023, 1, 1)

        records = []
        for day in range(n_days):
            date = base_date + timedelta(days=day)
            month = date.month
            seasonal = 1.0 + 0.3 * np.cos(2 * np.pi * (month - 1) / 12)

            records.append({
                "date": date,
                "aod": round(float(rng.uniform(0.1, 1.2) * seasonal), 4),
                "no2_col": round(float(rng.uniform(2e-5, 1.5e-4) * seasonal), 8),
                "so2_col": round(float(rng.uniform(1e-5, 8e-5) * seasonal), 8),
                "co_col": round(float(rng.uniform(0.02, 0.05)), 6),
                "o3_col": round(float(rng.uniform(0.10, 0.15)), 6),
            })

        return pd.DataFrame(records)

    def _generate_simulated_met_data(self, n_days: int = 365) -> pd.DataFrame:
        """Generate simulated ERA5 meteorological data."""
        rng = np.random.default_rng(456)
        base_date = datetime(2023, 1, 1)

        records = []
        for day in range(n_days):
            date = base_date + timedelta(days=day)
            month = date.month

            # Temperature cycle (cooler in winter, hotter in summer)
            temp = 290 + 15 * np.sin(2 * np.pi * (month - 4) / 12) + rng.normal(0, 3)

            records.append({
                "date": date,
                "temperature": round(float(temp), 2),
                "humidity": round(float(rng.uniform(25, 85)), 2),
                "wind_speed": round(float(rng.uniform(0.5, 8.0)), 2),
                "wind_direction": round(float(rng.uniform(0, 360)), 1),
                "pblh": round(float(rng.uniform(300, 2500)), 1),
            })

        return pd.DataFrame(records)


# Module-level instance
data_pipeline = DataPipeline()
