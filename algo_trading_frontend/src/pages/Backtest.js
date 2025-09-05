import React, { useMemo, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import { useApi } from '../services/api';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

// PUBLIC_INTERFACE
export default function Backtest() {
  /** Backtest runner: choose strategy, date range, params; visualize results. */
  const { rest, mockLatency } = useApi();
  const [config, setConfig] = useState({
    strategyId: 'strat-1',
    from: '2024-01-01',
    to: '2024-03-31',
    capital: 100000,
    costsBps: 5,
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const demoStrategies = useMemo(() => ([
    { id: 'strat-1', name: 'Trend Rider' },
    { id: 'strat-2', name: 'Mean Reverter' },
    { id: 'strat-3', name: 'VWAP Scalp' },
  ]), []);

  async function runBacktest(e) {
    e.preventDefault();
    setRunning(true);
    setResult(null);
    try {
      await mockLatency(800);
      // Replace with: await rest.post('/backtest/run', config)
      const series = Array.from({ length: 90 }).map((_, i) => ({
        day: i + 1,
        equity: Math.round((config.capital + Math.sin(i / 6) * 3000 + i * 250) * 100) / 100,
        ret: Math.round(((Math.random() - 0.45) * 2.5) * 100) / 100,
      }));
      const trades = Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        date: `2024-02-${(i % 28) + 1}`,
        symbol: ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS'][i % 4],
        side: i % 2 === 0 ? 'BUY' : 'SELL',
        qty: 50 + (i % 5) * 25,
        pnl: Math.round(((Math.random() - 0.45) * 2000) * 100) / 100,
      }));
      const totalPnl = Math.round((series.at(-1).equity - config.capital) * 100) / 100;
      const maxDD = -Math.round((Math.random() * 6 + 5) * 100) / 100;
      const winRate = 40 + Math.round(Math.random() * 40);
      setResult({
        series,
        metrics: {
          totalPnl, maxDD, winRate, trades: trades.length, sharpe: Math.round((Math.random() * 2 + 0.5) * 100) / 100
        },
        trades,
        dist: Array.from({ length: 10 }).map((_, i) => ({ bucket: `${-5 + i}%`, count: Math.floor(Math.random() * 10 + 3) })),
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <WidgetCard title="Configure Backtest" actions={<button className="btn" onClick={runBacktest} disabled={running}>{running ? 'Running...' : 'Run Backtest'}</button>}>
        <form className="grid cols-4" onSubmit={runBacktest} style={{ gap: 12 }}>
          <div>
            <label>Strategy</label>
            <select className="select" value={config.strategyId} onChange={e => setConfig({ ...config, strategyId: e.target.value })}>
              {demoStrategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label>From</label>
            <input type="date" className="input" value={config.from} onChange={e => setConfig({ ...config, from: e.target.value })}/>
          </div>
          <div>
            <label>To</label>
            <input type="date" className="input" value={config.to} onChange={e => setConfig({ ...config, to: e.target.value })}/>
          </div>
          <div>
            <label>Starting Capital (₹)</label>
            <input type="number" className="input" value={config.capital} onChange={e => setConfig({ ...config, capital: Number(e.target.value) })}/>
          </div>
          <div>
            <label>Transaction Costs (bps)</label>
            <input type="number" className="input" value={config.costsBps} onChange={e => setConfig({ ...config, costsBps: Number(e.target.value) })}/>
          </div>
        </form>
      </WidgetCard>

      {result && (
        <>
          <WidgetCard title="Equity Curve" subtitle="Backtest equity over time">
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={result.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="equity" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </WidgetCard>

          <div className="grid cols-3">
            <WidgetCard title="Key Metrics">
              <div className="kpis" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                {Object.entries(result.metrics).map(([k, v]) => (
                  <div key={k} className="kpi">
                    <div className="label">{k}</div>
                    <div className="value">{typeof v === 'number' ? v.toLocaleString() : v}</div>
                  </div>
                ))}
              </div>
            </WidgetCard>
            <WidgetCard title="Return Distribution">
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={result.dist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="bucket" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WidgetCard>
            <WidgetCard title="Summary">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Total Trades: {result.metrics.trades}</li>
                <li>Win Rate: {result.metrics.winRate}%</li>
                <li>Sharpe: {result.metrics.sharpe}</li>
                <li>Max Drawdown: {result.metrics.maxDD}%</li>
              </ul>
            </WidgetCard>
          </div>

          <WidgetCard title="Trades">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Date</th><th>Symbol</th><th>Side</th><th>Qty</th><th>PnL (₹)</th></tr>
              </thead>
              <tbody>
                {result.trades.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.date}</td>
                    <td>{t.symbol}</td>
                    <td><span className={`badge ${t.side === 'BUY' ? 'ok' : 'warn'}`}>{t.side}</span></td>
                    <td>{t.qty}</td>
                    <td style={{ color: t.pnl >= 0 ? '#10b981' : '#ef4444' }}>{t.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </WidgetCard>
        </>
      )}
    </div>
  );
}
