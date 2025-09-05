import React, { useEffect, useMemo, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import { useApi } from '../services/api';
import { showNotification } from '../utils/notification';

// PUBLIC_INTERFACE
export default function Strategies() {
  /** Strategy management: list, create, update, delete, enable/disable. */
  const { mockLatency } = useApi();
  const [strategies, setStrategies] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'trend', enabled: true, params: '{"lookback": 20, "threshold": 1.5}' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      await mockLatency(200);
      const fake = [
        { id: 'strat-1', name: 'Trend Rider', type: 'trend', enabled: true, market: 'NIFTY', updatedAt: new Date().toLocaleString() },
        { id: 'strat-2', name: 'Mean Reverter', type: 'mean', enabled: false, market: 'BANKNIFTY', updatedAt: new Date().toLocaleString() },
        { id: 'strat-3', name: 'VWAP Scalp', type: 'vwap', enabled: true, market: 'FINNIFTY', updatedAt: new Date().toLocaleString() },
      ];
      if (mounted) setStrategies(fake);
    }
    load();
    return () => { mounted = false; };
  }, [mockLatency]);

  const filtered = useMemo(() => strategies.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.type.toLowerCase().includes(filter.toLowerCase())
  ), [strategies, filter]);

  function handleCreate(e) {
    e.preventDefault();
    const id = 'strat-' + Math.random().toString(36).slice(2, 7);
    setStrategies(prev => [
      { id, name: form.name || 'New Strategy', type: form.type, enabled: form.enabled, market: 'NSE', updatedAt: new Date().toLocaleString(), params: form.params },
      ...prev
    ]);
    setForm({ name: '', type: 'trend', enabled: true, params: '{"lookback": 20, "threshold": 1.5}' });
    showNotification('Strategy created successfully', 'success');
  }

  function toggleEnabled(id) {
    setStrategies(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toLocaleString() } : s);
      const strategy = updated.find(s => s.id === id);
      showNotification(`Strategy ${strategy.name} ${strategy.enabled ? 'enabled' : 'disabled'}`, 'info');
      return updated;
    });
  }

  function remove(id) {
    setStrategies(prev => {
      const strategy = prev.find(s => s.id === id);
      showNotification(`Strategy ${strategy.name} deleted`, 'warn');
      return prev.filter(s => s.id !== id);
    });
  }

  function handleEditParameters(strategy) {
    showNotification(`Editing parameters for ${strategy.name}:\n${strategy.params || '{}'}`, 'info');
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <WidgetCard title="Create Strategy" subtitle="Define logic and parameters" actions={
        <button className="btn" onClick={() => setForm(f => ({ ...f, name: `Strategy ${Math.floor(Math.random()*100)}` }))}>Suggest Name</button>
      }>
        <form className="grid cols-3" onSubmit={handleCreate} style={{ gap: 12 }}>
          <div>
            <label>Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Trend Rider" required />
          </div>
          <div>
            <label>Type</label>
            <select className="select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="trend">Trend Following</option>
              <option value="mean">Mean Reversion</option>
              <option value="vwap">VWAP/TWAP</option>
              <option value="arb">Arbitrage</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
              Enabled
            </label>
            <button className="btn" type="submit">Create</button>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Parameters (JSON)</label>
            <textarea className="textarea" rows={4} value={form.params} onChange={e => setForm({ ...form, params: e.target.value })} />
          </div>
        </form>
      </WidgetCard>

      <WidgetCard title="Strategies" subtitle="Manage and configure" actions={
        <input className="input" placeholder="Search by name/type..." value={filter} onChange={e => setFilter(e.target.value)} />
      }>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Type</th><th>Market</th><th>Status</th><th>Updated</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.type}</td>
                <td>{s.market}</td>
                <td><span className={`badge ${s.enabled ? 'ok' : ''}`}>{s.enabled ? 'Enabled' : 'Disabled'}</span></td>
                <td>{s.updatedAt}</td>
                <td className="row">
                  <button className="btn secondary" onClick={() => toggleEnabled(s.id)}>{s.enabled ? 'Disable' : 'Enable'}</button>
                  <button className="btn warn" onClick={() => handleEditParameters(s)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ color: 'var(--text-secondary)' }}>No strategies found.</td></tr>
            )}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
