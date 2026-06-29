import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * About Page
 * ============
 * Platform information, methodology, team, and references.
 */
import React from 'react';
const About = () => {
    return (_jsxs("div", { className: "page-container animate-fade-in", style: { maxWidth: '900px' }, children: [_jsxs("div", { className: "card", style: { marginBottom: '20px' }, children: [_jsx("h2", { style: { fontSize: '24px', fontWeight: 700, marginBottom: '12px' }, children: "About the Platform" }), _jsxs("p", { style: { color: 'var(--text-secondary)', lineHeight: 1.7 }, children: ["This platform was developed for ", _jsx("strong", { children: "ISRO Hackathon 2026" }), " in response to the official problem statement: ", _jsx("em", { children: "\"Development of Surface AQI & Identification of HCHO Hotspots over India using Satellite Data.\"" })] })] }), _jsxs("div", { className: "card", style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' }, children: "Scientific Methodology" }), _jsxs(Section, { title: "Objective 1 \u2014 Surface AQI Estimation", children: [_jsxs("p", { children: ["We employ a hybrid ", _jsx("strong", { children: "CNN-LSTM" }), " deep learning architecture that ingests:"] }), _jsxs("ul", { style: listStyle, children: [_jsx("li", { children: "INSAT-3D Aerosol Optical Depth (AOD) at 825 nm" }), _jsx("li", { children: "Sentinel-5P TROPOMI tropospheric columns: NO\u2082, SO\u2082, CO, O\u2083" }), _jsx("li", { children: "ERA5 / IMDAA meteorological reanalysis (temperature, RH, wind, PBLH)" }), _jsx("li", { children: "CPCB CAAQMS ground measurements for training targets" })] }), _jsx("p", { style: { marginTop: '12px' }, children: "The CNN component extracts spatial features from satellite raster patches, while the LSTM captures temporal dynamics (7-day lookback). Predictions are validated using RMSE, MAE, R, and R\u00B2." })] }), _jsxs(Section, { title: "Objective 2 \u2014 HCHO Hotspot Identification", children: [_jsx("p", { children: "Formaldehyde hotspots are detected using:" }), _jsxs("ul", { style: listStyle, children: [_jsx("li", { children: "DBSCAN spatial clustering on elevated Sentinel-5P HCHO columns" }), _jsx("li", { children: "Getis-Ord Gi* statistic for hotspot significance testing" }), _jsx("li", { children: "MODIS/VIIRS active fire correlation (Pearson/Spearman) with spatial-temporal lags" }), _jsx("li", { children: "ERA5 wind-vector forward trajectory analysis for transport estimation" })] })] })] }), _jsxs("div", { className: "card", style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' }, children: "Technology Stack" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }, children: [
                            { cat: 'AI/ML', items: 'PyTorch, scikit-learn, SHAP' },
                            { cat: 'Backend', items: 'FastAPI, SQLAlchemy, PostgreSQL' },
                            { cat: 'Frontend', items: 'React, TypeScript, Leaflet, Chart.js' },
                            { cat: 'Geospatial', items: 'GEE, GeoPandas, Rasterio' },
                            { cat: 'DevOps', items: 'Docker, GitHub Actions, Vercel' },
                            { cat: 'Data', items: 'Sentinel-5P, INSAT-3D, ERA5, CPCB' },
                        ].map((tech) => (_jsxs("div", { style: {
                                padding: '14px',
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                            }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: '13px', color: 'var(--accent-cyan)' }, children: tech.cat }), _jsx("div", { style: { fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }, children: tech.items })] }, tech.cat))) })] }), _jsxs("div", { className: "card", style: { marginBottom: '20px' }, children: [_jsx("h3", { style: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' }, children: "Team" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }, children: [
                            { role: 'Remote Sensing / AI', focus: 'Data Pipeline, CNN-LSTM Training' },
                            { role: 'Backend / GIS', focus: 'FastAPI, Hotspot Detection, PostGIS' },
                            { role: 'Frontend / UI', focus: 'React, Leaflet Maps, Charts' },
                            { role: 'QA / Documentation', focus: 'Testing, XAI, SRS, Deployment' },
                        ].map((member, i) => (_jsxs("div", { style: {
                                padding: '16px',
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                            }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: '14px' }, children: ["Member ", i + 1] }), _jsx("div", { style: { fontSize: '12px', color: 'var(--accent-blue)', marginTop: '4px' }, children: member.role }), _jsx("div", { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }, children: member.focus })] }, i))) })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { style: { fontSize: '18px', fontWeight: 600, marginBottom: '16px' }, children: "Key References" }), _jsxs("ul", { style: { ...listStyle, fontSize: '12px' }, children: [_jsxs("li", { children: ["van Donkelaar, A. et al. (2016). Global Estimates of Fine Particulate Matter using a Combined Geophysical-Statistical Method. ", _jsx("em", { children: "Environ. Sci. Technol." })] }), _jsxs("li", { children: ["Lamsal, L. N. et al. (2008). Ground-level nitrogen dioxide concentrations inferred from the satellite-borne Ozone Monitoring Instrument. ", _jsx("em", { children: "JGR Atmospheres." })] }), _jsxs("li", { children: ["De Smedt, I. et al. (2018). Algorithm theoretical baseline for formaldehyde retrievals from S5P TROPOMI. ", _jsx("em", { children: "AMT." })] }), _jsxs("li", { children: ["Seidel, D. J. et al. (2010). Climatology of the planetary boundary layer. ", _jsx("em", { children: "JGR Atmospheres." })] }), _jsxs("li", { children: ["CPCB (2014). National Air Quality Index. ", _jsx("em", { children: "Central Pollution Control Board, India." })] })] })] })] }));
};
/* ── Section Helper ────────────────────────────────────────────── */
const Section = ({ title, children }) => (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--accent-cyan)' }, children: title }), _jsx("div", { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }, children: children })] }));
const listStyle = {
    paddingLeft: '20px',
    listStyleType: 'disc',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
};
export default About;
