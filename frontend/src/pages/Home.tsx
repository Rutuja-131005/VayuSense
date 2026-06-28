/**
 * Home Page
 * ==========
 * Landing page with hero section, platform overview, and key features.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.08))',
        borderRadius: 'var(--radius-xl)',
        padding: '60px 48px',
        marginBottom: '32px',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '12px',
          }}>
            ISRO Hackathon 2026
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--text-primary), var(--accent-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Surface AQI & HCHO Hotspot
            <br />
            Detection over India
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            lineHeight: 1.7,
            marginBottom: '28px',
          }}>
            AI-powered geospatial platform leveraging INSAT-3D, Sentinel-5P TROPOMI,
            and CPCB ground observations to estimate real-time Surface Air Quality Index
            and identify Formaldehyde (HCHO) emission hotspots using deep learning.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/dashboard" className="btn btn-primary">
              📊 Open Dashboard
            </Link>
            <Link to="/aqi-map" className="btn btn-secondary">
              🗺️ View AQI Map
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="stat-cards-grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <FeatureCard
          icon="🛰️"
          title="Multi-Sensor Satellite Data"
          description="Integrates INSAT-3D AOD, Sentinel-5P TROPOMI (NO₂, SO₂, CO, O₃, HCHO), MODIS/VIIRS fire detections, and ERA5 reanalysis."
          color="blue"
        />
        <FeatureCard
          icon="🧠"
          title="CNN-LSTM Deep Learning"
          description="Hybrid Convolutional-LSTM architecture captures spatial patterns from satellite imagery and temporal dynamics for accurate AQI prediction."
          color="purple"
        />
        <FeatureCard
          icon="🔥"
          title="HCHO Hotspot Detection"
          description="DBSCAN spatial clustering on Sentinel-5P HCHO columns with MODIS/VIIRS fire correlation and ERA5 wind transport analysis."
          color="orange"
        />
        <FeatureCard
          icon="📈"
          title="Explainable AI"
          description="SHAP-based feature importance analysis explains which parameters (AOD, PBLH, wind, humidity) drive each prediction."
          color="cyan"
        />
        <FeatureCard
          icon="🗺️"
          title="Interactive Geospatial Maps"
          description="Leaflet-powered interactive maps with heatmaps, markers, wind vectors, and fire overlays across all Indian states."
          color="green"
        />
        <FeatureCard
          icon="✅"
          title="Validated Results"
          description="Model performance validated using RMSE, MAE, Pearson R, and R² against CPCB ground station measurements."
          color="red"
        />
      </div>

      {/* Data Sources */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title">Data Sources & Satellites</div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {[
            { name: 'INSAT-3D', type: 'AOD', org: 'ISRO' },
            { name: 'Sentinel-5P', type: 'NO₂, SO₂, CO, O₃, HCHO', org: 'ESA/Copernicus' },
            { name: 'MODIS', type: 'Active Fire', org: 'NASA' },
            { name: 'VIIRS', type: 'Active Fire', org: 'NASA/NOAA' },
            { name: 'ERA5', type: 'Meteorology', org: 'ECMWF' },
            { name: 'CPCB', type: 'Ground AQI', org: 'Govt. of India' },
          ].map((ds) => (
            <div key={ds.name} style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{ds.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {ds.type}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {ds.org}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Feature Card Sub-component ────────────────────────────────── */
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => (
  <div className={`stat-card ${color}`} style={{ cursor: 'default' }}>
    <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
      {description}
    </div>
  </div>
);

export default Home;
