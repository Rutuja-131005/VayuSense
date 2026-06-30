# 🛰️ VayuSense — AI-Powered Environmental Decision Support System (EDSS)

> **Developed for ISRO Hackathon 2026** — *Development of Surface AQI & Identification of HCHO Hotspots over India using Satellite Data.*

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.4-ee4c2c.svg)](https://pytorch.org)
[![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-GEE-34A853.svg)](https://earthengine.google.com/)

**VayuSense** is not just a dashboard; it is a comprehensive, production-grade **Environmental Decision Support System (EDSS)** designed for ISRO scientists, the Central Pollution Control Board (CPCB), and Disaster Management Authorities. 

By fusing multi-sensor satellite data (INSAT-3D, Sentinel-5P, MODIS) with meteorological reanalysis (ERA5) and deep learning, VayuSense bridges the gap between raw satellite column densities and actionable, ground-level environmental intelligence.

---

## 🌟 The Impact

* **For Public Health:** Predicts highly accurate Surface Air Quality Index (AQI) out of raw satellite observations using a hybrid **CNN-LSTM** architecture.
* **For Disaster Management:** Automatically detects Formaldehyde (HCHO) emission hotspots and correlates them with active biomass burning and forest fires.
* **For Government Action:** Replaces traditional dashboards with a **Mission Control** interface, XAI (Explainable AI), and actionable recommendations to combat pollution at the source.

---

## 🏗️ Architecture & Data Pipeline

VayuSense utilizes a clean, decoupled microservices architecture to process massive amounts of geospatial data in near real-time.

```text
┌──────────────────────────────────────────────────────────────┐
│                  Live Satellite Feeds (GEE)                  │
│  INSAT-3D │ Sentinel-5P │ ERA5 │ MODIS/VIIRS │ CPCB         │
└─────────────────────┬────────────────────────────────────────┘
                      │
           ┌──────────▼──────────┐
           │   Data Pipeline     │ ← Auto-Sync & Preprocessing
           │   (FastAPI Backend) │
           └──────────┬──────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
   ┌──────▼───────┐     ┌─────────▼───────┐
   │ CNN-LSTM     │     │ HCHO Hotspot    │
   │ Surface AQI  │     │ Detection       │
   │ PyTorch Model│     │ (DBSCAN + Fire) │
   └──────┬───────┘     └─────────┬───────┘
          │                       │
   ┌──────▼───────────────────────▼──────┐
   │     Explainable AI (SHAP Module)    │
   └──────────────────┬──────────────────┘
                      │
   ┌──────────────────▼──────────────────┐
   │    VayuSense EDSS Mission Control   │
   │  (React + Vite + Leaflet + ChartJS) │
   └─────────────────────────────────────┘
```

---

## 🛰️ Integrated Data Sources

| Source | Product | Provider | Role in VayuSense |
|--------|---------|----------|-------------------|
| **INSAT-3D** | Aerosol Optical Depth (AOD) | ISRO | Critical baseline for particulate matter proxy. |
| **Sentinel-5P** | NO₂, SO₂, CO, O₃, HCHO | ESA/Copernicus | Identifies trace gases and HCHO emission hotspots. |
| **MODIS/VIIRS** | Active Fire Anomalies | NASA / NOAA | Correlates fire events (e.g., stubble burning) with HCHO. |
| **ERA5** | Temp, Wind, RH, PBLH | ECMWF | Enables wind transport and dispersion analysis. |
| **CPCB CAAQMS**| Ground-level PM2.5, AQI | Govt. of India | Serves as Ground Truth to train the CNN-LSTM. |

---

## 🧠 AI Engine: CNN-LSTM Hybrid + XAI

1. **Spatial Feature Extraction:** A 3-layer Convolutional Neural Network (CNN) extracts spatial anomalies from satellite rasters (e.g., industrial clusters, regional fires).
2. **Temporal Dynamics:** A 2-layer Long Short-Term Memory (LSTM) network captures the buildup and decay of pollutants over a 7-day lookback window.
3. **Explainable AI (SHAP):** VayuSense doesn't just predict; it explains. Our SHAP module visualizes feature importance, telling decision-makers *why* AQI is high (e.g., 45% Wind Transport, 30% HCHO Hotspot, 25% Low PBLH).

---

## 🚀 Quick Start (Running Locally)

### 1. Backend (FastAPI + PyTorch)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Docs available at `http://localhost:8000/docs`*

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Mission Control available at `http://localhost:5173`*

### 3. Docker (Full Stack Deployment)
```bash
docker-compose up --build
```

---

## 🏆 Project Modules (Phase 1-4 Complete)

1. **Mission Control:** Live executive dashboard tracking national AQI, active stations, and satellite connection status.
2. **Live Earth Observation:** Highly interactive geospatial Leaflet maps allowing multi-layer stacking (NO₂, HCHO, AOD, Fire, Wind).
3. **Temporal Intelligence:** Timeline sliders to animate historical replay and pollution dispersion.
4. **Decision Support Engine (Upcoming):** Actionable recommendations for health advisories based on predictive models.

---

## 📄 License
Developed for the **ISRO Hackathon 2026**. For academic, governmental, and research purposes.
