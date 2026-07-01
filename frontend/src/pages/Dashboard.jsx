import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

// Station markers for the dashboard map
const dashboardStations = [
    { name: 'Delhi NCR', lat: 28.61, lon: 77.23, aqi: 382, hcho: '45.6 ppb', type: 'severe' },
    { name: 'Kanpur', lat: 26.44, lon: 80.33, aqi: 342, hcho: '38.2 ppb', type: 'very-poor' },
    { name: 'Lucknow', lat: 26.85, lon: 80.94, aqi: 310, hcho: '32.7 ppb', type: 'very-poor' },
    { name: 'Patna', lat: 25.59, lon: 85.13, aqi: 285, hcho: '29.4 ppb', type: 'poor' },
    { name: 'Varanasi', lat: 25.31, lon: 82.97, aqi: 260, hcho: '25.1 ppb', type: 'poor' },
    { name: 'Mumbai', lat: 19.07, lon: 72.87, aqi: 125, hcho: '12.4 ppb', type: 'moderate' },
    { name: 'Pune', lat: 18.52, lon: 73.85, aqi: 142, hcho: '14.8 ppb', type: 'moderate' },
    { name: 'Bengaluru', lat: 12.97, lon: 77.59, aqi: 68, hcho: '8.2 ppb', type: 'satisfactory' },
    { name: 'Chennai', lat: 13.08, lon: 80.27, aqi: 72, hcho: '9.1 ppb', type: 'satisfactory' }
];

const Dashboard = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [layerAQI, setLayerAQI] = useState(true);
    const [layerHCHO, setLayerHCHO] = useState(false);
    const [layerFires, setLayerFires] = useState(true);
    const [layerWind, setLayerWind] = useState(false);

    // Map Layers
    const stationLayerGroup = useRef(null);
    const hchoLayerGroup = useRef(null);
    const fireLayerGroup = useRef(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const map = L.map(mapRef.current, {
                center: [22.8, 79.5],
                zoom: 4.5,
                zoomControl: true
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                maxZoom: 18
            }).addTo(map);

            stationLayerGroup.current = L.layerGroup().addTo(map);
            hchoLayerGroup.current = L.layerGroup().addTo(map);
            fireLayerGroup.current = L.layerGroup().addTo(map);

            mapInstance.current = map;
            
            updateMapLayers();
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update layers based on checkboxes
    const updateMapLayers = () => {
        if (!mapInstance.current) return;

        // 1. AQI Stations Layer
        stationLayerGroup.current.clearLayers();
        if (layerAQI) {
            dashboardStations.forEach(s => {
                const color = s.aqi > 300 ? '#ef4444' : s.aqi > 200 ? '#f97316' : s.aqi > 100 ? '#eab308' : '#10b981';
                L.circleMarker([s.lat, s.lon], {
                    radius: 8,
                    fillColor: color,
                    color: '#fff',
                    weight: 1,
                    opacity: 0.9,
                    fillOpacity: 0.8
                }).addTo(stationLayerGroup.current)
                  .bindPopup(`<strong>${s.name}</strong><br/>AQI: ${s.aqi}<br/>HCHO: ${s.hcho}`);
            });
        }

        // 2. HCHO Hotspot Heatmap Overlay
        hchoLayerGroup.current.clearLayers();
        if (layerHCHO) {
            dashboardStations.forEach(s => {
                L.circle([s.lat, s.lon], {
                    radius: 90000,
                    fillColor: '#8b5cf6',
                    color: '#8b5cf6',
                    weight: 0,
                    fillOpacity: 0.35
                }).addTo(hchoLayerGroup.current);
            });
        }

        // 3. Fire Layer
        fireLayerGroup.current.clearLayers();
        if (layerFires) {
            dashboardStations.filter(s => s.aqi > 200).forEach(s => {
                L.circleMarker([s.lat + 0.5, s.lon - 0.4], {
                    radius: 4,
                    fillColor: '#ff6a00',
                    color: '#ff6a00',
                    weight: 0,
                    fillOpacity: 0.8
                }).addTo(fireLayerGroup.current);
            });
        }
    };

    useEffect(() => {
        updateMapLayers();
    }, [layerAQI, layerHCHO, layerFires, layerWind]);

    // Chart Data Configs
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
            y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
        }
    };

    const aqiTrendData = {
        labels: ['19 May', '20 May', '21 May', '22 May', '23 May', '24 May', '25 May'],
        datasets: [{
            data: [155, 185, 160, 210, 195, 178, 178],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 3
        }]
    };

    const hchoTrendData = {
        labels: ['19 May', '20 May', '21 May', '22 May', '23 May', '24 May', '25 May'],
        datasets: [{
            data: [20, 24, 21, 26, 23, 25, 24.6],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
            tension: 0.4,
            fill: true,
            pointRadius: 3
        }]
    };

    const fireEventsData = {
        labels: ['19 May', '20 May', '21 May', '22 May', '23 May', '24 May', '25 May'],
        datasets: [{
            data: [90, 140, 105, 120, 110, 95, 128],
            backgroundColor: '#FF8A37',
            borderRadius: 4
        }]
    };

    const sourceContributionData = {
        labels: ['Transition', 'Biomass Burning', 'Industries', 'Dust', 'Others'],
        datasets: [{
            data: [36, 28, 20, 10, 6],
            backgroundColor: ['#10b981', '#FF8A37', '#3b82f6', '#8b5cf6', '#64748b'],
            borderWidth: 0
        }]
    };

    return (
        <div className="page-container animate-fade-in" style={{ padding: '20px', maxWidth: '100%' }}>
            
            {/* ── Top Metric Cards Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                
                {/* AQI Avg */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AQI (India Avg.)</span>
                        <span style={{ fontSize: '16px' }}>☁️</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>178</span>
                        <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Unhealthy</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>↑ 12% vs yesterday</span>
                </div>

                {/* HCHO Avg */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>HCHO (India Avg.)</span>
                        <span style={{ fontSize: '16px' }}>🔬</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>24.6</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ppb</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>↑ 8% vs yesterday</span>
                </div>

                {/* Active Fires */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-orange)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Fires</span>
                        <span style={{ fontSize: '16px' }}>🔥</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>128</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>↑ 15% vs yesterday</span>
                </div>

                {/* Risk Level */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-red)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Risk Level</span>
                        <span style={{ fontSize: '16px' }}>🛡️</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-red)', fontFamily: 'var(--font-display)' }}>High</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Air Quality Risk</span>
                </div>

                {/* Active Alerts */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Alerts</span>
                        <span style={{ fontSize: '16px' }}>🔔</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>8</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View all alerts</span>
                </div>

                {/* Reports Generated */}
                <div className="card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-teal)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reports Generated</span>
                        <span style={{ fontSize: '16px' }}>📋</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Today: 12</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View reports</span>
                </div>
            </div>

            {/* ── Main Map & Control Layout Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' }}>
                
                {/* Air Quality Map India */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '560px', padding: '16px', position: 'relative' }}>
                    <div className="card-header" style={{ marginBottom: '12px' }}>
                        <span className="card-title">🗺️ AIR QUALITY MAP - INDIA</span>
                    </div>

                    <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

                        {/* Layer Controls Map Overlay */}
                        <div style={{
                            position: 'absolute', top: '15px', right: '15px', zIndex: 1000,
                            background: 'var(--bg-glass)', backdropFilter: 'blur(8px)',
                            padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                            width: '160px', display: 'flex', flexDirection: 'column', gap: '8px'
                        }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer Controls</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerAQI} onChange={() => setLayerAQI(!layerAQI)} /> AQI (PM2.5)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerHCHO} onChange={() => setLayerHCHO(!layerHCHO)} /> HCHO (ppb)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerFires} onChange={() => setLayerFires(!layerFires)} /> Fire Events
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerWind} onChange={() => setLayerWind(!layerWind)} /> Wind Flow
                            </label>
                        </div>

                        {/* AQI Legend Overlay */}
                        <div style={{
                            position: 'absolute', bottom: '15px', left: '15px', zIndex: 1000,
                            background: 'var(--bg-glass)', backdropFilter: 'blur(8px)',
                            padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                            fontSize: '10px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#009966' }} /> 0 - 50 Good</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#58B453' }} /> 51 - 100 Moderate</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFDE33' }} /> 101 - 200 Unhealthy (Sg)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF9933' }} /> 201 - 300 Unhealthy</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#CC0033' }} /> 301 - 400 Very Unhealthy</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#660099' }} /> 401 - 500 Hazardous</div>
                        </div>
                    </div>
                </div>

                {/* Right Alerts & Advisory Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Active Alerts */}
                    <div className="card" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span className="card-title" style={{ fontSize: '13px' }}>🔔 ACTIVE ALERTS</span>
                            <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>🔴 Pune: AQI &gt; 250 (Unhealthy)</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>25 May 2025, 10:20 AM</div>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>🟡 Delhi: High HCHO Hotspot Detected</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>25 May 2025, 09:45 AM</div>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>🔥 Forest Fire Detected in Odisha</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>25 May 2025, 09:10 AM</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>💨 Wind transporting pollution towards UP - NCR Region</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>25 May 2025, 08:50 AM</div>
                            </div>
                        </div>
                    </div>

                    {/* Health Advisory */}
                    <div className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span className="card-title" style={{ fontSize: '13px' }}>❤️ HEALTH ADVISORY</span>
                            <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Unhealthy</span>
                        </div>
                        <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            <li>Avoid prolonged outdoor activities</li>
                            <li>Wear N95/FFP2 mask when outside</li>
                            <li>Sensitive groups stay indoors</li>
                            <li>Keep windows closed</li>
                            <li>Follow local AQI updates</li>
                        </ul>
                    </div>

                    {/* Decision Support Directive */}
                    <div className="card" style={{ padding: '16px' }}>
                        <span className="card-title" style={{ fontSize: '13px', display: 'block', marginBottom: '10px' }}>🛡️ DECISION SUPPORT DIRECTIVES</span>
                        <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
                            <li>High HCHO levels detected in Delhi NCR</li>
                            <li>Fire cluster in central India contributing to pollution</li>
                            <li>AQI expected to rise in next 24 hours</li>
                            <li>Issue public advisory for vulnerable groups</li>
                        </ul>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>View Detailed Recommendations →</span>
                    </div>

                </div>
            </div>

            {/* ── Trends Charts Row (3 Columns) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                
                {/* AQI Trend */}
                <div className="card" style={{ height: '240px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <span className="card-title" style={{ fontSize: '12px', marginBottom: '4px' }}>AQI TREND (INDIA AVG.)</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>Weekly fluctuation</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={aqiTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* HCHO Trend */}
                <div className="card" style={{ height: '240px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <span className="card-title" style={{ fontSize: '12px', marginBottom: '4px' }}>HCHO TREND (INDIA AVG.)</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>Formaldehyde values (ppb)</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={hchoTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Fire Events Bar */}
                <div className="card" style={{ height: '240px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <span className="card-title" style={{ fontSize: '12px', marginBottom: '4px' }}>FIRE EVENTS</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>Detections count</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={fireEventsData} options={chartOptions} />
                    </div>
                </div>

            </div>

            {/* ── Bottom Explainability, Hotspots & Sources Row (4 Columns) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                
                {/* SHAP Explainability */}
                <div className="card" style={{ padding: '16px' }}>
                    <span className="card-title" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>SHAP EXPLAINABILITY</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>Impact on AQI Prediction</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>Wind Speed</span>
                                <span>42%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '42%', height: '100%', background: '#10b981' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>HCHO Level</span>
                                <span>31%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '31%', height: '100%', background: '#06b6d4' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>Fire Events</span>
                                <span>18%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '18%', height: '100%', background: '#FF8A37' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>Humidity</span>
                                <span>9%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '9%', height: '100%', background: '#8b5cf6' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top HCHO Hotspots List */}
                <div className="card" style={{ padding: '16px' }}>
                    <span className="card-title" style={{ fontSize: '12px', display: 'block', marginBottom: '16px' }}>🔥 TOP HCHO HOTSPOTS</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { name: 'Delhi NCR', val: '45.6 ppb' },
                            { name: 'Kanpur', val: '38.2 ppb' },
                            { name: 'Lucknow', val: '32.7 ppb' },
                            { name: 'Patna', val: '29.4 ppb' },
                            { name: 'Varanasi', val: '25.1 ppb' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '6px', borderBottom: idx < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{idx + 1}. {item.name}</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pollution Source Contribution */}
                <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '220px' }}>
                    <span className="card-title" style={{ fontSize: '12px', marginBottom: '12px' }}>🍩 SOURCE CONTRIBUTION</span>
                    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                        <Doughnut data={sourceContributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* Report Generation actions */}
                <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span className="card-title" style={{ fontSize: '12px', marginBottom: '8px' }}>📋 REPORT GENERATION</span>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        📄 Generate PDF Report
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        ⬇️ Download Detailed Report
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        📊 Export Data (CSV)
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        🔗 Share Dashboard
                    </button>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
