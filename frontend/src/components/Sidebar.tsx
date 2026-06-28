/**
 * Sidebar Navigation Component
 * ==============================
 * ISRO-styled sidebar with animated navigation links.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/', label: 'Home', icon: '🏠' },
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Air Quality',
    items: [
      { path: '/aqi-map', label: 'AQI Map', icon: '🗺️' },
      { path: '/predictions', label: 'AI Predictions', icon: '🤖' },
    ],
  },
  {
    title: 'HCHO Analysis',
    items: [
      { path: '/hcho', label: 'HCHO Hotspots', icon: '🔥' },
      { path: '/fire-analysis', label: 'Fire Analysis', icon: '🌋' },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/about', label: 'About', icon: 'ℹ️' },
    ],
  },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛰️</div>
        <div>
          <h1>VayuSense</h1>
          <span>Satellite Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        ISRO Hackathon 2026
        <br />
        v1.0.0 • Satellite-Powered
      </div>
    </aside>
  );
};

export default Sidebar;
