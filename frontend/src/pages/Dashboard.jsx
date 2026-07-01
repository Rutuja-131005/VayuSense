import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

// CPCB color scheme and stations
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

    const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());
    const [liveAOD, setLiveAOD] = useState(0.384);
    const [liveHCHO, setLiveHCHO] = useState(1.87);

    useEffect(() => {
        const timer = setInterval(() => {
            setLiveTime(new Date().toLocaleTimeString());
            setLiveAOD(prev => +(prev + (Math.random() - 0.5) * 0.008).toFixed(3));
            setLiveHCHO(prev => +(prev + (Math.random() - 0.5) * 0.04).toFixed(2));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const updateMapLayers = () => {
        if (!mapInstance.current) return;

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

    // Chart Configuration
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

    // Inline style overrides for cards to match high-density dark UI theme
    const cardStyle = {
        background: '#0f1a34',
        border: '1px solid #1e293b',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        transition: 'border-color var(--transition-normal), box-shadow var(--transition-normal)'
    };

    return (
        <div className="page-container animate-fade-in" style={{ padding: '16px', maxWidth: '100%', background: '#0b132b' }}>
            
            {/* ── Top Metric Cards Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                
                {/* AQI Avg */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AQI (India Avg.)</span>
                        <span style={{ fontSize: '14px' }}>☁️</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>178</span>
                        <span style={{ fontSize: '9px', background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Unhealthy</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>↑ 12% vs yesterday</span>
                </div>

                {/* HCHO Avg */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>HCHO (India Avg.)</span>
                        <span style={{ fontSize: '14px' }}>🔬</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>24.6</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ppb</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>↑ 8% vs yesterday</span>
                </div>

                {/* Active Fires */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-orange)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Fires</span>
                        <span style={{ fontSize: '14px' }}>🔥</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>128</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>↑ 15% vs yesterday</span>
                </div>

                {/* Risk Level */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-red)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Risk Level</span>
                        <span style={{ fontSize: '14px' }}>🛡️</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)', fontFamily: 'var(--font-display)' }}>High</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Air Quality Risk</span>
                </div>

                {/* Active Alerts */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Alerts</span>
                        <span style={{ fontSize: '14px' }}>🔔</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>8</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View all alerts</span>
                </div>

                {/* Reports Generated */}
                <div style={{ ...cardStyle, borderLeft: '3px solid var(--accent-teal)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reports Generated</span>
                        <span style={{ fontSize: '14px' }}>📋</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>Today: 12</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View reports</span>
                </div>
            </div>

            {/* ── Main Map & Control Layout Grid ── */}
            <div className="dashboard-main-grid">
                
                {/* Air Quality Map India */}
                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '500px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>🗺️ AIR QUALITY MAP - INDIA</span>
                    </div>

                    <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

                        {/* Layer Controls Map Overlay */}
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px', zIndex: 1000,
                            background: 'rgba(15, 26, 52, 0.95)', backdropFilter: 'blur(8px)',
                            padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b',
                            width: '150px', display: 'flex', flexDirection: 'column', gap: '6px'
                        }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer Controls</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerAQI} onChange={() => setLayerAQI(!layerAQI)} /> AQI (PM2.5)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerHCHO} onChange={() => setLayerHCHO(!layerHCHO)} /> HCHO (ppb)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerFires} onChange={() => setLayerFires(!layerFires)} /> Fire Events
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layerWind} onChange={() => setLayerWind(!layerWind)} /> Wind Flow
                            </label>
                        </div>

                        {/* AQI Legend Overlay */}
                        <div style={{
                            position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000,
                            background: 'rgba(15, 26, 52, 0.95)', backdropFilter: 'blur(8px)',
                            padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b',
                            fontSize: '9px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#009966' }} /> 0 - 50 Good</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#58B453' }} /> 51 - 100 Moderate</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFDE33' }} /> 101 - 200 Unhealthy (Sg)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF9933' }} /> 201 - 300 Unhealthy</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CC0033' }} /> 301 - 400 Very Unhealthy</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#660099' }} /> 401 - 500 Hazardous</div>
                        </div>
                    </div>
                </div>

                {/* Right Alerts & Advisory Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Active Alerts */}
                    <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase' }}>🔔 ACTIVE ALERTS</span>
                            <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', cursor: 'pointer' }}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '160px' }}>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>🔴 Pune: AQI &gt; 250 (Unhealthy)</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>25 May 2025, 10:20 AM</div>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>🟡 Delhi: High HCHO Hotspot Detected</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>25 May 2025, 09:45 AM</div>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>🔥 Forest Fire Detected in Odisha</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>25 May 2025, 09:10 AM</div>
                            </div>
                        </div>
                    </div>

                    {/* Health Advisory */}
                    <div style={{ ...cardStyle, padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase' }}>❤️ HEALTH ADVISORY</span>
                            <span style={{ fontSize: '9px', background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>Unhealthy</span>
                        </div>
                        <ul style={{ paddingLeft: '14px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            <li>Avoid prolonged outdoor activities</li>
                            <li>Wear N95/FFP2 mask when outside</li>
                            <li>Sensitive groups stay indoors</li>
                            <li>Keep windows closed</li>
                        </ul>
                    </div>

                    {/* Decision Support Directive */}
                    <div style={{ ...cardStyle, padding: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>🛡️ DECISION SUPPORT</span>
                        <ul style={{ paddingLeft: '14px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '6px' }}>
                            <li>High HCHO levels detected in Delhi NCR</li>
                            <li>Fire cluster in central India contributing to pollution</li>
                        </ul>
                        <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>View Detailed Recommendations →</span>
                    </div>

                </div>
            </div>

            {/* ── Dense Multi-Chart Analytics Grid Row (8 Widgets in 4 Columns) ── */}
            <div className="dashboard-analytics-grid">
                
                {/* 1. AQI Trend */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>AQI TREND (INDIA AVG.)</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px' }}>Weekly fluctuation</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={aqiTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* 2. HCHO Trend */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>HCHO TREND (INDIA AVG.)</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px' }}>Formaldehyde values (ppb)</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={hchoTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* 3. Fire Events */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>FIRE EVENTS</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px' }}>Detections count</span>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={fireEventsData} options={chartOptions} />
                    </div>
                </div>

                {/* 4. SHAP Explainability */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1', display: 'block' }}>SHAP EXPLAINABILITY</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Impact on AQI Prediction</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                <span>Wind Speed</span>
                                <span>42%</span>
                            </div>
                            <div style={{ height: '4px', background: '#0b132b', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '42%', height: '100%', background: '#10b981' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                <span>HCHO Level</span>
                                <span>31%</span>
                            </div>
                            <div style={{ height: '4px', background: '#0b132b', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '31%', height: '100%', background: '#06b6d4' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                <span>Fire Events</span>
                                <span>18%</span>
                            </div>
                            <div style={{ height: '4px', background: '#0b132b', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '18%', height: '100%', background: '#FF8A37' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Wind Transport */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>WIND TRANSPORT</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>Flow vectors & dispersion</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b132b', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
                        {/* Animated Wind SVG Flow */}
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            <path d="M10 20 Q 50 10, 90 20 T 170 20" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="5,5">
                                <animate attributeName="stroke-dashoffset" values="50;0" dur="3s" repeatCount="indefinite" />
                            </path>
                            <path d="M10 50 Q 70 30, 130 60 T 220 50" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="2" strokeDasharray="5,5">
                                <animate attributeName="stroke-dashoffset" values="40;0" dur="2.5s" repeatCount="indefinite" />
                            </path>
                            <path d="M10 80 Q 60 90, 110 70 T 210 80" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="2" strokeDasharray="5,5">
                                <animate attributeName="stroke-dashoffset" values="30;0" dur="4s" repeatCount="indefinite" />
                            </path>
                        </svg>
                        <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', zIndex: 1, fontWeight: 600 }}>Dynamic Wind Vectors Active</span>
                    </div>
                </div>

                {/* 6. Top HCHO Hotspots */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>🔥 TOP HCHO HOTSPOTS</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', flex: 1 }}>
                        {[
                            { name: 'Delhi NCR', val: '45.6 ppb' },
                            { name: 'Kanpur', val: '38.2 ppb' },
                            { name: 'Lucknow', val: '32.7 ppb' },
                            { name: 'Patna', val: '29.4 ppb' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingBottom: '3px', borderBottom: idx < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{idx + 1}. {item.name}</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Pollution Source Contribution */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>🍩 SOURCE CONTRIBUTION</span>
                    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                        <Doughnut data={sourceContributionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* 8. Live & Static Telemetry Feed */}
                <div style={{ ...cardStyle, height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>📡 REAL-TIME TELEMETRY</span>
                    
                    {/* Live Data Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.5px' }}>⚡ LIVE TELEMETRY</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>System Time:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{liveTime}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>INSAT-3D AOD:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>{liveAOD}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>S-5P HCHO:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: 600 }}>{liveHCHO} × 10⁻⁴</span>
                        </div>
                    </div>

                    {/* Static Data Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>🔒 STATIC METADATA</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                            <span>CAAQMS Stations:</span>
                            <span>804</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                            <span>Validation Sites:</span>
                            <span>7</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
