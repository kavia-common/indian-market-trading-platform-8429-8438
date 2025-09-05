import React, { useEffect, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import { useSocket } from '../services/socket';
import { useApi } from '../services/api';
import { showNotification } from '../utils/notification';

// PUBLIC_INTERFACE
export default function Monitor() {
  /** Real-time monitoring: market data, positions, strategy states. */
  const socket = useSocket();
  const { mockLatency } = useApi();

  const [ticks, setTicks] = useState([]);
  const [positions, setPositions] = useState([]);
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await mockLatency(200);
      if (!mounted) return;
      setPositions([
        { symbol: 'NIFTY', qty: 150, avg: 22500, ltp: 22530 },
        { symbol: 'BANKNIFTY', qty: -75, avg: 48200, ltp: 48150 },
      ]);
      setStrategies([
        { id: 'strat-1', name: 'Trend Rider', status: 'RUNNING', lastAction: 'BUY NIFTY 50', heartbeat: new Date().toLocaleTimeString() },
        { id: 'strat-2', name: 'Mean Reverter', status: 'PAUSED', lastAction: '-', heartbeat: '-' },
      ]);
    })();
    const unsub = socket.subscribe('monitor', msg => {
      if (msg?.type === 'tick') {
        setTicks(prev => [{ ts: msg.ts, symbol: msg.symbol, ltp: msg.ltp }, ...prev].slice(0, 20));
      }
    });
    return () => { mounted = false; unsub(); };
  }, [socket, mockLatency]);

  const handleStrategyCommand = (strategy, command) => {
    showNotification(`Sending command ${command} to ${strategy.name}`);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <WidgetCard title="Live Market Ticks" subtitle="Latest 20 updates" actions={<button className="btn" onClick={() => setTicks([])}>Clear</button>}>
        <table className="table">
          <thead><tr><th>Time</th><th>Symbol</th><th>LTP</th></tr></thead>
          <tbody>
            {ticks.map((t, i) => <tr key={i}><td>{t.ts}</td><td>{t.symbol}</td><td>{t.ltp}</td></tr>)}
            {ticks.length === 0 && <tr><td colSpan="3" style={{ color: 'var(--text-secondary)' }}>Waiting for ticks...</td></tr>}
          </tbody>
        </table>
      </WidgetCard>

      <div className="grid cols-2">
        <WidgetCard title="Positions" subtitle="Current exposure">
          <table className="table">
            <thead><tr><th>Symbol</th><th>Qty</th><th>Avg</th><th>LTP</th><th>Unrealized PnL</th></tr></thead>
            <tbody>
              {positions.map((p, i) => {
                const pnl = Math.round((p.ltp - p.avg) * p.qty * 1) / 1;
                return (
                  <tr key={i}>
                    <td>{p.symbol}</td>
                    <td>{p.qty}</td>
                    <td>{p.avg}</td>
                    <td>{p.ltp}</td>
                    <td style={{ color: pnl >= 0 ? '#10b981' : '#ef4444' }}>{pnl.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Strategy Status">
          <table className="table">
            <thead><tr><th>Name</th><th>Status</th><th>Last Action</th><th>Heartbeat</th><th>Controls</th></tr></thead>
            <tbody>
              {strategies.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td><span className={`badge ${s.status === 'RUNNING' ? 'ok' : s.status === 'PAUSED' ? 'warn' : 'err'}`}>{s.status}</span></td>
                  <td>{s.lastAction}</td>
                  <td>{s.heartbeat}</td>
                  <td className="row">
                    <button className="btn secondary" onClick={() => handleStrategyCommand(s, 'RESUME')}>Resume</button>
                    <button className="btn warn" onClick={() => handleStrategyCommand(s, 'PAUSE')}>Pause</button>
                    <button className="btn danger" onClick={() => handleStrategyCommand(s, 'STOP')}>Stop</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>
      </div>
    </div>
  );
}
