/**
 * About Page
 * ============
 * Platform information, methodology, team, and references.
 */

import React from 'react';

const About: React.FC = () => {
  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
          About the Platform
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          This platform was developed for <strong>ISRO Hackathon 2026</strong> in response to the
          official problem statement: <em>"Development of Surface AQI & Identification of HCHO
          Hotspots over India using Satellite Data."</em>
        </p>
      </div>

      {/* Methodology */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Scientific Methodology
        </h3>

        <Section title="Objective 1 — Surface AQI Estimation">
          <p>We employ a hybrid <strong>CNN-LSTM</strong> deep learning architecture that ingests:</p>
          <ul style={listStyle}>
            <li>INSAT-3D Aerosol Optical Depth (AOD) at 825 nm</li>
            <li>Sentinel-5P TROPOMI tropospheric columns: NO₂, SO₂, CO, O₃</li>
            <li>ERA5 / IMDAA meteorological reanalysis (temperature, RH, wind, PBLH)</li>
            <li>CPCB CAAQMS ground measurements for training targets</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            The CNN component extracts spatial features from satellite raster patches,
            while the LSTM captures temporal dynamics (7-day lookback).
            Predictions are validated using RMSE, MAE, R, and R².
          </p>
        </Section>

        <Section title="Objective 2 — HCHO Hotspot Identification">
          <p>Formaldehyde hotspots are detected using:</p>
          <ul style={listStyle}>
            <li>DBSCAN spatial clustering on elevated Sentinel-5P HCHO columns</li>
            <li>Getis-Ord Gi* statistic for hotspot significance testing</li>
            <li>MODIS/VIIRS active fire correlation (Pearson/Spearman) with spatial-temporal lags</li>
            <li>ERA5 wind-vector forward trajectory analysis for transport estimation</li>
          </ul>
        </Section>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Technology Stack
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { cat: 'AI/ML', items: 'PyTorch, scikit-learn, SHAP' },
            { cat: 'Backend', items: 'FastAPI, SQLAlchemy, PostgreSQL' },
            { cat: 'Frontend', items: 'React, TypeScript, Leaflet, Chart.js' },
            { cat: 'Geospatial', items: 'GEE, GeoPandas, Rasterio' },
            { cat: 'DevOps', items: 'Docker, GitHub Actions, Vercel' },
            { cat: 'Data', items: 'Sentinel-5P, INSAT-3D, ERA5, CPCB' },
          ].map((tech) => (
            <div key={tech.cat} style={{
              padding: '14px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--accent-cyan)' }}>{tech.cat}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{tech.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Team</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { role: 'Remote Sensing / AI', focus: 'Data Pipeline, CNN-LSTM Training' },
            { role: 'Backend / GIS', focus: 'FastAPI, Hotspot Detection, PostGIS' },
            { role: 'Frontend / UI', focus: 'React, Leaflet Maps, Charts' },
            { role: 'QA / Documentation', focus: 'Testing, XAI, SRS, Deployment' },
          ].map((member, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Member {i + 1}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '4px' }}>{member.role}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{member.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* References */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Key References</h3>
        <ul style={{ ...listStyle, fontSize: '12px' }}>
          <li>van Donkelaar, A. et al. (2016). Global Estimates of Fine Particulate Matter using a Combined Geophysical-Statistical Method. <em>Environ. Sci. Technol.</em></li>
          <li>Lamsal, L. N. et al. (2008). Ground-level nitrogen dioxide concentrations inferred from the satellite-borne Ozone Monitoring Instrument. <em>JGR Atmospheres.</em></li>
          <li>De Smedt, I. et al. (2018). Algorithm theoretical baseline for formaldehyde retrievals from S5P TROPOMI. <em>AMT.</em></li>
          <li>Seidel, D. J. et al. (2010). Climatology of the planetary boundary layer. <em>JGR Atmospheres.</em></li>
          <li>CPCB (2014). National Air Quality Index. <em>Central Pollution Control Board, India.</em></li>
        </ul>
      </div>
    </div>
  );
};

/* ── Section Helper ────────────────────────────────────────────── */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: 'var(--accent-cyan)' }}>
      {title}
    </h4>
    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
      {children}
    </div>
  </div>
);

const listStyle: React.CSSProperties = {
  paddingLeft: '20px',
  listStyleType: 'disc',
  color: 'var(--text-secondary)',
  lineHeight: 1.8,
};

export default About;
