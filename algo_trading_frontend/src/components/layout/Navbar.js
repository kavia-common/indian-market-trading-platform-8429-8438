import React from 'react';
import { NavLink } from 'react-router-dom';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)',
  padding: '12px 20px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const linkStyle = ({ isActive }) => ({
  color: 'var(--text-primary)',
  textDecoration: 'none',
  padding: '6px 10px',
  borderRadius: 8,
  background: isActive ? 'rgba(97,218,251,0.15)' : 'transparent',
});

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top navigation bar for major app routes. */
  return (
    <nav style={navStyle} aria-label="Main navigation">
      <div style={{ fontWeight: 800, fontSize: 18 }}>Market Navigator</div>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/strategies" style={linkStyle}>Strategies</NavLink>
      <NavLink to="/backtest" style={linkStyle}>Backtest</NavLink>
      <NavLink to="/monitor" style={linkStyle}>Monitor</NavLink>
      <NavLink to="/orders" style={linkStyle}>Orders</NavLink>
      <NavLink to="/risk" style={linkStyle}>Risk & Compliance</NavLink>
      <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>
        API: {process.env.REACT_APP_API_BASE || 'not set'}
      </div>
    </nav>
  );
}
