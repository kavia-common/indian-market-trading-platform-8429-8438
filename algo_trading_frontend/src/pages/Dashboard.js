import React, { useEffect, useMemo, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { LoadingError } from '../components/ErrorDisplay';
import { useApiRequest } from '../hooks/useApiRequest';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApi } from '../services/api';
import { useSocket } from '../services/socket';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Main dashboard shows KPIs, PnL chart, recent alerts/events. */
  const { mockLatency } = useApi();
  const socket = useSocket();
  const [kpis, setKpis] = useState({ pnl: 0, todayOrders: 0, winRate: 0, exposure: 0 });
  const [pnlSeries, setPnlSeries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const { execute: loadDashboard, loading, error } = useApiRequest(async () => {
    await mockLatency(300);
    // Replace with real API endpoints
    return {
      pnl: 15230.5,
      todayOrders: 42,
      winRate: 62,
      exposure: 3.5,
      pnlSeries: Array.from({ length: 24 }).map((_, i) => ({
        t: `${i}:00`,
        pnl: Math.round((Math.sin(i / 3) * 1000 + 500 + i * 60) * 100) / 100
      })),
      alerts: [
        { id: 1, ts: new Date().toLocaleTimeString(), level: 'info', message: 'System healthy. All feeds live.' },
        { id: 2, ts: new Date().toLocaleTimeString(), level: 'warn', message: 'Exposure near limit for BANKNIFTY.' },
      ],
    };
  });

  useEffect(() => {
    // Load initial dashboard data
    loadDashboard().then(data => {
      setKpis({ 
        pnl: data.pnl, 
        todayOrders: data.todayOrders, 
        winRate: data.winRate, 
        exposure: data.exposure 
      });
      setPnlSeries(data.pnlSeries);
      setAlerts(data.alerts);
    }).catch(() => {
      // Error handled by useApiRequest
    });

    // Socket subscription for live updates
    const unsub = socket.subscribe('dash', (msg) => {
      if (msg?.type === 'alert') {
        setAlerts((prev) => [
          { 
            id: Date.now(), 
            ts: new Date().toLocaleTimeString(), 
            level: msg.level, 
            message: msg.text 
          }, 
          ...prev
        ].slice(0, 10));
      }
      if (msg?.type === 'pnl_tick') {
        setPnlSeries((prev) => [...prev.slice(-60), { t: msg.t, pnl: msg.pnl }]);
        setKpis(prev => ({ ...prev, pnl: msg.pnl }));
      }
    });

    return () => unsub();
  }, [loadDashboard, socket]);

  const kpiCards = useMemo(() => ([
    { label: 'Net PnL (₹)', value: kpis.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
    { label: 'Orders Today', value: kpis.todayOrders },
    { label: 'Win Rate (%)', value: kpis.winRate },
    { label: 'Exposure (x)', value: kpis.exposure },
  ]), [kpis]);

  if (loading || !pnlSeries.length) return <LoadingSpinner />;
  if (error) return <LoadingError error={error} onRetry={loadDashboard} />;
  
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="kpis">
        {kpiCards.map((k, i) => (
          <div key={i} className="kpi">
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
          </div>
        ))}
      </div>

      <WidgetCard title="Intraday PnL" subtitle="Real-time mark-to-market">
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={pnlSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="t" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Line type="monotone" dataKey="pnl" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </WidgetCard>

      <WidgetCard title="Recent Alerts & Events" actions={
        <button className="btn" onClick={() => setAlerts([])}>Clear</button>
      }>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {alerts.map(a => (
            <li key={a.id} style={{ marginBottom: 8 }}>
              <span className="badge">{a.ts}</span>{' '}
              <span className={`badge ${a.level === 'warn' ? 'warn' : a.level === 'error' ? 'err' : ''}`} style={{ marginRight: 6 }}>
                {a.level}
              </span>
              <span>{a.message}</span>
            </li>
          ))}
          {alerts.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No alerts.</div>}
        </ul>
      </WidgetCard>
    </div>
  );
}
