import React from 'react';

// PUBLIC_INTERFACE
export default function KPI({ label, value, change }) {
  /** Renders a KPI metric with optional change indicator. */
  const changeColor = change > 0 ? '#16a34a' : change < 0 ? '#dc2626' : 'inherit';
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      padding: 12,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {typeof change !== 'undefined' && (
        <div style={{ fontSize: 12, color: changeColor }}>{change > 0 ? '▲' : change < 0 ? '▼' : '•'} {change}%</div>
      )}
    </div>
  );
}
