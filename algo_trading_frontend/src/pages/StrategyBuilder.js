import React, { useMemo, useState } from 'react';
import Card from '../components/common/Card';
import { StrategyAPI } from '../services/api';
import { ComplianceLogger } from '../services/integrations';

const strategyTypes = [
  { key: 'trend_following', label: 'Trend Following' },
  { key: 'mean_reversion', label: 'Mean Reversion' },
  { key: 'vwap_twap', label: 'VWAP/TWAP' },
  { key: 'arbitrage', label: 'Arbitrage' },
];

function defaultConfig(type) {
  switch (type) {
    case 'trend_following': return { timeframe: '15m', fastMA: 9, slowMA: 21, riskPerTrade: 1 };
    case 'mean_reversion': return { timeframe: '5m', rsiPeriod: 14, rsiBuy: 30, rsiSell: 70, riskPerTrade: 1 };
    case 'vwap_twap': return { timeframe: '1m', algo: 'vwap', participationRate: 0.1 };
    case 'arbitrage': return { symbols: ['NIFTY', 'BANKNIFTY'], maxSpread: 0.1, riskPerTrade: 1 };
    default: return {};
  }
}

// PUBLIC_INTERFACE
export default function StrategyBuilder() {
  /** UI for creating and saving strategies with configurable parameters. */
  const [name, setName] = useState('');
  const [type, setType] = useState('trend_following');
  const [config, setConfig] = useState(defaultConfig('trend_following'));
  const [saving, setSaving] = useState(false);
  const fields = useMemo(() => Object.keys(config), [config]);

  function onTypeChange(next) {
    setType(next);
    setConfig(defaultConfig(next));
  }

  async function onSave() {
    setSaving(true);
    try {
      await StrategyAPI.create({ name, type, config });
      await ComplianceLogger.logAction('strategy_create', { name, type });
      alert('Strategy saved.');
      setName('');
      setConfig(defaultConfig(type));
    } catch (e) {
      alert(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Create Strategy</h2>
      <Card title="Details">
        <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          <label>
            <div>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Strategy" />
          </label>
          <label>
            <div>Type</div>
            <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
              {strategyTypes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card title="Parameters">
        <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          {fields.map((k) => (
            <label key={k}>
              <div style={{ textTransform: 'capitalize' }}>{k}</div>
              <input
                value={config[k]}
                onChange={(e) => setConfig((c) => ({ ...c, [k]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </Card>

      <button disabled={saving || !name} onClick={onSave}>
        {saving ? 'Saving...' : 'Save Strategy'}
      </button>
    </div>
  );
}
