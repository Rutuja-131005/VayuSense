# ISRO Hackathon 2026: Pitch Presentation Outline

## Slide 1: Title Slide
- **Project Title:** AI-Powered Surface AQI Estimation and HCHO Hotspot Detection using Multi-Sensor Satellite Data
- **Team Name & Members**
- **Theme:** Earth Observation / Air Quality

## Slide 2: The Problem
- **Sparse Ground Monitoring:** CPCB stations are limited mostly to urban centers.
- **Hidden Emission Sources:** Undetected localized formaldehyde (HCHO) and VOC emissions from biomass burning and industries.
- **Lack of Predictive Insights:** Reliance on raw data rather than actionable forecasting and spatial analysis.

## Slide 3: Our Solution
- **A Unified Geospatial Platform:**
  - AI prediction of Surface AQI anywhere in India using satellite data.
  - Automated detection and source attribution of HCHO hotspots.
- **Key Value Proposition:** Continuous, high-resolution, and explainable air quality intelligence.

## Slide 4: Data Sources
- **ISRO INSAT-3D:** Aerosol Optical Depth (AOD)
- **ESA Sentinel-5P:** Trace gases (NO₂, SO₂, CO, O₃, HCHO)
- **NASA MODIS/VIIRS:** Active fire locations and thermal anomalies
- **ECMWF ERA5:** Meteorological variables (Wind, PBLH, Temp, RH)
- **Govt. of India CPCB:** Ground-truth training labels

## Slide 5: Methodology 1 - Surface AQI Estimation
- **Architecture:** Hybrid CNN-LSTM Deep Learning Model.
- **Process:**
  - CNN extracts spatial features from local satellite raster patches.
  - LSTM models 7-day temporal dynamics and weather interactions.
- **Result:** Accurate prediction of 5 pollutant concentrations and AQI.

## Slide 6: Methodology 2 - HCHO Hotspots & Transport
- **Detection:** DBSCAN clustering on elevated HCHO column anomalies.
- **Source Attribution:** Spatial-temporal correlation with MODIS/VIIRS fire counts.
- **Wind Transport:** ERA5 wind vector forward-trajectory modelling to predict downwind impact areas.

## Slide 7: Explainable AI (XAI)
- **Why it matters:** Scientific tools must be interpretable.
- **Implementation:** SHAP (SHapley Additive exPlanations) values decompose predictions.
- **Example:** Highlighting when PBLH inversion vs. high AOD is driving severe AQI.

## Slide 8: Technical Architecture
- **Backend:** Python, FastAPI, SQLAlchemy, PostGIS.
- **Frontend:** React, TypeScript, Leaflet Maps.
- **Deployment:** Dockerized microservices.

## Slide 9: Live Demo / Walkthrough
- **Dashboard:** National overview and analytics.
- **AQI Map:** Interactive pan/zoom with CPCB color coding.
- **AI Prediction:** Selecting a remote area to predict AQI with explanation.
- **HCHO Analysis:** Showing a hotspot correlated with crop-burning fires.

## Slide 10: Validation & Results
- **Metrics:** RMSE, MAE, Pearson R, R² comparing model vs. ground truth.
- **Success:** Demonstrated high correlation (R > 0.85) for PM2.5 and NO₂.

## Slide 11: Future Scope
- Integration with high-resolution GIS cadastral maps.
- Real-time alert system via SMS for severe pollution events.
- Extending the model to predict greenhouse gas (CH4, CO2) hotspots.

## Slide 12: Q&A
- Thank the judges and open the floor for questions.
