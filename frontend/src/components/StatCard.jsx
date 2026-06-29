import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * StatCard Component
 * ====================
 * Reusable statistic display card with accent colour strip.
 */
import React from 'react';
const StatCard = ({ label, value, trend, color = 'blue', icon, }) => {
    return (_jsx("div", { className: `stat-card ${color}`, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("div", { className: "stat-label", children: label }), _jsx("div", { className: "stat-value", children: value }), trend && _jsx("div", { className: "stat-trend", children: trend })] }), icon && (_jsx("span", { style: { fontSize: '28px', opacity: 0.6 }, children: icon }))] }) }));
};
export default StatCard;
