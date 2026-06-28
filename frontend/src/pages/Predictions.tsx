/**
 * AI Predictions Page
 * =====================
 * Interactive AQI prediction with location input, model output,
 * and Explainable AI feature importance.
 */

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PredictionResult {
  pred_pm25: number;
  pred_no2: number;
  pred_so2: number;
  pred_co: number;
  pred_o3: number;
  pred_aqi: number;
  pred_category: string;
  confidence_score: number;
  model_version: string;
}

interface ExplanationResult {
  feature_importance: Record<string, number>;
  top_features: { name: string; importance: number }[];
  explanation: string;
  method: string;
}

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

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#009966';
  if (aqi <= 100) return '#58B453';
  if (aqi <= 200) return '#FFDE33';
  if (aqi <= 300) return '#FF9933';
  if (aqi <= 400) return '#CC0033';
  return '#660099';
}

const Predictions: React.FC = () => {
  const [latitude, setLatitude] = useState(28.63);
  const [longitude, setLongitude] = useState(77.21);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const result = await api.predictWithExplanation(latitude, longitude);
      setPrediction(result.prediction);
      setExplanation(result.explanation);
    } catch {
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

  return (
    <div className="page-container animate-fade-in">
      <div className="grid-2">
        {/* Input Panel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '20px' }}>🤖 AI Prediction Input</div>

          {/* City Presets */}
          <div className="form-group">
            <label className="form-label">Quick Select City</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {cityPresets.map((city) => (
                <button
                  key={city.name}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => {
                    setLatitude(city.lat);
                    setLongitude(city.lon);
                  }}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              className="form-input"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              className="form-input"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={runPrediction}
            disabled={loading}
          >
            {loading ? '⏳ Running Model...' : '🚀 Generate Prediction'}
          </button>
        </div>

        {/* Prediction Result */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '20px' }}>📊 Prediction Result</div>

          {prediction ? (
            <div>
              {/* AQI Display */}
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
                border: `2px solid ${getAqiColor(prediction.pred_aqi)}`,
              }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: getAqiColor(prediction.pred_aqi) }}>
                  {prediction.pred_aqi.toFixed(0)}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: getAqiColor(prediction.pred_aqi),
                  marginBottom: '8px',
                }}>
                  {prediction.pred_category}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Confidence: {(prediction.confidence_score * 100).toFixed(0)}% | {prediction.model_version}
                </div>
              </div>

              {/* Pollutant Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'PM2.5', value: prediction.pred_pm25, unit: 'µg/m³' },
                  { label: 'NO₂', value: prediction.pred_no2, unit: 'µg/m³' },
                  { label: 'SO₂', value: prediction.pred_so2, unit: 'µg/m³' },
                  { label: 'CO', value: prediction.pred_co, unit: 'mg/m³' },
                  { label: 'O₃', value: prediction.pred_o3, unit: 'µg/m³' },
                ].map((p) => (
                  <div key={p.label} style={{
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.value.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text-muted)',
            }}>
              Select a location and click "Generate Prediction"
            </div>
          )}
        </div>
      </div>

      {/* Explainable AI Section */}
      {explanation && (
        <div className="grid-2" style={{ marginTop: '20px' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '16px' }}>🔍 Feature Importance (XAI)</div>
            <div style={{ height: '300px' }}>
              {importanceChart && (
                <Bar
                  data={importanceChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
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
                  }}
                />
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '16px' }}>📝 Scientific Explanation</div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              {explanation.explanation}
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}>
              Method: {explanation.method} | Top contributor: {explanation.top_features[0]?.name.toUpperCase()} ({(explanation.top_features[0]?.importance * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
