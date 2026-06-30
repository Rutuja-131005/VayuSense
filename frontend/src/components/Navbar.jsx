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
    '/mission-control': 'Mission Control',
    '/earth-observation': 'Live Earth Observation',
    '/environmental-intelligence': 'Environmental Intelligence (HCHO & Fire)',
    '/predictions': 'AI Predictions & Forecasting',
    '/decision-support': 'Decision Support Engine',
    '/scientific-validation': 'Scientific Validation',
    '/research-analytics': 'Research Analytics',
    '/reports': 'Government Reporting',
    '/system-health': 'System Health & Monitoring',
};
const Navbar = () => {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'VayuSense Platform';
    return (_jsxs("header", { className: "navbar", children: [_jsx("h2", { className: "navbar-title", children: title }), _jsxs("div", { className: "navbar-actions", children: [
        _jsxs("div", { style: { display: 'flex', gap: '8px', marginRight: '16px' }, children: [
            _jsx("span", { className: "badge badge-good", children: "🟢 API Online" }),
            _jsx("span", { className: "badge badge-good", children: "📡 INSAT-3D Syncing" }),
            _jsx("span", { className: "badge badge-satisfactory", children: "🌍 Sentinel-5P Connected" })
        ]}),
        _jsxs("div", { style: { 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--border-subtle)'
        }, children: [
            _jsx("div", { style: { textAlign: 'right', lineHeight: '1.2' }, children: [
                _jsx("div", { style: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }, children: "Mission Scientist" }),
                _jsx("div", { style: { fontSize: '11px', color: 'var(--text-muted)' }, children: "ISRO IIRS Node" })
            ]}),
            _jsx("div", { style: { 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '14px'
            }, children: "MS" })
        ]})
    ] })] }));
};
export default Navbar;
