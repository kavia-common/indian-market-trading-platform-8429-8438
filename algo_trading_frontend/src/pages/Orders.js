import React, { useEffect, useMemo, useState } from 'react';
import WidgetCard from '../components/WidgetCard';
import { useApi } from '../services/api';
import { showNotification } from '../utils/notification';

// PUBLIC_INTERFACE
export default function Orders() {
  /** Order execution tracking with status filters. */
  const { mockLatency } = useApi();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    (async () => {
      await mockLatency(200);
      if (!mounted) return;
      setOrders(Array.from({ length: 18 }).map((_, i) => ({
        id: 'ORD' + (1000 + i),
        ts: new Date(Date.now() - i * 60000).toLocaleTimeString(),
        symbol: ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS'][i % 4],
        side: i % 2 === 0 ? 'BUY' : 'SELL',
        qty: 25 + (i % 6) * 25,
        price: 20000 + i * 10,
        status: ['PENDING', 'FILLED', 'CANCELLED'][i % 3],
      })));
    })();
    return () => { mounted = false; };
  }, [mockLatency]);

  const filtered = useMemo(() => {
    if (status === 'ALL') return orders;
    return orders.filter(o => o.status === status);
  }, [orders, status]);

  const handleExport = () => {
    showNotification('Exporting orders data to CSV...', 'info');
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <WidgetCard title="Orders" actions={
        <>
          <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="FILLED">Filled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button className="btn" onClick={handleExport}>Export</button>
        </>
      }>
        <table className="table">
          <thead>
            <tr><th>Order ID</th><th>Time</th><th>Symbol</th><th>Side</th><th>Qty</th><th>Price</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.ts}</td>
                <td>{o.symbol}</td>
                <td><span className={`badge ${o.side === 'BUY' ? 'ok' : 'warn'}`}>{o.side}</span></td>
                <td>{o.qty}</td>
                <td>{o.price}</td>
                <td>
                  <span className={`badge ${o.status === 'FILLED' ? 'ok' : o.status === 'PENDING' ? 'warn' : 'err'}`}>{o.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--text-secondary)' }}>No orders.</td></tr>}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
