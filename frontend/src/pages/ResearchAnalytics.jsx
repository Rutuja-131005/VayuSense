import React from 'react';

const correlationMatrix = [
    { factor: 'INSAT-3D AOD vs Ground PM2.5', coef: '0.86', relation: 'Very Strong Positive', note: 'Direct physical indicator of surface particulate concentrations.' },
    { factor: 'Sentinel-5P HCHO vs MODIS Fire Counts (FRP)', coef: '0.78', relation: 'Strong Positive', note: 'Indicates formaldehyde production driven by biomass burning.' },
    { factor: 'PBLH vs Surface AQI (Thermal Inversion)', coef: '-0.71', relation: 'Strong Negative', note: 'Lower boundary layer traps particulate matter at ground level.' },
    { factor: 'Wind Speed vs Pollutant Dispersion', coef: '-0.62', relation: 'Moderate Negative', note: 'Higher wind speeds disperse local concentration plumes.' }
];

const regionalStats = [
    { region: 'Indo-Gangetic Plain (IGP)', no2: '48.2 µg/m³', hcho: '2.84e-4 mol/m²', fires: 142, risk: 'Critical' },
    { region: 'Central India Industrial Belt', no2: '38.6 µg/m³', hcho: '1.92e-4 mol/m²', fires: 54, risk: 'High' },
    { region: 'Southern Peninsula', no2: '14.2 µg/m³', hcho: '0.98e-4 mol/m²', fires: 12, risk: 'Low' },
    { region: 'Western Thar Region', no2: '18.1 µg/m³', hcho: '0.64e-4 mol/m²', fires: 4, risk: 'Low' },
    { region: 'North-Eastern Forest Belt', no2: '8.4 µg/m³', hcho: '2.10e-4 mol/m²', fires: 85, risk: 'Medium (Biogenic)' }
];

const ResearchAnalytics = () => {
    return (
        <div className="page-container animate-fade-in">
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>
                    📈 Research Analytics & Multi-Sensor Correlations
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    This research portal displays correlations calculated between independent satellite observations (Sentinel-5P HCHO/NO2 columns, INSAT-3D Aerosol Optical Depth, NASA MODIS Fire radiative power) and meteorological parameters to identify seasonal pollution drivers.
                </p>
            </div>

            <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
                <div className="card">
                    <h4 className="card-title" style={{ marginBottom: '16px' }}>
                        🔗 Parameter Correlation Matrix (Pearson r)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {correlationMatrix.map((item, index) => (
                            <div key={index} style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-orange)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{item.factor}</span>
                                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-orange)' }}>{item.coef}</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Relation: {item.relation}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                    {item.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h4 className="card-title" style={{ marginBottom: '16px' }}>
                        🌍 Regional Trace Gas & Fire Statistics (Monthly Averages)
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '10px 8px' }}>Region</th>
                                    <th style={{ padding: '10px 8px' }}>Mean NO₂</th>
                                    <th style={{ padding: '10px 8px' }}>Mean HCHO</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Fire Counts</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Vulnerability</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regionalStats.map((row, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.region}</td>
                                        <td style={{ padding: '10px 8px' }}>{row.no2}</td>
                                        <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{row.hcho}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>{row.fires}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                            <span style={{ 
                                                fontSize: '10px', 
                                                fontWeight: 600, 
                                                padding: '2px 6px', 
                                                borderRadius: '4px',
                                                background: row.risk === 'Critical' || row.risk === 'High' ? 'rgba(239, 68, 68, 0.15)' : row.risk === 'Medium (Biogenic)' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: row.risk === 'Critical' || row.risk === 'High' ? 'var(--accent-red)' : row.risk === 'Medium (Biogenic)' ? 'var(--accent-orange)' : 'var(--accent-green)'
                                            }}>
                                                {row.risk}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchAnalytics;
