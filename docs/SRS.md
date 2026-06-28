# Software Requirements Specification (SRS)

## ISRO AQI & HCHO Hotspot Detection Platform

### 1. Introduction

#### 1.1 Purpose
This SRS defines the functional and non-functional requirements for an AI-powered web platform that estimates Surface Air Quality Index (AQI) and identifies Formaldehyde (HCHO) hotspots over India using satellite observations and deep learning.

#### 1.2 Scope
The system processes multi-sensor satellite data (INSAT-3D, Sentinel-5P TROPOMI), ground truth measurements (CPCB CAAQMS), and meteorological reanalysis (ERA5) to generate spatial AQI predictions and HCHO hotspot maps with fire correlation and wind transport analysis.

---

### 2. System Overview

| Component | Technology |
|-----------|-----------|
| AI Model | PyTorch CNN-LSTM Hybrid |
| Backend | Python FastAPI + SQLAlchemy |
| Frontend | React + TypeScript + Leaflet |
| Database | SQLite (dev) / PostgreSQL + PostGIS (prod) |
| Geospatial | Google Earth Engine, GeoPandas, Rasterio |

---

### 3. Functional Requirements

#### FR-01: User Authentication
- Users shall register with username, email, password.
- System shall issue JWT tokens upon successful login.

#### FR-02: AQI Data Retrieval
- System shall display CPCB ground station locations on an interactive map.
- System shall retrieve and display AQI measurements filtered by state, date, and pollutant.

#### FR-03: AI-Based AQI Prediction
- Users shall input latitude and longitude (within India).
- System shall predict PM2.5, NO₂, SO₂, CO, O₃ concentrations and compute AQI.
- System shall display prediction confidence score and model version.

#### FR-04: Explainable AI
- For each prediction, system shall generate feature importance scores.
- System shall provide a natural-language scientific explanation of key factors.

#### FR-05: HCHO Hotspot Detection
- System shall cluster elevated HCHO columns using DBSCAN.
- System shall correlate hotspots with MODIS/VIIRS fire detections.
- System shall classify source types (biomass burning, industrial, biogenic).

#### FR-06: Wind Transport Analysis
- System shall display ERA5 wind vectors on the map.
- System shall compute forward trajectories from hotspot centroids.

#### FR-07: Interactive Dashboard
- Dashboard shall display summary statistics (station count, avg AQI, hotspot count).
- Dashboard shall show pollutant distribution charts, time series, and category breakdown.
- Dashboard shall show state-wise AQI comparison table.

#### FR-08: Satellite Data Visualization
- System shall render satellite-derived pollutant layers as heatmaps.
- System shall support date range selection for temporal analysis.

---

### 4. Non-Functional Requirements

#### NFR-01: Performance
- API response time shall be < 2 seconds for non-ML endpoints.
- Model inference shall complete within 5 seconds.

#### NFR-02: Scalability
- System shall support at least 100 concurrent users.

#### NFR-03: Security
- Passwords shall be hashed using bcrypt.
- API endpoints shall be protected with JWT authentication.

#### NFR-04: Availability
- System shall be deployable via Docker for reproducibility.

#### NFR-05: Accuracy
- Model predictions shall be validated against CPCB ground truth using RMSE, MAE, R, and R².

---

### 5. Data Sources

| Source | Provider | Access | Product |
|--------|----------|--------|---------|
| INSAT-3D | ISRO | Bhuvan | AOD |
| Sentinel-5P | ESA | GEE/Copernicus Hub | NO₂, SO₂, CO, O₃, HCHO |
| MODIS | NASA | FIRMS | Active Fire (MCD14DL) |
| VIIRS | NASA/NOAA | FIRMS | Active Fire NRT |
| ERA5 | ECMWF | CDS/GEE | Temperature, Wind, PBLH |
| CPCB | Govt. of India | CPCB Portal | Ground AQI |
