import React, { useState } from 'react';
import Card from '../components/common/Card';
import { OrdersAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import StatusBadge from '../components/common/StatusBadge';
import { RiskEngineIntegration, ComplianceLogger } from '../services/integrations';

// PUBLIC_INTERFACE
export default function Orders() {
  /** Order tracking and placement page. */
  const { data: orders, loading, error, refetch } = useApi(() => OrdersAPI.list().catch(() => ([])), []);
  const [symbol, setSymbol] = useState('NIFTY');
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState('BUY');
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    setPlacing(true);
    try {
      const pre = await RiskEngineIntegration.preTradeCheck({ symbol, qty, side });
      if (!pre.allowed) {
        alert(`Order blocked by risk engine: ${pre.details}`);
        setPlacing(false);
        return;
      }
      await OrdersAPI.place({ symbol, qty: Number(qty), side });
      await ComplianceLogger.logAction('order_place', { symbol, qty, side });
      await refetch();
    } catch (e) {
      alert(`Order failed: ${e.message}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <h2>Orders</h2>
      <Card title="Place Order" actions={<StatusBadge status="running" />}>
        <div style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
          <label>
            <div>Symbol</div>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </label>
          <label>
            <div>Quantity</div>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </label>
          <label>
            <div>Side</div>
            <select value={side} onChange={(e) => setSide(e.target.value)}>
              <option>BUY</option>
              <option>SELL</option>
            </select>
          </label>
          <button disabled={placing} onClick={placeOrder}>
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </Card>

      <Card title="Execution History">
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'tomato' }}>Failed to load: {error.message}</div>}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Time</th>
                <th align="left">Symbol</th>
                <th align="left">Side</th>
                <th align="left">Qty</th>
                <th align="left">Price</th>
                <th align="left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map((o) => (
                <tr key={o.id}>
                  <td>{o.time || '-'}</td>
                  <td>{o.symbol}</td>
                  <td>{o.side}</td>
                  <td>{o.qty}</td>
                  <td>{o.price ?? '-'}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
              {!orders?.length && (
                <tr><td colSpan={6}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
