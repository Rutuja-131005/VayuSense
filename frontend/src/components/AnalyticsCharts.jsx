import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AnalyticsCharts Component
 * ===========================
 * Chart.js powered analytics for pollutant distributions,
 * time series, and AQI comparisons.
 */
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend, } from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend);
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#94a3b8', font: { size: 11 } },
        },
    },
    scales: {
        x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
        y: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
    },
};
/* ── Pollutant Distribution Bar Chart ─────────────────────────── */
export const PollutantBarChart = ({ data }) => {
    const pollutantData = data || {
        'PM2.5': 87.3,
        'PM10': 156.2,
        'NO₂': 42.8,
        'SO₂': 18.5,
        'CO': 1.8,
        'O₃': 64.2,
    };
    const chartData = {
        labels: Object.keys(pollutantData),
        datasets: [
            {
                label: 'Concentration',
                data: Object.values(pollutantData),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(249, 115, 22, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(20, 184, 166, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                ],
                borderColor: [
                    '#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#14b8a6', '#22c55e',
                ],
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Pollutant Distribution" }), _jsx("div", { className: "card-subtitle", children: "Average concentrations (\u00B5g/m\u00B3)" })] }) }), _jsx("div", { className: "chart-container", children: _jsx(Bar, { data: chartData, options: chartDefaults }) })] }));
};
/* ── AQI Time Series Line Chart ───────────────────────────────── */
export const AQITimeSeriesChart = () => {
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Observed AQI',
                data: labels.map(() => Math.floor(80 + Math.random() * 200)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
            },
            {
                label: 'Predicted AQI',
                data: labels.map(() => Math.floor(90 + Math.random() * 180)),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                borderDash: [5, 5],
            },
        ],
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "AQI Trend \u2014 30 Days" }), _jsx("div", { className: "card-subtitle", children: "Observed vs AI-predicted AQI" })] }) }), _jsx("div", { className: "chart-container", children: _jsx(Line, { data: chartData, options: chartDefaults }) })] }));
};
/* ── AQI Category Doughnut ────────────────────────────────────── */
export const AQICategoryDoughnut = () => {
    const chartData = {
        labels: ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
        datasets: [
            {
                data: [12, 18, 25, 20, 15, 10],
                backgroundColor: [
                    '#009966', '#58B453', '#FFDE33', '#FF9933', '#CC0033', '#660099',
                ],
                borderWidth: 0,
                spacing: 2,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 },
            },
        },
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "AQI Category Distribution" }), _jsx("div", { className: "card-subtitle", children: "Station-wise breakdown" })] }) }), _jsx("div", { className: "chart-container", children: _jsx(Doughnut, { data: chartData, options: options }) })] }));
};
/* ── Pollutant Radar Chart ────────────────────────────────────── */
export const PollutantRadar = () => {
    const chartData = {
        labels: ['PM2.5', 'PM10', 'NO₂', 'SO₂', 'CO', 'O₃'],
        datasets: [
            {
                label: 'Delhi',
                data: [280, 350, 85, 45, 3.2, 55],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                pointBackgroundColor: '#ef4444',
            },
            {
                label: 'Bengaluru',
                data: [65, 90, 35, 15, 0.8, 40],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                pointBackgroundColor: '#22c55e',
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { size: 11 } },
            },
        },
        scales: {
            r: {
                ticks: { color: '#64748b', backdropColor: 'transparent' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 11 } },
            },
        },
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "City Comparison \u2014 Radar" }), _jsx("div", { className: "card-subtitle", children: "Multi-pollutant analysis" })] }) }), _jsx("div", { className: "chart-container", children: _jsx(Radar, { data: chartData, options: options }) })] }));
};
