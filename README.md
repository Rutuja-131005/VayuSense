# 🛰️ VayuSense

> **AI-Powered Environmental Decision Support System (EDSS)**
> Developed for **ISRO Bhartiya Antariksh Hackathon 2026**

🔗 **Live Demo:** https://vayu-sense-43ay.vercel.app/

---

## 📌 Overview

VayuSense is an AI-powered geospatial platform that predicts **Surface Air Quality Index (AQI)** and identifies **Formaldehyde (HCHO) hotspots** using satellite observations and meteorological data. The platform combines deep learning, geospatial visualization, and decision support to help environmental agencies monitor pollution and respond proactively.

---

## 🚀 Key Features

* 🌫️ AI-based Surface AQI Prediction
* 🧪 HCHO Hotspot Detection
* 🛰️ Multi-source Satellite Data Integration
* 📊 Interactive GIS Dashboard
* 📋 GRAP-based Environmental Decision Support
* 🌍 Global Pollution Mitigation Case Studies
* 📈 Scientific Validation Dashboard
* 🔬 Research Analytics & Environmental Insights

---

## 🛰️ Data Sources

* INSAT-3D
* Sentinel-5P
* MODIS / VIIRS
* ERA5 Reanalysis
* CPCB AQI (Ground Validation)

---

## 🧠 Technology Stack

| Category | Technology         |
| -------- | ------------------ |
| Frontend | React, Vite        |
| Backend  | FastAPI            |
| AI       | PyTorch (CNN-LSTM) |
| Database | SQLite, SQLAlchemy |
| Maps     | Leaflet            |
| Charts   | Chart.js           |

---

## 🏗️ System Workflow

```text
Satellite Data
      │
      ▼
Data Preprocessing
      │
      ▼
CNN-LSTM Prediction Model
      │
      ▼
AQI Prediction & HCHO Detection
      │
      ▼
Decision Support Engine
      │
      ▼
Interactive Dashboard
```

---

## ⚙️ Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API Documentation:

```
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 📂 Project Structure

```text
VayuSense
├── backend
├── frontend
├── README.md
└── requirements.txt
```

---

## 🎯 Applications

* Central & State Pollution Control Boards
* Municipal Corporations
* Smart City Initiatives
* Disaster Management Authorities
* Environmental Research
* Urban Planning

---

## 👥 Team

**Team Name:** VayuSense

Developed for the **ISRO Bhartiya Antariksh Hackathon 2026**.

---

## 📄 License

This project is developed for academic, research, and demonstration purposes as part of the **ISRO Bhartiya Antariksh Hackathon 2026**.

---

<p align="center">
<b>VayuSense</b><br>
<i>Predict • Explain • Protect</i>
</p>
