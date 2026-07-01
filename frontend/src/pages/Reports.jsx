import React, { useState } from 'react';

const Reports = () => {
    const [selectedState, setSelectedState] = useState('Delhi');
    const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const handleGenerateReport = () => {
        setLoading(true);
        setTimeout(() => {
            setReportData({
                meta: {
                    state: selectedState,
                    period: selectedPeriod,
                    generatedAt: new Date().toLocaleString(),
                    status: 'Official Release Draft'
                },
                summary: `This report summarizes satellite-derived surface air quality indices and formaldehyde (HCHO) hotspot observations over ${selectedState} for the selected period. Thermal fire anomalies detected via MODIS have been cross-correlated with biogenic and industrial emissions to aid administrative action.`,
                statistics: [
                    { metric: 'Average Surface AQI', value: selectedState === 'Delhi' ? '324 (Severe)' : '142 (Moderate)' },
                    { metric: 'Active HCHO Hotspot Count', value: selectedState === 'Delhi' ? '12 Clusters' : '2 Clusters' },
                    { metric: 'Total Active Fire Detections', value: selectedState === 'Delhi' ? '382 Events' : '48 Events' },
                    { metric: 'Top Emission Contributor', value: selectedState === 'Delhi' ? 'Biomass Burning (Stubble)' : 'Vehicular Emissions' }
                ],
                directives: [
                    'Implement Stage-III Graded Response Action Plan (GRAP) immediately.',
                    'Order municipal mist cannon deployment along critical traffic corridors.',
                    'Restrict coal usage in commercial eateries and industrial sectors.'
                ]
            });
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
                <div className="card">
                    <h3 className="card-title" style={{ marginBottom: '16px' }}>
                        📄 Environmental Reporting Portal
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                        Configure the parameters below to generate a standardized, executive report summarizing satellite intelligence and ground truth compliance for local government bodies.
                    </p>

                    <div className="form-group">
                        <label className="form-label">Target State/Region</label>
                        <select className="form-input" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                            <option value="Delhi">Delhi NCT</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reporting Period</label>
                        <select className="form-input" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                            <option value="Daily">Daily Summary</option>
                            <option value="Weekly">Weekly Digest</option>
                            <option value="Monthly">Monthly Executive Review</option>
                        </select>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        onClick={handleGenerateReport} 
                        disabled={loading}
                        style={{ width: '100%', marginTop: '10px' }}
                    >
                        {loading ? '⏳ Generating Report Data...' : '📊 Generate Compliance Report'}
                    </button>
                </div>

                <div className="card" style={{ minHeight: '380px' }}>
                    <h4 className="card-title" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📋 Report Preview</span>
                        {reportData && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-orange)', background: 'rgba(255,138,55,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                {reportData.meta.status}
                            </span>
                        )}
                    </h4>

                    {reportData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Region: {reportData.meta.state} | Period: {reportData.meta.period} | Compiled: {reportData.meta.generatedAt}
                            </div>
                            
                            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                                <strong>Executive Summary:</strong><br />
                                {reportData.summary}
                            </div>

                            <div>
                                <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>Key Observations</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    {reportData.statistics.map((s, idx) => (
                                        <div key={idx} style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.metric}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>Recommended Executive Directives</h5>
                                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
                                    {reportData.directives.map((d, idx) => (
                                        <li key={idx}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Configure inputs and click "Generate Compliance Report" to preview the executive summary.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
