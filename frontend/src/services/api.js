/**
 * API Service Layer
 * ==================
 * Centralized API client for communicating with the FastAPI backend.
 * Uses axios with interceptors for auth token management.
 */
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
class ApiService {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
        });
        // Request interceptor — attach JWT token
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }
    // ── Auth ────────────────────────────────────────────────────
    async login(username, password) {
        const { data } = await this.client.post('/api/auth/login', { username, password });
        localStorage.setItem('access_token', data.access_token);
        return data;
    }
    async register(username, email, password, fullName) {
        const { data } = await this.client.post('/api/auth/register', {
            username, email, password, full_name: fullName,
        });
        return data;
    }
    // ── Dashboard ───────────────────────────────────────────────
    async getDashboardSummary() {
        const { data } = await this.client.get('/api/dashboard/summary');
        return data;
    }
    async getStatsByState() {
        const { data } = await this.client.get('/api/dashboard/stats/by-state');
        return data;
    }
    async getPollutantDistribution() {
        const { data } = await this.client.get('/api/dashboard/stats/pollutant-distribution');
        return data;
    }
    async getSatelliteStatus() {
        const { data } = await this.client.get('/api/dashboard/satellite-status');
        return data;
    }
    // ── AQI ─────────────────────────────────────────────────────
    async getStations(state) {
        const params = state ? { state } : {};
        const { data } = await this.client.get('/api/aqi/stations', { params });
        return data;
    }
    async getStationsGeoJSON(state) {
        const params = state ? { state } : {};
        const { data } = await this.client.get('/api/aqi/stations/geojson', { params });
        return data;
    }
    async getMeasurements(params = {}) {
        const { data } = await this.client.get('/api/aqi/measurements', { params });
        return data;
    }
    async getTimeSeries(stationId, parameter = 'aqi', days = 30) {
        const { data } = await this.client.get('/api/aqi/timeseries', {
            params: { station_id: stationId, parameter, days },
        });
        return data;
    }
    async getSatelliteData(pollutant, startDate, endDate) {
        const { data } = await this.client.get(`/api/aqi/satellite/${pollutant}`, {
            params: { start_date: startDate, end_date: endDate },
        });
        return data;
    }
    async predictAQI(latitude, longitude, date) {
        const { data } = await this.client.post('/api/aqi/predict', {
            latitude, longitude, date,
        });
        return data;
    }
    async predictWithExplanation(latitude, longitude) {
        const { data } = await this.client.post('/api/aqi/predict/explain', {
            latitude, longitude,
        });
        return data;
    }
    async getIndiaAQIMap() {
        const { data } = await this.client.get('/api/aqi/map/india');
        return data;
    }
    // ── Hotspots ────────────────────────────────────────────────
    async detectHotspots(startDate, endDate) {
        const { data } = await this.client.get('/api/hotspots/detect', {
            params: { start_date: startDate, end_date: endDate },
        });
        return data;
    }
    async getHotspotsGeoJSON(state) {
        const params = state ? { state } : {};
        const { data } = await this.client.get('/api/hotspots/geojson', { params });
        return data;
    }
    async getFireEvents(source = 'MODIS', startDate = '2024-01-01', endDate = '2024-01-31') {
        const { data } = await this.client.get('/api/hotspots/fires', {
            params: { source, start_date: startDate, end_date: endDate },
        });
        return data;
    }
    async getHCHOHeatmap(startDate, endDate) {
        const { data } = await this.client.get('/api/hotspots/hcho/heatmap', {
            params: { start_date: startDate, end_date: endDate },
        });
        return data;
    }
    async getWindTransport(startDate, endDate) {
        const { data } = await this.client.get('/api/hotspots/wind-transport', {
            params: { start_date: startDate, end_date: endDate },
        });
        return data;
    }
    // ── Health ──────────────────────────────────────────────────
    async healthCheck() {
        const { data } = await this.client.get('/health');
        return data;
    }
}
export const api = new ApiService();
export default api;
