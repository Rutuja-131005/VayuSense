# 🛰️ VayuSense — ISRO AQI & HCHO Hotspot Detection Platform

> **VayuSense** developed for **ISRO Hackathon 2026** — Development of Surface AQI & Identification of HCHO Hotspots over India using Satellite Data

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-ee4c2c.svg)](https://pytorch.org)

---

## 📋 Problem Statement

Develop an AI-powered web platform that:

1. **Surface AQI Estimation**: Uses satellite observations (INSAT-3D AOD, Sentinel-5P NO₂/SO₂/CO/O₃) and meteorological reanalysis (ERA5) combined with CPCB ground measurements to predict surface-level Air Quality Index using a CNN-LSTM deep learning model.

2. **HCHO Hotspot Identification**: Detects formaldehyde emission hotspots using Sentinel-5P HCHO data, correlates with MODIS/VIIRS active fire detections, and performs wind transport analysis for source region identification.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
│  INSAT-3D │ Sentinel-5P │ ERA5 │ MODIS/VIIRS │ CPCB         │
└─────────────────────┬────────────────────────────────────────┘
                      │
           ┌──────────▼──────────┐
           │   Data Pipeline     │ ← GEE API / Simulated Fallback
           │   (Preprocessing)   │
           └──────────┬──────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
   ┌──────▼───────┐     ┌────────▼────────┐
   │  CNN-LSTM    │     │ HCHO Hotspot    │
   │  AQI Model   │     │ Detection       │
   └──────┬───────┘     │ (DBSCAN + Fire) │
          │              └────────┬────────┘
          │                       │
   ┌──────▼───────────────────────▼──────┐
   │          FastAPI Backend            │
   │     (REST APIs + SQLAlchemy)        │
   └──────────────────┬─────────────────┘
                      │
   ┌──────────────────▼──────────────────┐
   │       React + TypeScript Frontend   │
   │    (Leaflet Maps + Chart.js)        │
   └─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

The backend API will be available at `http://localhost:8000/docs`
The frontend will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
AQI/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/                # REST API Routes
│   │   │   ├── auth.py         # Authentication (JWT)
│   │   │   ├── aqi.py          # AQI data & predictions
│   │   │   ├── hotspots.py     # HCHO hotspot detection
│   │   │   └── dashboard.py    # Dashboard aggregations
│   │   ├── core/               # Configuration & Database
│   │   ├── models/             # SQLAlchemy ORM Models
│   │   ├── schemas/            # Pydantic Request/Response
│   │   ├── services/           # Business Logic
│   │   │   ├── gee_service.py  # Google Earth Engine
│   │   │   ├── model_service.py# CNN-LSTM Inference
│   │   │   └── hotspot_service.py
│   │   ├── utils/              # Spatial Processing & XAI
│   │   └── main.py             # FastAPI Entry Point
│   ├── tests/                  # pytest Test Suite
│   └── requirements.txt
├── frontend/                   # React + TypeScript Frontend
│   └── src/
│       ├── components/         # Reusable UI Components
│       ├── pages/              # Page Components
│       └── services/           # API Client
├── ai_models/                  # Deep Learning Module
│   ├── model.py                # CNN-LSTM Architecture
│   ├── train.py                # Training Pipeline
│   ├── evaluate.py             # Evaluation Metrics
│   └── data_pipeline.py        # Data Processing
├── docs/                       # Documentation
├── docker-compose.yml          # Docker Orchestration
└── README.md
```

---

## 🧠 AI Model — CNN-LSTM Hybrid

### Architecture
- **CNN Block**: Conv2D → BatchNorm → ReLU → MaxPool (3 layers) for spatial feature extraction from satellite rasters
- **LSTM Block**: 2-layer LSTM with LayerNorm for temporal dynamics (7-day lookback)
- **Output Head**: Fully connected layers predicting PM2.5, NO₂, SO₂, CO, O₃

### Training
```bash
cd ai_models
python train.py
```

### Evaluation Metrics
| Metric | Formula |
|--------|---------|
| RMSE | √(1/n · Σ(ŷᵢ - yᵢ)²) |
| MAE | (1/n) · Σ\|ŷᵢ - yᵢ\| |
| R | Pearson correlation coefficient |
| R² | 1 - SS_res / SS_tot |

---

## 🗺️ Data Sources

| Source | Product | Provider |
|--------|---------|----------|
| INSAT-3D | Aerosol Optical Depth (AOD) | ISRO |
| Sentinel-5P TROPOMI | NO₂, SO₂, CO, O₃, HCHO | ESA/Copernicus |
| MODIS (MCD14DL) | Active Fire Hotspots | NASA |
| VIIRS (VNP14IMGTDL) | Active Fire NRT | NASA/NOAA |
| ERA5 | Temperature, Wind, RH, PBLH | ECMWF |
| CPCB CAAQMS | Ground-level PM2.5, AQI | Govt. of India |

---

## 🔬 HCHO Hotspot Detection

1. **DBSCAN Clustering** on elevated Sentinel-5P HCHO columns (threshold: 1×10⁻⁴ mol/m²)
2. **Fire Correlation** with co-located MODIS/VIIRS detections (Pearson r)
3. **Source Classification**: Biomass burning, industrial, biogenic, mixed
4. **Wind Transport**: ERA5 u/v trajectory integration for downwind dispersion estimation

---

## 📊 API Documentation

After starting the backend, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT authentication |
| GET | `/api/aqi/stations/geojson` | Station locations as GeoJSON |
| POST | `/api/aqi/predict` | AI-based AQI prediction |
| POST | `/api/aqi/predict/explain` | Prediction + XAI analysis |
| GET | `/api/aqi/map/india` | India-wide AQI heatmap |
| GET | `/api/hotspots/detect` | Run HCHO hotspot detection |
| GET | `/api/hotspots/fires` | Active fire events |
| GET | `/api/hotspots/wind-transport` | Wind field vectors |
| GET | `/api/dashboard/summary` | Dashboard statistics |

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

---

## 👥 Team (4 Members)

| Member | Role | Focus Area |
|--------|------|------------|
| 1 | Remote Sensing / AI | Data Pipeline, CNN-LSTM Training |
| 2 | Backend / GIS | FastAPI, Hotspot Detection, PostGIS |
| 3 | Frontend / UI | React, Leaflet Maps, Chart.js |
| 4 | QA / Documentation | Testing, XAI, SRS, Deployment |

---

## 📄 License

Developed for ISRO Hackathon 2026. For academic and research purposes.
