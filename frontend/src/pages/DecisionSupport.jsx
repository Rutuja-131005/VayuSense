import React, { useState } from 'react';

const grapMeasures = {
    grap1: {
        title: 'Stage I — Moderate to Poor (AQI 101–200)',
        trigger: 'AQI between 101 and 200',
        actions: [
            { sector: 'Traffic & Transport', measure: 'Strict action on visibly polluting vehicles; enforce PUC norms.' },
            { sector: 'Industry & Energy', measure: 'Ensure strict compliance with emission standards in industrial zones.' },
            { sector: 'Public Health', measure: 'Issue advisories for citizens, especially children & elderly, to limit heavy outdoor exercise.' },
            { sector: 'Municipal Action', measure: 'Mechanized sweeping and water sprinkling on identified roads.' }
        ]
    },
    grap2: {
        title: 'Stage II — Very Poor (AQI 201–300)',
        trigger: 'AQI between 201 and 300',
        actions: [
            { sector: 'Traffic & Transport', measure: 'Enhance parking fees to discourage private vehicular travel; increase public transit frequency.' },
            { sector: 'Industry & Energy', measure: 'Ban coal/firewood use in hotels, restaurants, and open eateries.' },
            { sector: 'Public Health', measure: 'Recommend HEPA air purifiers indoors and N95 masks for unavoidable outdoor activities.' },
            { sector: 'Municipal Action', measure: 'Daily water sprinkling on high-dust corridors; enforce strict construction site dust controls.' }
        ]
    },
    grap3: {
        title: 'Stage III — Severe (AQI 301–400)',
        trigger: 'AQI between 301 and 400',
        actions: [
            { sector: 'Traffic & Transport', measure: 'Enforce alternate-day driving (Odd-Even rules) for non-electric/LPG private vehicles.' },
            { sector: 'Industry & Energy', measure: 'Shut down brick kilns, hot mix plants, and stone crushers not operating on clean fuels.' },
            { sector: 'Public Health', measure: 'Advise schools to transition to online learning for primary classes.' },
            { sector: 'Municipal Action', measure: 'Frequent high-pressure water mist spraying on major roads.' }
        ]
    },
    grap4: {
        title: 'Stage IV — Severe + / Emergency (AQI > 400)',
        trigger: 'AQI exceeds 400',
        actions: [
            { sector: 'Traffic & Transport', measure: 'Total ban on non-essential diesel truck entry into the metropolitan region.' },
            { sector: 'Industry & Energy', measure: 'Order complete closure of heavy manufacturing and coal-burning thermal units.' },
            { sector: 'Public Health', measure: 'Enforce complete school closures; shift all educational and government work to remote.' },
            { sector: 'Municipal Action', measure: 'Trigger emergency chemical fogging/suppression and mobilize regional disaster response.' }
        ]
    }
};

const DecisionSupport = () => {
    const [selectedStage, setSelectedStage] = useState('grap2');
    const stage = grapMeasures[selectedStage];

    return (
        <div className="page-container animate-fade-in">
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>
                    💡 Environmental Decision Support Engine (EDSS)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                    Select a target AQI prediction range to view the recommended Graded Response Action Plan (GRAP) actions. This module helps municipal authorities and disaster management teams instantly deploy targeted, legally mandated interventions.
                </p>

                <div className="form-group" style={{ maxWidth: '400px' }}>
                    <label className="form-label">Select Action Stage (AQI Threshold)</label>
                    <select 
                        className="form-input" 
                        value={selectedStage} 
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        <option value="grap1">Stage I — Moderate to Poor (AQI 101–200)</option>
                        <option value="grap2">Stage II — Very Poor (AQI 201–300)</option>
                        <option value="grap3">Stage III — Severe (AQI 301–400)</option>
                        <option value="grap4">Stage IV — Severe + / Emergency (AQI &gt; 400)</option>
                    </select>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                    <h4 style={{ color: 'var(--accent-orange)', fontSize: '16px', fontWeight: 600 }}>
                        📋 Implemented Graded Response Protocol
                    </h4>
                    <span style={{ fontSize: '12px', background: 'rgba(255,138,55,0.1)', color: 'var(--accent-orange)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                        {stage.trigger}
                    </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
                    {stage.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {stage.actions.map((act, index) => (
                        <div key={index} style={{ background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-blue)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                📌 {act.sector}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {act.measure}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DecisionSupport;
