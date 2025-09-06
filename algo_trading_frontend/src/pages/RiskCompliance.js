import React from 'react';
import Card from '../components/common/Card';
import { RiskAPI } from '../services/api';
import { useApi } from '../hooks/useApi';

// PUBLIC_INTERFACE
export default function RiskCompliance() {
  /** Shows current risk exposure and compliance logs. */
  const { data: risk, loading: rLoading, error: rError } = useApi(() => RiskAPI.getStatus().catch(() => ({ exposure: 0, breaches: [] })), []);
  const { data: logs, loading: lLoading, error: lError } = useApi(() => RiskAPI.getCompliance().catch(() => ([])), []);

  return (
    <div>
      <h2>Risk & Compliance</h2>
      <Card title="Risk Overview">
        {rLoading && <div>Loading...</div>}
        {rError && <div style={{ color: 'tomato' }}>Error: {rError.message}</div>}
        {!rLoading && !rError && (
          <ul>
            <li>Total Exposure: {risk?.totalRisk ?? risk?.exposure ?? 0}</li>
            <li>Open Breaches: {Array.isArray(risk?.breaches) ? risk.breaches.length : 0}</li>
          </ul>
        )}
      </Card>

      <Card title="Compliance Logs">
        {lLoading && <div>Loading...</div>}
        {lError && <div style={{ color: 'tomato' }}>Error: {lError.message}</div>}
        {!lLoading && !lError && (
          <div style={{ maxHeight: 300, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
            {(logs || []).map((log, idx) => (
              <div key={log.id || idx}>
                [{log.ts || log.timestamp || '-'}] {log.action || log.event}: {JSON.stringify(log.metadata || log.detail || {})}
              </div>
            ))}
            {!logs?.length && <div>No logs.</div>}
          </div>
        )}
      </Card>
    </div>
  );
}
