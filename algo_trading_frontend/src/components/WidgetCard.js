import React from 'react';

export default function WidgetCard({ title, subtitle, actions, children }) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="section-title">{title}</div>
          {subtitle && <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{subtitle}</div>}
        </div>
        <div className="row">{actions}</div>
      </div>
      {children}
    </div>
  );
}
