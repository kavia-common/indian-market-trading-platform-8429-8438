import React from 'react';

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="error-message" style={{
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: 'var(--text-primary)',
      margin: '8px 0'
    }}>
      <div style={{ marginBottom: '8px' }}>
        {error?.message || 'An unexpected error occurred'}
      </div>
      {onRetry && (
        <button className="btn" onClick={onRetry} style={{ fontSize: '14px' }}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function LoadingError({ error, onRetry }) {
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '16px' }}>😕</div>
      <h3 style={{ margin: '0 0 8px' }}>Failed to load data</h3>
      <p style={{ 
        color: 'var(--text-secondary)',
        margin: '0 0 16px'
      }}>
        {error?.message || 'An unexpected error occurred while loading the data'}
      </p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
