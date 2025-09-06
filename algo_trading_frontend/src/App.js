import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StrategyBuilder from './pages/StrategyBuilder';
import Backtest from './pages/Backtest';
import Monitor from './pages/Monitor';
import Orders from './pages/Orders';
import RiskCompliance from './pages/RiskCompliance';
import Navbar from './components/layout/Navbar';
import Container from './components/layout/Container';
import ThemeToggle from './components/common/ThemeToggle';

// PUBLIC_INTERFACE
function App() {
  /** The main application entry that renders the Market Navigator UI with routing.
   * Routes:
   *  - /dashboard: Overview with KPIs and quick links
   *  - /strategies: Strategy creation & management
   *  - /backtest: Backtesting runner and results
   *  - /monitor: Real-time monitoring with WebSocket updates
   *  - /orders: Order execution tracking
   *  - /risk: Risk and compliance visualization
   */
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <ThemeToggle />
        <Container>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/strategies" element={<StrategyBuilder />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/risk" element={<RiskCompliance />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
