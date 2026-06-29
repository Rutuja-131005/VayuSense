import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * HCHO Hotspot Analysis Page
 * ============================
 * Displays HCHO hotspot clusters, fire overlay, wind transport,
 * and source identification with interactive Leaflet map.
 */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StatCard from '../components/StatCard';
const INDIA_CENTER = [23.5, 80.0];
/* ── Demo HCHO Hotspots ────────────────────────────────────────── */
const demoHotspots = [
    { id: 1, lat: 30.2, lon: 75.8, hcho: 2.8e-4, fires: 45, source: 'biomass_burning', state: 'Punjab', area: 1250 },
    { id: 2, lat: 29.5, lon: 76.5, hcho: 2.3e-4, fires: 38, source: 'biomass_burning', state: 'Haryana', area: 980 },
    { id: 3, lat: 28.6, lon: 77.2, hcho: 1.9e-4, fires: 12, source: 'industrial', state: 'Delhi', area: 420 },
    { id: 4, lat: 22.3, lon: 81.5, hcho: 1.5e-4, fires: 28, source: 'biogenic', state: 'Madhya Pradesh', area: 2100 },
    { id: 5, lat: 25.4, lon: 83.2, hcho: 1.7e-4, fires: 15, source: 'mixed', state: 'Uttar Pradesh', area: 850 },
    { id: 6, lat: 21.8, lon: 79.5, hcho: 1.3e-4, fires: 22, source: 'biogenic', state: 'Maharashtra', area: 1600 },
    { id: 7, lat: 26.5, lon: 92.3, hcho: 1.6e-4, fires: 18, source: 'biomass_burning', state: 'Assam', area: 1400 },
];
const demoFires = Array.from({ length: 120 }, () => ({
    lat: 24 + Math.random() * 8,
    lon: 72 + Math.random() * 20,
    frp: 5 + Math.random() * 100,
}));
function getSourceColor(source) {
    switch (source) {
        case 'biomass_burning': return '#ef4444';
        case 'industrial': return '#f97316';
        case 'biogenic': return '#22c55e';
        default: return '#8b5cf6';
    }
}
const HchoAnalysis = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [showFires, setShowFires] = useState(true);
    const [showWind, setShowWind] = useState(false);
    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const map = L.map(mapRef.current, {
                center: INDIA_CENTER,
                zoom: 5,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                maxZoom: 18,
            }).addTo(map);
            // HCHO Hotspot circles
            demoHotspots.forEach((h) => {
                const color = getSourceColor(h.source);
                const radius = Math.max(15, Math.sqrt(h.area) / 2);
                L.circleMarker([h.lat, h.lon], {
                    radius,
                    fillColor: color,
                    color: color,
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.35,
                })
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family: Inter, sans-serif;">
              <strong>Cluster #${h.id} — ${h.state}</strong><br/>
              <span style="color: ${color}; font-weight: 700;">HCHO: ${(h.hcho * 1e4).toFixed(2)} ×10⁻⁴ mol/m²</span><br/>
              Source: ${h.source.replace('_', ' ')}<br/>
              Fire Count: ${h.fires}<br/>
              Area: ${h.area} km²
            </div>
          `);
            });
            // Fire markers
            if (showFires) {
                demoFires.forEach((f) => {
                    L.circleMarker([f.lat, f.lon], {
                        radius: 3,
                        fillColor: '#ff6b35',
                        color: '#ff6b35',
                        weight: 0,
                        fillOpacity: 0.5,
                    }).addTo(map);
                });
            }
            mapInstance.current = map;
        }
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);
    return (_jsxs("div", { className: "page-container animate-fade-in", children: [_jsxs("div", { className: "stat-cards-grid stagger-children", children: [_jsx(StatCard, { label: "HCHO Hotspots", value: demoHotspots.length, color: "purple", icon: "\uD83E\uDDEA", trend: "Active clusters" }), _jsx(StatCard, { label: "Biomass Burning", value: 3, color: "red", icon: "\uD83D\uDD25", trend: "Source regions" }), _jsx(StatCard, { label: "Fire Events", value: demoFires.length, color: "orange", icon: "\uD83C\uDF0B", trend: "MODIS + VIIRS" }), _jsx(StatCard, { label: "Mean HCHO", value: "1.87", color: "cyan", icon: "\uD83D\uDCC8", trend: "\u00D710\u207B\u2074 mol/m\u00B2" })] }), _jsxs("div", { className: "grid-map-sidebar", children: [_jsx("div", { ref: mapRef, className: "map-container", style: { height: '600px' } }), _jsxs("div", { children: [_jsxs("div", { className: "card", style: { marginBottom: '16px' }, children: [_jsx("div", { className: "card-title", style: { marginBottom: '16px' }, children: "Analysis Controls" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Date Range" }), _jsx("input", { type: "date", className: "form-input", defaultValue: "2024-01-01", style: { marginBottom: '8px' } }), _jsx("input", { type: "date", className: "form-input", defaultValue: "2024-01-31" })] }), _jsxs("div", { className: "form-group", style: { display: 'flex', gap: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: showFires, onChange: () => setShowFires(!showFires) }), "Fire Layer"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: showWind, onChange: () => setShowWind(!showWind) }), "Wind Vectors"] })] }), _jsx("button", { className: "btn btn-primary", style: { width: '100%', marginTop: '8px' }, children: "\uD83D\uDD0D Run Detection" })] }), _jsxs("div", { className: "card", style: { marginBottom: '16px' }, children: [_jsx("div", { className: "card-title", style: { marginBottom: '12px' }, children: "Source Types" }), [
                                        { source: 'Biomass Burning', color: '#ef4444' },
                                        { source: 'Industrial', color: '#f97316' },
                                        { source: 'Biogenic', color: '#22c55e' },
                                        { source: 'Mixed', color: '#8b5cf6' },
                                    ].map((s) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }, children: [_jsx("div", { style: { width: '14px', height: '14px', borderRadius: '50%', background: s.color } }), _jsx("span", { style: { fontSize: '12px', color: 'var(--text-secondary)' }, children: s.source })] }, s.source)))] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '12px' }, children: "Detected Hotspots" }), demoHotspots.map((h) => (_jsxs("div", { style: {
                                            padding: '10px',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            fontSize: '12px',
                                        }, children: [_jsxs("div", { style: { fontWeight: 600, color: 'var(--text-primary)' }, children: ["#", h.id, " ", h.state] }), _jsxs("div", { style: { color: 'var(--text-muted)', marginTop: '2px' }, children: ["HCHO: ", (h.hcho * 1e4).toFixed(2), "\u00D710\u207B\u2074 | Fires: ", h.fires, " | ", h.source.replace('_', ' ')] })] }, h.id)))] })] })] })] }));
};
export default HchoAnalysis;
