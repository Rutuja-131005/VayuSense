import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Navbar Component
 * =================
 * Top navigation bar with page title and action buttons.
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
const pageTitles = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/aqi-map': 'AQI Spatial Map',
    '/predictions': 'AI Predictions',
    '/hcho': 'HCHO Hotspot Analysis',
    '/fire-analysis': 'Fire & Biomass Analysis',
    '/about': 'About the Platform',
};
const Navbar = () => {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'VayuSense Platform';
    return (_jsxs("header", { className: "navbar", children: [_jsx("h2", { className: "navbar-title", children: title }), _jsx("div", { className: "navbar-actions", children: _jsx("span", { style: {
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        padding: '6px 12px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                    }, children: "\uD83D\uDFE2 System Online" }) })] }));
};
export default Navbar;
