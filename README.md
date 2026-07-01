# 🛰️ VayuSense — AI-Powered Environmental Decision Support System (EDSS)

> **Developed for ISRO Hackathon 2026 (Bhartiya Antariksh Hackathon)** — *Theme: Development of Surface AQI & Identification of HCHO Hotspots over India using Satellite Data.*

---

## 🌟 Introduction & Impact
**VayuSense** is a comprehensive, production-grade **Environmental Decision Support System (EDSS)** designed for municipal authorities, the Central Pollution Control Board (CPCB), and disaster management teams. 

By fusing multi-sensor satellite column densities (INSAT-3D, Sentinel-5P, MODIS/VIIRS) with meteorological reanalysis (ERA5) and deep learning, VayuSense bridges the gap between raw space observations and actionable, ground-level environmental governance.

---

## 🛠️ Key Platform Modules

### 1. 🌍 Global Solutions Comparison
When local air quality estimations cross a critical threshold (AQI > 100), the platform fetches and renders historical case studies from international cities/countries that faced similar pollution crises:
* **Dynamic Matching**: Links predicted AQI ranges to corresponding global cases in the database (e.g., Paris, Seoul, London, Beijing).
* **Proven Interventions**: Outlines specific, tested measures (e.g., Ultra Low Emission Zones, odd-even rules, coal plant limits) and their quantified ecological impact (e.g., 35% PM2.5 reduction).

### 2. 📋 Decision Support Engine (EDSS)
Features a fully digitalized **Graded Response Action Plan (GRAP)** matrix:
* Mapped across Stages I to IV (Moderate to Severe + / Emergency).
* Details sector-specific statutory instructions for traffic, construction, industrial emissions, and public schools to aid quick administrative rollouts.

### 3. 🔬 Scientific Validation
Demonstrates the rigor and reliability of the neural network predictions:
* Displays overall correlation metrics: R-squared ($R^2$), Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Pearson $r$.
* Provides a station-level validation table comparing satellite estimations against CPCB ground truth CAAQMS monitors.

### 4. 📈 Research Analytics
A specialized workbench for researchers and environmental scientists:
* Lists Pearson correlation matrices of satellite factors (AOD vs PM2.5, HCHO vs Fire counts, PBLH vs AQI).
* Displays regional trace gas averages (NO₂ and HCHO column densities) and active fire anomalies across India’s geographical zones.

---

## 🏗️ Architecture & Technical Stack

### Backend (FastAPI + PyTorch)
* **Framework**: FastAPI (asynchronous, high-performance API routing).
* **Database**: SQLite (SQLAlchemy ORM) with automatic seeding of historical case studies on startup.
* **AI Model**: CNN-LSTM hybrid architecture. CNN extracts spatial pollution patterns from satellite rasters, while the LSTM models temporal dynamics over a 7-day lookback window.

### Frontend (React + Vite)
* **Framework**: React 18, Vite.
* **Layout**: Full-width header navigation inspired by the **Bhartiya Antariksh Hackathon 2026** portal, containing dropdown menus, a custom satellite logo, and favicon.
* **Visualization**: Interactive Leaflet maps (wind vectors, fire layers, heatmaps) and Chart.js feature importance diagrams.

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server (this initializes and seeds the SQLite database automatically):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
*The interactive API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
*The web dashboard will be available at [http://localhost:5173/predictions](http://localhost:5173/predictions)*

---

## 📄 License
Developed for the **ISRO Hackathon 2026**. Academic and research-oriented distribution.
