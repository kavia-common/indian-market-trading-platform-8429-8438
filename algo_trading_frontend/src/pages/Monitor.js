import React, { useState } from 'react';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import { useWebSocket } from '../hooks/useWebSocket';

// PUBLIC_INTERFACE
export default function Monitor() {
  /** Real-time monitoring page consuming WebSocket updates. */
  const { messages, send } = useWebSocket('/ws/stream');
  const [symbol, setSymbol] = useState('NIFTY');

  function subscribe() {
    send({ type: 'subscribe', symbol });
  }

  return (
    <div>
      <h2>Real-Time Monitor <StatusBadge status="running" /></h2>
      <Card title="Subscriptions" actions={<button onClick={subscribe}>Subscribe</button>}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" />
        </div>
      </Card>
      <Card title="Live Stream (latest 200 messages)">
        <div style={{ maxHeight: 300, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
          {messages.map((m, i) => (
            <div key={i}>{typeof m === 'string' ? m : JSON.stringify(m)}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
