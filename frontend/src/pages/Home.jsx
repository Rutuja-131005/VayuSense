import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Home Page
 * ==========
 * Landing page with hero section, platform overview, and key features.
 */
import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => {
    return (_jsxs("div", { className: "page-container animate-fade-in", children: [_jsx("div", { style: {
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.08))',
                    borderRadius: 'var(--radius-xl)',
                    padding: '60px 48px',
                    marginBottom: '32px',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
                    overflow: 'hidden',
                }, children: _jsxs("div", { style: { position: 'relative', zIndex: 1 }, children: [_jsx("div", { style: {
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--accent-cyan)',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                marginBottom: '12px',
                            }, children: "ISRO Hackathon 2026" }), _jsxs("h1", { style: {
                                fontSize: '36px',
                                fontWeight: 800,
                                lineHeight: 1.2,
                                marginBottom: '16px',
                                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-cyan))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }, children: ["Surface AQI & HCHO Hotspot", _jsx("br", {}), "Detection over India"] }), _jsx("p", { style: {
                                fontSize: '16px',
                                color: 'var(--text-secondary)',
                                maxWidth: '640px',
                                lineHeight: 1.7,
                                marginBottom: '28px',
                            }, children: "AI-powered geospatial platform leveraging INSAT-3D, Sentinel-5P TROPOMI, and CPCB ground observations to estimate real-time Surface Air Quality Index and identify Formaldehyde (HCHO) emission hotspots using deep learning." }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx(Link, { to: "/mission-control", className: "btn btn-primary", children: "\uD83D\uDCCA Open Mission Control" }), _jsx(Link, { to: "/earth-observation", className: "btn btn-secondary", children: "\uD83D\uDDFA\uFE0F View Earth Observation" })] })] }) }), _jsxs("div", { className: "stat-cards-grid stagger-children", style: { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }, children: [_jsx(FeatureCard, { icon: "\uD83D\uDEF0\uFE0F", title: "Multi-Sensor Satellite Data", description: "Integrates INSAT-3D AOD, Sentinel-5P TROPOMI (NO\u2082, SO\u2082, CO, O\u2083, HCHO), MODIS/VIIRS fire detections, and ERA5 reanalysis.", color: "blue" }), _jsx(FeatureCard, { icon: "\uD83E\uDDE0", title: "CNN-LSTM Deep Learning", description: "Hybrid Convolutional-LSTM architecture captures spatial patterns from satellite imagery and temporal dynamics for accurate AQI prediction.", color: "purple" }), _jsx(FeatureCard, { icon: "\uD83D\uDD25", title: "HCHO Hotspot Detection", description: "DBSCAN spatial clustering on Sentinel-5P HCHO columns with MODIS/VIIRS fire correlation and ERA5 wind transport analysis.", color: "orange" }), _jsx(FeatureCard, { icon: "\uD83D\uDCC8", title: "Explainable AI", description: "SHAP-based feature importance analysis explains which parameters (AOD, PBLH, wind, humidity) drive each prediction.", color: "cyan" }), _jsx(FeatureCard, { icon: "\uD83D\uDDFA\uFE0F", title: "Interactive Geospatial Maps", description: "Leaflet-powered interactive maps with heatmaps, markers, wind vectors, and fire overlays across all Indian states.", color: "green" }), _jsx(FeatureCard, { icon: "\u2705", title: "Validated Results", description: "Model performance validated using RMSE, MAE, Pearson R, and R\u00B2 against CPCB ground station measurements.", color: "red" })] }), _jsxs("div", { className: "card", style: { marginTop: '24px' }, children: [_jsx("div", { className: "card-header", children: _jsx("div", { className: "card-title", children: "Data Sources & Satellites" }) }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                        }, children: [
                            { name: 'INSAT-3D', type: 'AOD', org: 'ISRO' },
                            { name: 'Sentinel-5P', type: 'NO₂, SO₂, CO, O₃, HCHO', org: 'ESA/Copernicus' },
                            { name: 'MODIS', type: 'Active Fire', org: 'NASA' },
                            { name: 'VIIRS', type: 'Active Fire', org: 'NASA/NOAA' },
                            { name: 'ERA5', type: 'Meteorology', org: 'ECMWF' },
                            { name: 'CPCB', type: 'Ground AQI', org: 'Govt. of India' },
                        ].map((ds) => (_jsxs("div", { style: {
                                padding: '16px',
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                            }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: '14px' }, children: ds.name }), _jsx("div", { style: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }, children: ds.type }), _jsx("div", { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }, children: ds.org })] }, ds.name))) })] })] }));
};
const FeatureCard = ({ icon, title, description, color }) => (_jsxs("div", { className: `stat-card ${color}`, style: { cursor: 'default' }, children: [_jsx("div", { style: { fontSize: '28px', marginBottom: '12px' }, children: icon }), _jsx("div", { style: { fontWeight: 600, fontSize: '15px', marginBottom: '8px' }, children: title }), _jsx("div", { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }, children: description })] }));
export default Home;
