# ISRO Hackathon 2026: Team Sprint Plan

## Event Duration: 36 Hours

### Team Roles (4 Members)
1. **Member 1 (M1):** Remote Sensing & Deep Learning Engineer
2. **Member 2 (M2):** Backend & GIS Developer
3. **Member 3 (M3):** Frontend & Data Viz Developer
4. **Member 4 (M4):** QA, Testing & Technical Writer

---

### Sprint 1: Project Setup & Foundation (Hours 0-6)
- **M1:** Set up Google Earth Engine API, start downloading sample INSAT-3D, Sentinel-5P, and ERA5 data for training.
- **M2:** Initialize FastAPI backend, configure PostgreSQL/SQLite, setup SQLAlchemy ORM models and basic endpoints.
- **M3:** Initialize Vite React project, implement global CSS variables, create Sidebar and Navbar layouts.
- **M4:** Draft the Software Requirements Specification (SRS) and setup the GitHub repository with branching strategies.

### Sprint 2: Core Algorithm Development (Hours 6-16)
- **M1:** Build and train the CNN-LSTM hybrid model in PyTorch using the collected dataset. Save checkpoint `cnn_lstm_aqi.pth`.
- **M2:** Implement `model_service.py` to load the PyTorch model and serve predictions. Implement DBSCAN clustering in `hotspot_service.py`.
- **M3:** Build the Interactive Map page (Leaflet) and the Dashboard with Chart.js pollutant visualizations.
- **M4:** Write API unit tests (`test_api.py`) using pytest for the initial backend routes.

### Sprint 3: Integration & XAI (Hours 16-24)
- **M1:** Implement SHAP-based feature importance for Explainable AI (XAI) in `xai_shap.py`.
- **M2:** Finalize all API routes (AQI, Hotspots, Dashboard). Integrate MODIS/VIIRS fire data with the hotspot clusters.
- **M3:** Build the AI Predictions page with XAI explanations and the HCHO Analysis page with fire overlays.
- **M4:** Write the Software Design Document (SDD) and start the Presentation Outline.

### Sprint 4: Refinement & UI Polish (Hours 24-30)
- **M1:** Evaluate model performance (RMSE, R²) and generate the final `evaluation_report.json`.
- **M2:** Implement physics-based heuristic fallbacks in services for offline demo capabilities. 
- **M3:** Ensure responsive design, add loading states, and polish the dark-mode ISRO aesthetics.
- **M4:** Create Dockerfile and `docker-compose.yml` for seamless deployment. Test the full stack locally.

### Sprint 5: Final Testing & Submission Prep (Hours 30-36)
- **All:** Full system end-to-end testing (Find and squash bugs).
- **M1 & M3:** Record a comprehensive demo video of the platform.
- **M2 & M4:** Finalize the README.md, Abstract, and Presentation Deck.
- **All:** Code freeze and final submission upload to the hackathon portal.
