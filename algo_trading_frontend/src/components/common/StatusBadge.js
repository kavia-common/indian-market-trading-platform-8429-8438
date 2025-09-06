import React from 'react';

// PUBLIC_INTERFACE
export default function StatusBadge({ status }) {
  /** Small status badge with color coding. */
  const colorMap = {
    running: '#16a34a',
    stopped: '#6b7280',
    error: '#dc2626',
    pending: '#f59e0b',
  };
  const color = colorMap[status] || '#6b7280';
  return (
    <span style={{
      background: color,
      color: '#fff',
      borderRadius: 999,
      padding: '2px 8px',
      fontSize: 12,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}
