# Software Design Document (SDD)

## ISRO AQI & HCHO Hotspot Detection Platform

---

### 1. System Architecture

#### 1.1 High-Level Architecture
The system follows a three-tier architecture:
- **Presentation Layer**: React SPA with Leaflet maps and Chart.js analytics
- **Application Layer**: FastAPI REST API with service-oriented design
- **Data Layer**: SQLAlchemy ORM with SQLite/PostgreSQL + PostGIS

#### 1.2 Component Interaction

```
┌─────────────┐     HTTP/JSON      ┌─────────────────┐
│   React UI  │ ◄────────────────► │  FastAPI Server  │
│  (Port 5173)│                    │   (Port 8000)    │
└─────────────┘                    └────────┬─────────┘
                                            │
                    ┌───────────────────────┼──────────────────┐
                    │                       │                  │
            ┌───────▼──────┐    ┌───────────▼────┐   ┌────────▼─────┐
            │ GEE Service  │    │ Model Service  │   │ Hotspot Svc  │
            │ (Satellite)  │    │ (CNN-LSTM)     │   │ (DBSCAN)     │
            └──────────────┘    └────────────────┘   └──────────────┘
```

---

### 2. Database Design

#### 2.1 ER Diagram (Logical)

```
User (1) ──── (0..*) AQI_Prediction
Ground_Station (1) ──── (0..*) AQI_Measurement
HCHO_Hotspot (independent)
Fire_Event (independent)
Satellite_Dataset (independent)
```

#### 2.2 Table Schemas
- **users**: id, username, email, hashed_password, role, is_active, created_at
- **ground_stations**: id, station_id, station_name, city, state, district, latitude, longitude
- **aqi_measurements**: id, station_id (FK), timestamp, pm25, pm10, no2, so2, co, o3, nh3, aqi
- **aqi_predictions**: id, latitude, longitude, prediction_time, pred_pm25...pred_o3, pred_aqi, confidence_score
- **hcho_hotspots**: id, cluster_id, centroid_lat/lon, mean_hcho, fire_count, source_type, wind_speed
- **fire_events**: id, source, latitude, longitude, detection_time, brightness, frp, confidence
- **satellite_datasets**: id, source, product, date, spatial_resolution, bbox, file_path

---

### 3. AI Model Design

#### 3.1 CNN-LSTM Architecture

| Layer | Type | Parameters | Output Shape |
|-------|------|------------|-------------|
| Input | — | — | (B, 7, 9) |
| LSTM Layer 1 | LSTM | hidden=128, layers=2 | (B, 7, 128) |
| LSTM Output | Select last | — | (B, 128) |
| LayerNorm | Normalization | — | (B, 128) |
| FC 1 | Linear | 128→64 | (B, 64) |
| ReLU + Dropout | Activation | p=0.3 | (B, 64) |
| FC 2 | Linear | 64→32 | (B, 32) |
| ReLU | Activation | — | (B, 32) |
| FC 3 (Output) | Linear | 32→5 | (B, 5) |

Total Parameters: ~119K (trainable)

#### 3.2 Loss Function
MSE Loss: L = (1/n) Σ(ŷᵢ - yᵢ)²

#### 3.3 Optimizer
Adam with lr=1e-3, weight_decay=1e-5

#### 3.4 Regularization
- Dropout (p=0.3) in fully connected layers
- Gradient clipping (max_norm=1.0)
- Early stopping (patience=10)
- ReduceLROnPlateau (factor=0.5, patience=5)

---

### 4. API Design

#### 4.1 RESTful Endpoints

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Auth | /api/auth | Registration, Login (JWT) |
| AQI | /api/aqi | Stations, Measurements, Predictions, Satellite |
| Hotspots | /api/hotspots | HCHO Detection, Fires, Wind |
| Dashboard | /api/dashboard | Summary, Stats, Recent Predictions |

#### 4.2 Response Format
All responses use JSON. GeoJSON (RFC 7946) for spatial data.

---

### 5. Frontend Design

#### 5.1 Page Structure
- Home → Hero + Features
- Dashboard → StatCards + Charts + Tables
- AQI Map → Leaflet + Station Markers + Filters
- HCHO Analysis → Hotspot Map + Fire Overlay + Legend
- Predictions → Location Input + AQI Output + XAI Chart
- About → Methodology + Tech Stack + Team

#### 5.2 Design System
- Dark theme with ISRO blue/cyan accents
- CSS Custom Properties for theming
- Glassmorphism effects for navbar
- Staggered fade-in animations for dashboard cards
