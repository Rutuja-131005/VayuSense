/**
 * StatCard Component
 * ====================
 * Reusable statistic display card with accent colour strip.
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  color?: 'blue' | 'cyan' | 'orange' | 'red' | 'green' | 'purple';
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  color = 'blue',
  icon,
}) => {
  return (
    <div className={`stat-card ${color}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {trend && <div className="stat-trend">{trend}</div>}
        </div>
        {icon && (
          <span style={{ fontSize: '28px', opacity: 0.6 }}>{icon}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
