"""
Backend API Tests
==================
Tests for the FastAPI application using pytest and httpx.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, engine


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ── Health & Root ─────────────────────────────────────────────────
class TestHealth:
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "endpoints" in data

    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


# ── Authentication ────────────────────────────────────────────────
class TestAuth:
    def test_register_user(self):
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword123",
            "full_name": "Test User",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "testuser"
        assert data["role"] == "viewer"

    def test_register_duplicate(self):
        client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        })
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == 409

    def test_login(self):
        client.post("/api/auth/register", json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "mypassword",
        })
        response = client.post("/api/auth/login", json={
            "username": "loginuser",
            "password": "mypassword",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid(self):
        response = client.post("/api/auth/login", json={
            "username": "nobody",
            "password": "wrong",
        })
        assert response.status_code == 401


# ── AQI Endpoints ─────────────────────────────────────────────────
class TestAQI:
    def test_get_stations(self):
        response = client.get("/api/aqi/stations")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_stations_geojson(self):
        response = client.get("/api/aqi/stations/geojson")
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"

    def test_get_measurements(self):
        response = client.get("/api/aqi/measurements")
        assert response.status_code == 200

    def test_predict_aqi(self):
        response = client.post("/api/aqi/predict", json={
            "latitude": 28.63,
            "longitude": 77.21,
        })
        assert response.status_code == 200
        data = response.json()
        assert "pred_aqi" in data
        assert "pred_pm25" in data
        assert "model_version" in data

    def test_predict_with_explanation(self):
        response = client.post("/api/aqi/predict/explain", json={
            "latitude": 28.63,
            "longitude": 77.21,
        })
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "explanation" in data
        assert "feature_importance" in data["explanation"]

    def test_india_aqi_map(self):
        response = client.get("/api/aqi/map/india")
        assert response.status_code == 200
        data = response.json()
        assert "heatmap" in data
        assert "bbox" in data

    def test_satellite_data(self):
        response = client.get("/api/aqi/satellite/no2", params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 200

    def test_invalid_pollutant(self):
        response = client.get("/api/aqi/satellite/invalid", params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 400


# ── Hotspot Endpoints ─────────────────────────────────────────────
class TestHotspots:
    def test_detect_hotspots(self):
        response = client.get("/api/hotspots/detect", params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 200
        data = response.json()
        assert "hotspots" in data
        assert "geojson" in data

    def test_fire_events(self):
        response = client.get("/api/hotspots/fires", params={
            "source": "MODIS",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"
        assert data["total_fires"] > 0

    def test_hcho_heatmap(self):
        response = client.get("/api/hotspots/hcho/heatmap", params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 200
        assert "heatmap" in response.json()

    def test_wind_transport(self):
        response = client.get("/api/hotspots/wind-transport", params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        })
        assert response.status_code == 200
        data = response.json()
        assert "wind_vectors" in data
        assert len(data["wind_vectors"]) > 0


# ── Dashboard Endpoints ───────────────────────────────────────────
class TestDashboard:
    def test_dashboard_summary(self):
        response = client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert "total_stations" in data

    def test_stats_by_state(self):
        response = client.get("/api/dashboard/stats/by-state")
        assert response.status_code == 200

    def test_pollutant_distribution(self):
        response = client.get("/api/dashboard/stats/pollutant-distribution")
        assert response.status_code == 200
