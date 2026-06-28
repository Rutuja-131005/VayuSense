/**
 * Navbar Component
 * =================
 * Top navigation bar with page title and action buttons.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/aqi-map': 'AQI Spatial Map',
  '/predictions': 'AI Predictions',
  '/hcho': 'HCHO Hotspot Analysis',
  '/fire-analysis': 'Fire & Biomass Analysis',
  '/about': 'About the Platform',
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'VayuSense Platform';

  return (
    <header className="navbar">
      <h2 className="navbar-title">{title}</h2>
      <div className="navbar-actions">
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          padding: '6px 12px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          🟢 System Online
        </span>
      </div>
    </header>
  );
};

export default Navbar;
