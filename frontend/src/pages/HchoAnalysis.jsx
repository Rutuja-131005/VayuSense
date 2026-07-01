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

// Wind vectors: simulated ERA5-style wind arrows at grid points
const demoWindVectors = [
    { lat: 30.5, lon: 76.0, u: 3.2, v: -1.5 },
    { lat: 29.0, lon: 77.0, u: 2.8, v: -2.1 },
    { lat: 28.0, lon: 78.0, u: 1.5, v: -3.0 },
    { lat: 26.0, lon: 80.0, u: 2.0, v: -1.0 },
    { lat: 25.0, lon: 83.0, u: -1.2, v: -2.5 },
    { lat: 23.0, lon: 81.0, u: 1.8, v: 0.5 },
    { lat: 22.0, lon: 79.0, u: 2.5, v: 1.2 },
    { lat: 27.0, lon: 92.0, u: -0.8, v: -1.8 },
    { lat: 24.0, lon: 85.0, u: 1.0, v: -2.0 },
    { lat: 20.0, lon: 77.0, u: 3.0, v: 0.8 },
];

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
    const fireLayerRef = useRef(null);
    const windLayerRef = useRef(null);
    const hotspotLayerRef = useRef(null);

    const [showFires, setShowFires] = useState(true);
    const [showWind, setShowWind] = useState(false);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-01-31');
    const [detecting, setDetecting] = useState(false);
    const [detectionRun, setDetectionRun] = useState(false);

    // Initialize map once
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

            // Create layer groups
            hotspotLayerRef.current = L.layerGroup().addTo(map);
            fireLayerRef.current = L.layerGroup().addTo(map);
            windLayerRef.current = L.layerGroup().addTo(map);

            mapInstance.current = map;

            // Initial render of all layers
            renderHotspots();
            renderFires();
        }
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // React to fire layer toggle
    useEffect(() => {
        renderFires();
    }, [showFires]);

    // React to wind layer toggle
    useEffect(() => {
        renderWindVectors();
    }, [showWind]);

    function renderHotspots() {
        if (!hotspotLayerRef.current) return;
        hotspotLayerRef.current.clearLayers();
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
                .addTo(hotspotLayerRef.current)
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
    }

    function renderFires() {
        if (!fireLayerRef.current) return;
        fireLayerRef.current.clearLayers();
        if (showFires) {
            demoFires.forEach((f) => {
                L.circleMarker([f.lat, f.lon], {
                    radius: Math.max(2, f.frp / 25),
                    fillColor: '#ff6b35',
                    color: '#ff6b35',
                    weight: 0,
                    fillOpacity: 0.5,
                }).addTo(fireLayerRef.current)
                  .bindPopup(`<div style="font-family: Inter, sans-serif;"><strong>Fire Detection</strong><br/>FRP: ${f.frp.toFixed(1)} MW<br/>Lat: ${f.lat.toFixed(2)}, Lon: ${f.lon.toFixed(2)}</div>`);
            });
        }
    }

    function renderWindVectors() {
        if (!windLayerRef.current) return;
        windLayerRef.current.clearLayers();
        if (showWind) {
            demoWindVectors.forEach((w) => {
                const speed = Math.sqrt(w.u * w.u + w.v * w.v);
                const angle = Math.atan2(w.v, w.u) * (180 / Math.PI);
                const arrowLen = 0.8;
                const endLat = w.lat + (w.v / speed) * arrowLen;
                const endLon = w.lon + (w.u / speed) * arrowLen;

                // Wind arrow line
                L.polyline([[w.lat, w.lon], [endLat, endLon]], {
                    color: '#06b6d4',
                    weight: 2,
                    opacity: 0.7,
                }).addTo(windLayerRef.current);

                // Arrowhead marker
                L.circleMarker([endLat, endLon], {
                    radius: 4,
                    fillColor: '#06b6d4',
                    color: '#06b6d4',
                    weight: 1,
                    fillOpacity: 0.9,
                }).addTo(windLayerRef.current)
                  .bindPopup(`<div style="font-family: Inter, sans-serif;"><strong>Wind Vector</strong><br/>Speed: ${speed.toFixed(1)} m/s<br/>U: ${w.u.toFixed(1)}, V: ${w.v.toFixed(1)}</div>`);
            });
        }
    }

    function handleRunDetection() {
        setDetecting(true);
        setDetectionRun(false);
        // Simulate a detection run with a brief loading state
        setTimeout(() => {
            // Re-render all layers with current settings
            renderHotspots();
            renderFires();
            renderWindVectors();
            // Fit map bounds to hotspots
            if (mapInstance.current) {
                const bounds = L.latLngBounds(demoHotspots.map(h => [h.lat, h.lon]));
                mapInstance.current.fitBounds(bounds.pad(0.3));
            }
            setDetecting(false);
            setDetectionRun(true);
        }, 800);
    }

    return (_jsxs("div", { className: "page-container animate-fade-in", children: [
        _jsxs("div", { className: "stat-cards-grid stagger-children", children: [
            _jsx(StatCard, { label: "HCHO Hotspots", value: demoHotspots.length, color: "purple", icon: "🧪", trend: "Active clusters" }),
            _jsx(StatCard, { label: "Biomass Burning", value: 3, color: "red", icon: "🔥", trend: "Source regions" }),
            _jsx(StatCard, { label: "Fire Events", value: demoFires.length, color: "orange", icon: "🌋", trend: "MODIS + VIIRS" }),
            _jsx(StatCard, { label: "Mean HCHO", value: "1.87", color: "cyan", icon: "📈", trend: "×10⁻⁴ mol/m²" })
        ] }),

        _jsxs("div", { className: "grid-map-sidebar", children: [
            _jsx("div", { ref: mapRef, className: "map-container", style: { height: '600px' } }),

            _jsxs("div", { children: [
                _jsxs("div", { className: "card", style: { marginBottom: '16px' }, children: [
                    _jsx("div", { className: "card-title", style: { marginBottom: '16px' }, children: "Analysis Controls" }),

                    _jsxs("div", { className: "form-group", children: [
                        _jsx("label", { className: "form-label", children: "Start Date" }),
                        _jsx("input", { type: "date", className: "form-input", value: startDate, onChange: (e) => setStartDate(e.target.value), style: { marginBottom: '8px' } }),
                        _jsx("label", { className: "form-label", children: "End Date" }),
                        _jsx("input", { type: "date", className: "form-input", value: endDate, onChange: (e) => setEndDate(e.target.value) })
                    ] }),

                    _jsxs("div", { className: "form-group", style: { display: 'flex', gap: '12px', marginTop: '12px' }, children: [
                        _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }, children: [
                            _jsx("input", { type: "checkbox", checked: showFires, onChange: () => setShowFires(!showFires) }),
                            "Fire Layer"
                        ] }),
                        _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }, children: [
                            _jsx("input", { type: "checkbox", checked: showWind, onChange: () => setShowWind(!showWind) }),
                            "Wind Vectors"
                        ] })
                    ] }),

                    _jsx("button", {
                        className: "btn btn-primary",
                        style: { width: '100%', marginTop: '12px' },
                        onClick: handleRunDetection,
                        disabled: detecting,
                        children: detecting ? "⏳ Detecting..." : "🔍 Run Detection"
                    }),

                    detectionRun && _jsxs("div", { style: { marginTop: '12px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: 'var(--accent-green)' }, children: [
                        "✅ Detection complete for ", startDate, " to ", endDate, ". Found ", demoHotspots.length, " HCHO clusters and ", demoFires.length, " fire events."
                    ] })
                ] }),

                _jsxs("div", { className: "card", style: { marginBottom: '16px' }, children: [
                    _jsx("div", { className: "card-title", style: { marginBottom: '12px' }, children: "Source Types" }),
                    [
                        { source: 'Biomass Burning', color: '#ef4444' },
                        { source: 'Industrial', color: '#f97316' },
                        { source: 'Biogenic', color: '#22c55e' },
                        { source: 'Mixed', color: '#8b5cf6' },
                    ].map((s) => (
                        _jsxs("div", { key: s.source, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }, children: [
                            _jsx("div", { style: { width: '14px', height: '14px', borderRadius: '50%', background: s.color } }),
                            _jsx("span", { style: { fontSize: '12px', color: 'var(--text-secondary)' }, children: s.source })
                        ] })
                    ))
                ] }),

                _jsxs("div", { className: "card", children: [
                    _jsx("div", { className: "card-title", style: { marginBottom: '12px' }, children: "Detected Hotspots" }),
                    demoHotspots.map((h) => (
                        _jsxs("div", { key: h.id, style: {
                            padding: '10px',
                            borderBottom: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            cursor: 'pointer',
                        },
                        onClick: () => {
                            if (mapInstance.current) {
                                mapInstance.current.setView([h.lat, h.lon], 8, { animate: true });
                            }
                        },
                        children: [
                            _jsxs("div", { style: { fontWeight: 600, color: 'var(--text-primary)' }, children: ["#", h.id, " ", h.state] }),
                            _jsxs("div", { style: { color: 'var(--text-muted)', marginTop: '2px' }, children: [
                                "HCHO: ", (h.hcho * 1e4).toFixed(2), "×10⁻⁴ | Fires: ", h.fires, " | ", h.source.replace('_', ' ')
                            ] })
                        ] })
                    ))
                ] })
            ] })
        ] })
    ] }));
};

export default HchoAnalysis;
