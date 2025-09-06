import React from 'react';

const cardStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};

// PUBLIC_INTERFACE
export default function Card({ title, actions, children }) {
  /** Simple card component with optional title and actions area. */
  return (
    <div style={cardStyle}>
      {(title || actions) && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          {title && <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>}
          <div style={{ marginLeft: 'auto' }}>{actions}</div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
