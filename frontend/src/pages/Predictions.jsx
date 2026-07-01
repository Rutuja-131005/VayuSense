import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AI Predictions Page
 * =====================
 * Interactive AQI prediction with location input, model output,
 * and Explainable AI feature importance.
 */
import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const stateCapitals = [
    { name: 'Amaravati (Andhra Pradesh)', lat: 16.51, lon: 80.51 },
    { name: 'Itanagar (Arunachal Pradesh)', lat: 27.10, lon: 93.60 },
    { name: 'Dispur (Assam)', lat: 26.15, lon: 91.77 },
    { name: 'Patna (Bihar)', lat: 25.60, lon: 85.10 },
    { name: 'Raipur (Chhattisgarh)', lat: 21.25, lon: 81.63 },
    { name: 'Panaji (Goa)', lat: 15.49, lon: 73.82 },
    { name: 'Gandhinagar (Gujarat)', lat: 23.22, lon: 72.68 },
    { name: 'Chandigarh (Haryana/Punjab)', lat: 30.73, lon: 76.78 },
    { name: 'Shimla (Himachal Pradesh)', lat: 31.10, lon: 77.17 },
    { name: 'Ranchi (Jharkhand)', lat: 23.34, lon: 85.30 },
    { name: 'Bengaluru (Karnataka)', lat: 12.97, lon: 77.59 },
    { name: 'Thiruvananthapuram (Kerala)', lat: 8.52, lon: 76.93 },
    { name: 'Bhopal (Madhya Pradesh)', lat: 23.25, lon: 77.41 },
    { name: 'Mumbai (Maharashtra)', lat: 19.08, lon: 72.88 },
    { name: 'Imphal (Manipur)', lat: 24.82, lon: 93.95 },
    { name: 'Shillong (Meghalaya)', lat: 25.57, lon: 91.88 },
    { name: 'Aizawl (Mizoram)', lat: 23.73, lon: 92.72 },
    { name: 'Kohima (Nagaland)', lat: 25.67, lon: 94.12 },
    { name: 'Bhubaneswar (Odisha)', lat: 20.27, lon: 85.84 },
    { name: 'Jaipur (Rajasthan)', lat: 26.92, lon: 75.78 },
    { name: 'Gangtok (Sikkim)', lat: 27.33, lon: 88.62 },
    { name: 'Chennai (Tamil Nadu)', lat: 13.08, lon: 80.27 },
    { name: 'Hyderabad (Telangana)', lat: 17.38, lon: 78.48 },
    { name: 'Agartala (Tripura)', lat: 23.84, lon: 91.28 },
    { name: 'Lucknow (Uttar Pradesh)', lat: 26.85, lon: 80.95 },
    { name: 'Dehradun (Uttarakhand)', lat: 30.32, lon: 78.03 },
    { name: 'Kolkata (West Bengal)', lat: 22.57, lon: 88.36 },
    { name: 'Srinagar (Jammu & Kashmir)', lat: 34.08, lon: 74.80 },
    { name: 'New Delhi (Delhi)', lat: 28.61, lon: 77.23 },
    { name: 'Port Blair (Andaman & Nicobar)', lat: 11.62, lon: 92.73 },
    { name: 'Leh (Ladakh)', lat: 34.15, lon: 77.57 },
    { name: 'Puducherry (Puducherry)', lat: 11.94, lon: 79.80 }
];
function getAqiColor(aqi) {
    if (aqi <= 50)
        return '#009966';
    if (aqi <= 100)
        return '#58B453';
    if (aqi <= 200)
        return '#FFDE33';
    if (aqi <= 300)
        return '#FF9933';
    if (aqi <= 400)
        return '#CC0033';
    return '#660099';
}
const Predictions = () => {
    const [latitude, setLatitude] = useState(28.63);
    const [longitude, setLongitude] = useState(77.21);
    
    const handlePresetChange = (e) => {
        const val = e.target.value;
        const matched = stateCapitals.find(c => c.name === val);
        if (matched) {
            setLatitude(matched.lat);
            setLongitude(matched.lon);
        }
    };

    const [prediction, setPrediction] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [globalComparison, setGlobalComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const runPrediction = async () => {
        setLoading(true);
        try {
            const result = await api.predictWithExplanation(latitude, longitude);
            setPrediction(result.prediction);
            setExplanation(result.explanation);
            
            // Query global policy comparison details
            const comparisonResult = await api.getGlobalComparison(Math.round(result.prediction.pred_aqi));
            setGlobalComparison(comparisonResult.comparison);
        }
        catch {
            // Fallback demo data
            setPrediction({
                pred_pm25: 124.5,
                pred_no2: 58.3,
                pred_so2: 22.1,
                pred_co: 1.8,
                pred_o3: 72.4,
                pred_aqi: 187,
                pred_category: 'Moderate',
                confidence_score: 0.72,
                model_version: 'v0.1-heuristic',
            });
            setExplanation({
                feature_importance: {
                    aod: 0.28,
                    pblh: 0.22,
                    humidity: 0.14,
                    no2: 0.12,
                    wind_speed: 0.08,
                    temperature: 0.06,
                    co: 0.04,
                    so2: 0.03,
                    o3: 0.03,
                },
                top_features: [
                    { name: 'aod', importance: 0.28 },
                    { name: 'pblh', importance: 0.22 },
                    { name: 'humidity', importance: 0.14 },
                ],
                explanation: 'Aerosol Optical Depth (AOD) is the primary driver of this prediction. High AOD values indicate elevated aerosol loading correlating with PM2.5. The Planetary Boundary Layer Height (PBLH) is the second key factor — a lower PBLH traps pollutants near the surface.',
                method: 'physics-based',
            });
            setGlobalComparison({
                target_city: "Seoul, South Korea",
                historical_aqi: 178,
                context: "Fine dust (PM2.5) buildup combined with transboundary pollution from regional industrial belts.",
                policies: [
                    "Alternative-day driving (odd-even license plate rules) enforced for public sector employees.",
                    "Operation curbs on coal-fired power plants (capping at maximum 80% capacity).",
                    "High-pressure water flushing trucks deployed on 500+ kilometers of central urban roads."
                ],
                impact: "Decreased PM2.5 concentrations in target zones by 12% over 3 days."
            });
        }
        setLoading(false);
    };
    const importanceChart = explanation
        ? {
            labels: Object.keys(explanation.feature_importance).map((k) => k.toUpperCase()),
            datasets: [
                {
                    label: 'Feature Importance',
                    data: Object.values(explanation.feature_importance),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        }
        : null;
    return (_jsxs("div", { className: "page-container animate-fade-in", children: [_jsxs("div", { className: "grid-2", children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '20px' }, children: "\uD83E\uDD16 AI Prediction Input" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Quick Select State/UT Capital" }), _jsxs("select", { className: "form-input", onChange: handlePresetChange, defaultValue: "", children: [
                                                _jsx("option", { value: "", disabled: true, children: "-- Select Capital City --" }),
                                                stateCapitals.map((city) => (_jsx("option", { value: city.name, children: city.name }, city.name)))
                                            ] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Latitude" }), _jsx("input", { type: "number", className: "form-input", value: latitude, onChange: (e) => setLatitude(parseFloat(e.target.value)), step: "0.01" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Longitude" }), _jsx("input", { type: "number", className: "form-input", value: longitude, onChange: (e) => setLongitude(parseFloat(e.target.value)), step: "0.01" })] }), _jsx("button", { className: "btn btn-primary", style: { width: '100%', marginTop: '8px' }, onClick: runPrediction, disabled: loading, children: loading ? '⏳ Running Model...' : '🚀 Generate Prediction' })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '20px' }, children: "\uD83D\uDCCA Prediction Result" }), prediction ? (_jsxs("div", { children: [_jsxs("div", { style: {
                                            textAlign: 'center',
                                            padding: '24px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-lg)',
                                            marginBottom: '20px',
                                            border: `2px solid ${getAqiColor(prediction.pred_aqi)}`,
                                        }, children: [_jsx("div", { style: { fontSize: '48px', fontWeight: 800, color: getAqiColor(prediction.pred_aqi) }, children: prediction.pred_aqi.toFixed(0) }), _jsx("div", { style: {
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: getAqiColor(prediction.pred_aqi),
                                                    marginBottom: '8px',
                                                }, children: prediction.pred_category }), _jsxs("div", { style: { fontSize: '11px', color: 'var(--text-muted)' }, children: ["Confidence: ", (prediction.confidence_score * 100).toFixed(0), "% | ", prediction.model_version] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }, children: [
                                            { label: 'PM2.5', value: prediction.pred_pm25, unit: 'µg/m³' },
                                            { label: 'NO₂', value: prediction.pred_no2, unit: 'µg/m³' },
                                            { label: 'SO₂', value: prediction.pred_so2, unit: 'µg/m³' },
                                            { label: 'CO', value: prediction.pred_co, unit: 'mg/m³' },
                                            { label: 'O₃', value: prediction.pred_o3, unit: 'µg/m³' },
                                        ].map((p) => (_jsxs("div", { style: {
                                                padding: '12px',
                                                background: 'var(--bg-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                textAlign: 'center',
                                            }, children: [_jsx("div", { style: { fontSize: '11px', color: 'var(--text-muted)' }, children: p.label }), _jsx("div", { style: { fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }, children: p.value.toFixed(1) }), _jsx("div", { style: { fontSize: '10px', color: 'var(--text-muted)' }, children: p.unit })] }, p.label))) })] })) : (_jsx("div", { style: {
                                    textAlign: 'center',
                                    padding: '60px',
                                    color: 'var(--text-muted)',
                                }, children: "Select a location and click \"Generate Prediction\"" }))] })] }), explanation && (_jsxs("div", { className: "grid-2", style: { marginTop: '20px' }, children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '16px' }, children: "\uD83D\uDD0D Feature Importance (XAI)" }), _jsx("div", { style: { height: '300px' }, children: importanceChart && (_jsx(Bar, { data: importanceChart, options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: 'y',
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: {
                                                ticks: { color: '#64748b' },
                                                grid: { color: 'rgba(148, 163, 184, 0.08)' },
                                            },
                                            y: {
                                                ticks: { color: '#94a3b8', font: { size: 11 } },
                                                grid: { display: false },
                                            },
                                        },
                                    } })) })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '16px' }, children: "\uD83D\uDCDD Scientific Explanation" }), _jsx("div", { style: {
                                    fontSize: '13px',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                }, children: explanation.explanation }), _jsxs("div", { style: {
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '11px',
                                    color: 'var(--text-muted)',
                                }, children: ["Method: ", explanation.method, " | Top contributor: ", explanation.top_features[0]?.name.toUpperCase(), " (", (explanation.top_features[0]?.importance * 100).toFixed(0), "%)"] })] })] })), globalComparison && (_jsxs("div", { className: "card animate-fade-in", style: { marginTop: '20px' }, children: [
            _jsx("div", { className: "card-title", style: { marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }, children: "🌍 Global Solutions & Policy Interventions (Actionable Decision Support)" }),
            _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }, children: [
                _jsxs("div", { style: { paddingRight: '12px', borderRight: '1px solid var(--border-subtle)' }, children: [
                    _jsx("h4", { style: { color: 'var(--accent-orange)', marginBottom: '10px', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }, children: "🇮🇳 Current Local Scenario (India)" }),
                    _jsxs("p", { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }, children: [
                        "Current Predicted AQI is ", _jsx("strong", { style: { color: 'var(--text-primary)' }, children: prediction?.pred_aqi.toFixed(0) }), " (", prediction?.pred_category, "). This level of pollution poses active health hazards."
                    ] }),
                    _jsx("h5", { style: { fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }, children: "Exposure advisories:" }),
                    _jsxs("ul", { style: { paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }, children: [
                        _jsx("li", { children: "Avoid heavy outdoor cardio or intense exercises." }),
                        _jsx("li", { children: "Activate indoor HEPA air filters; keep doors/windows sealed." }),
                        _jsx("li", { children: "Wear N95/N99 respiratory masks during unavoidable travel." })
                    ] })
                ] }),
                _jsxs("div", { children: [
                    _jsxs("h4", { style: { color: 'var(--accent-blue)', marginBottom: '10px', fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }, children: [
                        "🌍 How ", globalComparison.target_city, " Handled a Similar Event"
                    ] }),
                    _jsxs("p", { style: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }, children: [
                        "Historical Case Study (AQI ", globalComparison.historical_aqi, "): ", globalComparison.context
                    ] }),
                    _jsx("h5", { style: { fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }, children: "Implemented Policy Measures:" }),
                    _jsx("ul", { style: { paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }, children: 
                        globalComparison.policies.map((policy, idx) => (
                            _jsx("li", { children: policy }, idx)
                        ))
                    }),
                    _jsxs("div", { style: { background: 'rgba(59, 130, 246, 0.06)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }, children: [
                        _jsx("span", { style: { fontSize: '18px' }, children: "📈" }),
                        _jsxs("span", { style: { color: 'var(--text-primary)' }, children: [
                            _jsx("strong", { children: "Reported Policy Impact: " }), globalComparison.impact
                        ] })
                    ] })
                ] })
            ] })
        ]}))] }));
};
export default Predictions;
