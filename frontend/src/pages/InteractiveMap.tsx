/**
 * Interactive AQI Map Page
 * =========================
 * Full-screen Leaflet map with state-wise multiple selection,
 * dynamic boundary highlighting, and city-wise CPCB AQI classifications.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── India Center & Zoom ────────────────────────────────────────── */
const INDIA_CENTER: [number, number] = [22.5, 79.0];
const INDIA_ZOOM = 5;

/* ── Simplified State Boundaries Database ───────────────────────── */
const STATE_BOUNDARIES: Record<string, [number, number][]> = {
  'Delhi': [
    [28.40, 76.84], [28.88, 76.84], [28.88, 77.34], [28.40, 77.34]
  ],
  'Uttar Pradesh': [
    [26.85, 77.30], [27.90, 77.80], [30.15, 77.60], [29.90, 80.15],
    [28.10, 80.30], [28.60, 81.30], [27.40, 84.40], [25.10, 84.35],
    [24.10, 82.80], [25.15, 81.60], [25.10, 78.50], [26.00, 78.00]
  ],
  'Maharashtra': [
    [20.00, 72.60], [22.00, 72.60], [22.00, 74.45], [21.50, 79.10],
    [19.90, 80.90], [17.50, 80.90], [15.65, 74.20], [16.50, 73.00]
  ],
  'Tamil Nadu': [
    [13.50, 80.20], [13.00, 79.30], [12.05, 77.10], [8.05, 77.10],
    [8.05, 77.75], [10.20, 79.85], [11.50, 79.95], [12.50, 80.20]
  ],
  'Karnataka': [
    [18.40, 77.00], [17.50, 77.60], [16.50, 77.50], [15.00, 78.50],
    [13.50, 78.50], [12.00, 77.00], [11.55, 76.60], [12.50, 74.80],
    [15.00, 74.00], [16.00, 74.25]
  ],
  'West Bengal': [
    [27.15, 88.10], [27.30, 88.90], [26.20, 89.85], [25.15, 88.05],
    [24.50, 88.85], [21.50, 89.05], [21.50, 87.05], [22.80, 86.85],
    [24.55, 85.80], [25.20, 87.25]
  ],
  'Gujarat': [
    [24.50, 68.20], [24.68, 71.05], [24.45, 72.85], [22.05, 74.25],
    [20.10, 72.85], [20.80, 72.00], [22.20, 72.25], [21.80, 70.00],
    [22.45, 68.95], [23.50, 70.00]
  ],
  'Rajasthan': [
    [30.55, 73.95], [30.20, 75.25], [27.05, 77.05], [24.05, 76.55],
    [24.00, 74.00], [24.50, 72.50], [25.80, 70.00], [28.00, 69.50],
    [30.00, 71.50]
  ],
  'Punjab': [
    [32.50, 75.80], [31.50, 76.50], [30.00, 74.55], [29.60, 74.00],
    [30.50, 73.80], [32.05, 74.50]
  ],
  'Kerala': [
    [12.80, 74.90], [12.00, 75.35], [11.50, 76.25], [10.00, 76.35],
    [8.30, 77.05], [8.20, 77.25], [9.50, 76.55], [10.50, 76.05],
    [12.00, 75.05]
  ],
  'Bihar': [
    [27.50, 84.00], [27.50, 88.00], [25.20, 88.00], [25.20, 87.05],
    [24.30, 85.50], [25.00, 83.35]
  ],
  'Haryana': [
    [30.00, 74.55], [30.85, 76.85], [28.50, 77.55], [27.80, 77.05],
    [28.00, 76.00], [28.80, 75.85], [29.20, 74.55]
  ],
  'Madhya Pradesh': [
    [26.85, 78.00], [26.00, 79.00], [24.50, 82.80], [22.00, 81.50],
    [21.50, 76.00], [22.00, 74.25], [24.50, 74.00], [25.00, 76.50]
  ],
  'Telangana': [
    [19.90, 78.00], [19.00, 80.30], [17.50, 81.00], [16.50, 80.00],
    [16.00, 78.00], [17.50, 77.50]
  ],
  'Assam': [
    [26.00, 89.90], [26.90, 90.00], [26.90, 92.50], [27.90, 95.50],
    [27.00, 96.00], [25.00, 93.00], [25.00, 90.00]
  ]
};

/* ── Demo Station Data ─────────────────────────────────────────── */
const demoStations = [
  { name: 'ITO Delhi', lat: 28.63, lon: 77.25, aqi: 312, cat: 'Very Poor', state: 'Delhi' },
  { name: 'Anand Vihar', lat: 28.65, lon: 77.32, aqi: 385, cat: 'Very Poor', state: 'Delhi' },
  { name: 'Dwarka Sector 8', lat: 28.57, lon: 77.07, aqi: 340, cat: 'Very Poor', state: 'Delhi' },
  
  { name: 'Lucknow Central', lat: 26.85, lon: 80.95, aqi: 215, cat: 'Poor', state: 'Uttar Pradesh' },
  { name: 'Noida Sector 62', lat: 28.62, lon: 77.37, aqi: 285, cat: 'Poor', state: 'Uttar Pradesh' },
  { name: 'Varanasi', lat: 25.31, lon: 82.97, aqi: 195, cat: 'Moderate', state: 'Uttar Pradesh' },
  
  { name: 'Patna Center', lat: 25.60, lon: 85.10, aqi: 248, cat: 'Poor', state: 'Bihar' },
  { name: 'Gaya', lat: 24.79, lon: 85.00, aqi: 180, cat: 'Moderate', state: 'Bihar' },
  
  { name: 'Kolkata Victoria', lat: 22.57, lon: 88.36, aqi: 175, cat: 'Moderate', state: 'West Bengal' },
  { name: 'Howrah', lat: 22.58, lon: 88.32, aqi: 190, cat: 'Moderate', state: 'West Bengal' },
  
  { name: 'Mumbai Bandra', lat: 19.08, lon: 72.88, aqi: 128, cat: 'Moderate', state: 'Maharashtra' },
  { name: 'Pune', lat: 18.52, lon: 73.85, aqi: 95, cat: 'Satisfactory', state: 'Maharashtra' },
  
  { name: 'Chennai US Embassy', lat: 13.08, lon: 80.27, aqi: 76, cat: 'Satisfactory', state: 'Tamil Nadu' },
  { name: 'Coimbatore', lat: 11.01, lon: 76.95, aqi: 48, cat: 'Good', state: 'Tamil Nadu' },
  
  { name: 'Bengaluru City', lat: 12.97, lon: 77.59, aqi: 65, cat: 'Satisfactory', state: 'Karnataka' },
  { name: 'Mysuru', lat: 12.29, lon: 76.63, aqi: 35, cat: 'Good', state: 'Karnataka' },
  
  { name: 'Hyderabad US Consulate', lat: 17.39, lon: 78.49, aqi: 98, cat: 'Satisfactory', state: 'Telangana' },
  
  { name: 'Ahmedabad Maninagar', lat: 23.02, lon: 72.57, aqi: 142, cat: 'Moderate', state: 'Gujarat' },
  
  { name: 'Jaipur Mansarovar', lat: 26.92, lon: 75.78, aqi: 165, cat: 'Moderate', state: 'Rajasthan' },
  
  { name: 'Chandigarh Sector 22', lat: 30.73, lon: 76.78, aqi: 152, cat: 'Moderate', state: 'Punjab' },
  
  { name: 'Guwahati Stn', lat: 26.14, lon: 91.74, aqi: 88, cat: 'Satisfactory', state: 'Assam' },
  
  { name: 'Bhopal Paryavaran', lat: 23.26, lon: 77.41, aqi: 135, cat: 'Moderate', state: 'Madhya Pradesh' },
  
  { name: 'Thiruvananthapuram', lat: 8.52, lon: 76.94, aqi: 42, cat: 'Good', state: 'Kerala' },
  { name: 'Kochi', lat: 9.93, lon: 76.26, aqi: 52, cat: 'Satisfactory', state: 'Kerala' },
];

/* ── CPCB Range Classification ──────────────────────────────────── */
function getAqiInfo(aqi: number) {
  if (aqi <= 50) return { color: '#009966', cat: 'Good', class: 'good' };
  if (aqi <= 100) return { color: '#58B453', cat: 'Satisfactory', class: 'satisfactory' };
  if (aqi <= 200) return { color: '#FFDE33', cat: 'Moderate', class: 'moderate' };
  if (aqi <= 300) return { color: '#FF9933', cat: 'Poor', class: 'poor' };
  if (aqi <= 400) return { color: '#CC0033', cat: 'Very Poor', class: 'very-poor' };
  return { color: '#660099', cat: 'Severe', class: 'severe' };
}

const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState('aqi');
  
  // Keep refs for dynamic layers to avoid complete reinitialization of the map
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  console.log("Render body: selectedStates =", selectedStates);

  // Initialize Map Once
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: INDIA_CENTER,
        zoom: INDIA_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 18,
        }
      ).addTo(map);

      polygonsGroupRef.current = L.featureGroup().addTo(map);
      markersGroupRef.current = L.featureGroup().addTo(map);

      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Polygons, Markers and Zoom on Selection Change
  useEffect(() => {
    const map = mapInstance.current;
    const polygonsGroup = polygonsGroupRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !polygonsGroup || !markersGroup) return;

    console.log("Effect start: selectedStates =", selectedStates);

    // Clear previous elements
    polygonsGroup.clearLayers();
    markersGroup.clearLayers();

    // Determine filtered stations
    const activeStations = demoStations.filter(st => 
      selectedStates.length === 0 || selectedStates.includes(st.state)
    );
    console.log("Active stations count:", activeStations.length);

    // 1. Draw highlighted state boundaries
    selectedStates.forEach(stateName => {
      const coords = STATE_BOUNDARIES[stateName];
      if (coords) {
        console.log("Adding polygon for state:", stateName);
        const poly = L.polygon(coords, {
          color: '#06b6d4',      // Glowing cyan
          fillColor: '#06b6d4',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 4',
        });
        polygonsGroup.addLayer(poly);
      }
    });

    // 2. Add city-wise CPCB colored markers
    activeStations.forEach(station => {
      const info = getAqiInfo(station.aqi);
      
      const marker = L.circleMarker([station.lat, station.lon], {
        radius: Math.max(10, 6 + (station.aqi / 35)),
        fillColor: info.color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.75,
      });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #1e293b;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${station.name}</h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">State: ${station.state}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px; font-weight: 800; color: ${info.color};">${station.aqi}</span>
            <span style="
              background: ${info.color}22;
              color: ${info.color};
              font-size: 10px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 12px;
              text-transform: uppercase;
            ">${info.cat}</span>
          </div>
        </div>
      `);

      markersGroup.addLayer(marker);
    });

    // 3. Zoom / Fit Bounds
    if (selectedStates.length > 0 && polygonsGroup.getLayers().length > 0) {
      const bounds = polygonsGroup.getBounds();
      console.log("Calling fitBounds with bounds:", bounds);
      if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      console.log("fitBounds call finished");
    } else {
      console.log("Setting view to default India center");
      map.setView(INDIA_CENTER, INDIA_ZOOM);
    }
    console.log("Effect end");

  }, [selectedStates]);

  // Handle Multi-state Toggle Selection
  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      setSelectedStates(selectedStates.filter(s => s !== state));
    } else {
      setSelectedStates([...selectedStates, state]);
    }
  };

  const clearAllStates = () => {
    setSelectedStates([]);
  };

  // Group stations in selected states by category to view statistics
  const currentActiveStations = demoStations.filter(st =>
    selectedStates.length === 0 || selectedStates.includes(st.state)
  );

  const stats = {
    good: currentActiveStations.filter(s => s.aqi <= 50).length,
    satisfactory: currentActiveStations.filter(s => s.aqi > 50 && s.aqi <= 100).length,
    moderate: currentActiveStations.filter(s => s.aqi > 100 && s.aqi <= 200).length,
    poor: currentActiveStations.filter(s => s.aqi > 200 && s.aqi <= 300).length,
    veryPoor: currentActiveStations.filter(s => s.aqi > 300 && s.aqi <= 400).length,
    severe: currentActiveStations.filter(s => s.aqi > 400).length,
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="grid-map-sidebar">
        
        {/* Leaflet Map Visualisation */}
        <div>
          <div ref={mapRef} className="map-container" style={{ height: '700px' }} />
        </div>

        {/* Interactive Multi-Select Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* State Multi-Selector Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="card-title">Select States</span>
              {selectedStates.length > 0 && (
                <button 
                  onClick={clearAllStates} 
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '6px',
            }}>
              {Object.keys(STATE_BOUNDARIES).sort().map(state => (
                <label 
                  key={state}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedStates.includes(state) ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    border: selectedStates.includes(state) ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => toggleState(state)}
                    style={{
                      accentColor: 'var(--accent-cyan)',
                      width: '15px',
                      height: '15px',
                      cursor: 'pointer',
                    }}
                  />
                  {state}
                </label>
              ))}
            </div>
          </div>

          {/* CPCB Range Category Counter Card */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px' }}>AQI Classification Counter</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { range: '0–50', cat: 'Good', color: '#009966', count: stats.good, badgeClass: 'good' },
                { range: '51–100', cat: 'Satisfactory', color: '#58B453', count: stats.satisfactory, badgeClass: 'satisfactory' },
                { range: '101–200', cat: 'Moderate', color: '#FFDE33', count: stats.moderate, badgeClass: 'moderate' },
                { range: '201–300', cat: 'Poor', color: '#FF9933', count: stats.poor, badgeClass: 'poor' },
                { range: '301–400', cat: 'Very Poor', color: '#CC0033', count: stats.veryPoor, badgeClass: 'very-poor' },
                { range: '401–500', cat: 'Severe', color: '#660099', count: stats.severe, badgeClass: 'severe' },
              ].map((item) => (
                <div 
                  key={item.cat} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${item.color}`,
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.range}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.cat}</span>
                  </div>
                  <span className={`badge badge-${item.badgeClass}`} style={{ minWidth: '24px', textAlign: 'center' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Citywise Breakdown Card */}
          <div className="card" style={{ flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ marginBottom: '10px' }}>
              Citywise AQI List ({currentActiveStations.length})
            </div>
            <div style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              {currentActiveStations.length > 0 ? (
                currentActiveStations.map(station => {
                  const info = getAqiInfo(station.aqi);
                  return (
                    <div 
                      key={station.name}
                      style={{
                        padding: '8px 10px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (mapInstance.current) {
                          mapInstance.current.setView([station.lat, station.lon], 9);
                        }
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {station.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {station.state}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: info.color }}>
                          {station.aqi}
                        </span>
                        <span className={`badge badge-${info.class}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {info.cat}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
                  No cities found
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
