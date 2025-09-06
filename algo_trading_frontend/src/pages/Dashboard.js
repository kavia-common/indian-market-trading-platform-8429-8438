import React from 'react';
import KPI from '../components/common/KPI';
import Card from '../components/common/Card';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { RiskAPI, StrategyAPI } from '../services/api';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Overview page: KPIs, quick actions, summary of strategies and risk/compliance status. */
  const { data: risk } = useApi(() => RiskAPI.getStatus().catch(() => ({ totalRisk: 0, breaches: 0 })), []);
  const { data: strategies } = useApi(() => StrategyAPI.list().catch(() => ([])), []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <KPI label="PnL (Today)" value="₹ 0.00" change={0} />
        <KPI label="Open Positions" value="0" />
        <KPI label="Orders (Today)" value="0" />
        <KPI label="Risk Exposure" value={risk?.totalRisk ?? 0} />
      </div>

      <Card title="Quick Actions" actions={<Link to="/strategies">Create Strategy →</Link>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/backtest">Run Backtest</Link>
          <Link to="/monitor">Open Monitor</Link>
          <Link to="/orders">View Orders</Link>
          <Link to="/risk">Risk & Compliance</Link>
        </div>
      </Card>

      <Card title="Recent Strategies">
        {!strategies?.length ? (
          <div>No strategies yet. <Link to="/strategies">Create one</Link>.</div>
        ) : (
          <ul>
            {strategies.map((s) => (
              <li key={s.id || s.name}>
                <strong>{s.name}</strong> — Type: {s.type || 'custom'} — Status: {s.status || 'draft'}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
