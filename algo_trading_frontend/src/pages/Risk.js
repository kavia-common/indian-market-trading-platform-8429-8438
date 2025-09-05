import React, { useEffect, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import { useApi } from '../services/api';

// PUBLIC_INTERFACE
export default function Risk() {
  /** Risk & compliance: policy limits, current exposure, violation logs. */
  const { mockLatency } = useApi();
  const [limits, setLimits] = useState({ maxExposureX: 5, maxOrderValue: 500000, maxDailyLoss: -25000 });
  const [exposure, setExposure] = useState({ currentX: 3.1, orderValue: 210000, mtm: 15230 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await mockLatency(200);
      if (!mounted) return;
      setLogs([
        { id: 1, ts: new Date().toLocaleTimeString(), level: 'INFO', message: 'Compliance log initialized.' },
        { id: 2, ts: new Date().toLocaleTimeString(), level: 'WARN', message: 'Order size close to maxOrderValue.' },
      ]);
    })();
    return () => { mounted = false; };
  }, [mockLatency]);

  function saveLimits(e) {
    e.preventDefault();
    alert('Limits saved (placeholder).');
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-3">
        <WidgetCard title="Limits">
          <form className="grid" onSubmit={saveLimits} style={{ gap: 10 }}>
            <label>Max Exposure (x)</label>
            <input className="input" type="number" value={limits.maxExposureX} onChange={e => setLimits({ ...limits, maxExposureX: Number(e.target.value) })} />
            <label>Max Order Value (₹)</label>
            <input className="input" type="number" value={limits.maxOrderValue} onChange={e => setLimits({ ...limits, maxOrderValue: Number(e.target.value) })} />
            <label>Max Daily Loss (₹)</label>
            <input className="input" type="number" value={limits.maxDailyLoss} onChange={e => setLimits({ ...limits, maxDailyLoss: Number(e.target.value) })} />
            <div className="row"><button className="btn" type="submit">Save</button></div>
          </form>
        </WidgetCard>
        <WidgetCard title="Current Exposure">
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>Leverage: {exposure.currentX}x / Limit: {limits.maxExposureX}x</li>
            <li>Largest Order Value Today: ₹{exposure.orderValue.toLocaleString()}</li>
            <li>Day MTM: ₹{exposure.mtm.toLocaleString()}</li>
          </ul>
        </WidgetCard>
        <WidgetCard title="Controls">
          <div className="row">
            <button className="btn warn" onClick={() => alert('Soft halt activated (placeholder).')}>Soft Halt</button>
            <button className="btn danger" onClick={() => alert('Kill switch activated (placeholder).')}>Kill Switch</button>
          </div>
        </WidgetCard>
      </div>

      <WidgetCard title="Compliance Logs">
        <table className="table">
          <thead><tr><th>Time</th><th>Level</th><th>Message</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{l.ts}</td>
                <td><span className={`badge ${l.level === 'WARN' ? 'warn' : l.level === 'ERROR' ? 'err' : ''}`}>{l.level}</span></td>
                <td>{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
