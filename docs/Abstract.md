# Abstract

**Title:** AI-Powered Surface AQI Estimation and HCHO Hotspot Detection using Multi-Sensor Satellite Data

**Team:** 4 Members
**Event:** ISRO Hackathon 2026

**Background:** 
Air quality monitoring in India is predominantly reliant on sparse ground-based stations, leaving vast rural and semi-urban regions unmonitored. Furthermore, identifying the precise locations and sources of localized emissions, such as Formaldehyde (HCHO) from biomass burning or industrial activity, remains a critical challenge for regulatory authorities.

**Methodology:**
This project presents an integrated, production-ready geospatial platform that leverages multi-sensor satellite data to provide continuous, high-resolution air quality intelligence. The solution addresses two primary objectives:

1. **Surface AQI Estimation:** We developed a hybrid CNN-LSTM deep learning architecture. The CNN extracts spatial gradients from satellite raster patches (INSAT-3D AOD, Sentinel-5P TROPOMI NO₂, SO₂, CO, O₃), while the LSTM models temporal dynamics and meteorological interactions (ERA5 temperature, RH, wind, PBLH). Trained against CPCB CAAQMS ground truth, the model predicts surface-level pollutant concentrations and standard AQI with high accuracy. Explainable AI (SHAP) is integrated to provide physics-informed feature attribution for each prediction.

2. **HCHO Hotspot Detection:** We implemented a spatial clustering algorithm (DBSCAN) to identify statistically significant HCHO anomalies from Sentinel-5P data. These hotspots are dynamically correlated with active fire detections from MODIS and VIIRS (MCD14DL/VNP14IMGT) to classify emission sources (e.g., biomass burning vs. industrial). ERA5 wind vectors are used to compute forward trajectories, estimating downwind pollution transport.

**Implementation & Impact:**
The system is built on a scalable architecture utilizing FastAPI, PostgreSQL/PostGIS, and a React-Leaflet frontend for interactive visualization. By fusing Earth observation data with state-of-the-art AI, this platform democratizes access to hyperlocal air quality data, empowering policymakers, researchers, and citizens with actionable insights to mitigate pollution at its source.
