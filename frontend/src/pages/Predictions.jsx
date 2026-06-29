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
const cityPresets = [
    { name: 'Delhi', lat: 28.63, lon: 77.21 },
    { name: 'Mumbai', lat: 19.08, lon: 72.88 },
    { name: 'Kolkata', lat: 22.57, lon: 88.36 },
    { name: 'Chennai', lat: 13.08, lon: 80.27 },
    { name: 'Bengaluru', lat: 12.97, lon: 77.59 },
    { name: 'Lucknow', lat: 26.85, lon: 80.95 },
    { name: 'Patna', lat: 25.60, lon: 85.10 },
    { name: 'Jaipur', lat: 26.92, lon: 75.78 },
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
    const [prediction, setPrediction] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const runPrediction = async () => {
        setLoading(true);
        try {
            const result = await api.predictWithExplanation(latitude, longitude);
            setPrediction(result.prediction);
            setExplanation(result.explanation);
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
    return (_jsxs("div", { className: "page-container animate-fade-in", children: [_jsxs("div", { className: "grid-2", children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '20px' }, children: "\uD83E\uDD16 AI Prediction Input" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Quick Select City" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }, children: cityPresets.map((city) => (_jsx("button", { className: "btn btn-secondary", style: { padding: '6px 12px', fontSize: '12px' }, onClick: () => {
                                                setLatitude(city.lat);
                                                setLongitude(city.lon);
                                            }, children: city.name }, city.name))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Latitude" }), _jsx("input", { type: "number", className: "form-input", value: latitude, onChange: (e) => setLatitude(parseFloat(e.target.value)), step: "0.01" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Longitude" }), _jsx("input", { type: "number", className: "form-input", value: longitude, onChange: (e) => setLongitude(parseFloat(e.target.value)), step: "0.01" })] }), _jsx("button", { className: "btn btn-primary", style: { width: '100%', marginTop: '8px' }, onClick: runPrediction, disabled: loading, children: loading ? '⏳ Running Model...' : '🚀 Generate Prediction' })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-title", style: { marginBottom: '20px' }, children: "\uD83D\uDCCA Prediction Result" }), prediction ? (_jsxs("div", { children: [_jsxs("div", { style: {
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
                                }, children: ["Method: ", explanation.method, " | Top contributor: ", explanation.top_features[0]?.name.toUpperCase(), " (", (explanation.top_features[0]?.importance * 100).toFixed(0), "%)"] })] })] }))] }));
};
export default Predictions;
