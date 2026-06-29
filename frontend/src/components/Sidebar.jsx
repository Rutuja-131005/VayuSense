import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const Sidebar = () => {
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-logo", children: [_jsx("div", { className: "logo-icon", children: "\uD83D\uDEF0\uFE0F" }), _jsxs("div", { children: [_jsx("h1", { children: "VayuSense" }), _jsx("span", { children: "Satellite Intelligence" })] })] }), _jsx("nav", { className: "sidebar-nav", children: navSections.map((section) => (_jsxs("div", { children: [_jsx("div", { className: "nav-section-title", children: section.title }), section.items.map((item) => (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, end: item.path === '/', children: [_jsx("span", { className: "nav-icon", children: item.icon }), item.label] }, item.path)))] }, section.title))) }), _jsxs("div", { style: {
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                }, children: ["ISRO Hackathon 2026", _jsx("br", {}), "v1.0.0 \u2022 Satellite-Powered"] })] }));
};
export default Sidebar;
