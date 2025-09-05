import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';
import './styles/layout.css';
import './styles/components.css';
import ErrorBoundary from './components/ErrorBoundary';
import config from './config';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import Backtest from './pages/Backtest';
import Monitor from './pages/Monitor';
import Orders from './pages/Orders';
import Risk from './pages/Risk';
import { ApiProvider } from './services/api';
import { SocketProvider } from './services/socket';

const menu = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/strategies', label: 'Strategies', icon: '🧠' },
  { to: '/backtest', label: 'Backtest', icon: '📈' },
  { to: '/monitor', label: 'Monitor', icon: '⏱️' },
  { to: '/orders', label: 'Orders', icon: '🧾' },
  { to: '/risk', label: 'Risk & Compliance', icon: '🛡️' },
];

/**
 * AppShell for overall layout including Navbar and Sidebar
 */
function AppShell({ children, onToggleTheme, theme }) {
  const location = useLocation();
  
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="brand">
          <span className="logo">MN</span>
          <span className="brand-name">Market Navigator</span>
        </div>
        <div className="nav-actions">
          <span className="route-label">{menu.find(m => m.to === location.pathname)?.label || ''}</span>
          <button className="btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>
      <aside className="sidebar">
        {menu.map(item => (
          <Link key={item.to} to={item.to} className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}>
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
}

/**
 * Main application routes and theme handling
 */
function AppContent() {
  const [theme, setTheme] = useState(config.defaultTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <Router>
      <AppShell onToggleTheme={toggleTheme} theme={theme}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/risk" element={<Risk />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </AppShell>
    </Router>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <ErrorBoundary>
      <ApiProvider baseUrl={config.apiBase}>
        <SocketProvider url={config.wsUrl} enabled={config.enableWebsocket}>
          <AppContent />
        </SocketProvider>
      </ApiProvider>
    </ErrorBoundary>
  );
}

export default App;
