import React, { useState } from 'react';
import Card from '../components/common/Card';
import { StrategyAPI, graphQL } from '../services/api';

// PUBLIC_INTERFACE
export default function Backtest() {
  /** UI to select a strategy and run backtests; displays simple results. */
  const [strategyId, setStrategyId] = useState('');
  const [symbol, setSymbol] = useState('NIFTY');
  const [from, setFrom] = useState('2024-01-01');
  const [to, setTo] = useState('2024-12-31');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  async function runBacktest() {
    setRunning(true);
    setResult(null);
    try {
      // Prefer GraphQL if available
      const q = `
        mutation RunBacktest($input: BacktestInput!) {
          runBacktest(input: $input) {
            pnl
            winRate
            maxDrawdown
            trades
          }
        }
      `;
      const data = await graphQL(q, { input: { strategyId, symbol, from, to } })
        .catch(() => StrategyAPI.backtest({ strategyId, symbol, from, to }));
      setResult(data?.runBacktest || data);
    } catch (e) {
      alert(`Backtest failed: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <h2>Backtest</h2>
      <Card title="Parameters">
        <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
          <label>
            <div>Strategy ID</div>
            <input value={strategyId} onChange={(e) => setStrategyId(e.target.value)} placeholder="strategy-id" />
          </label>
          <label>
            <div>Symbol</div>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </label>
          <label>
            <div>From</div>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            <div>To</div>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button onClick={runBacktest} disabled={running || !strategyId}>
            {running ? 'Running...' : 'Run Backtest'}
          </button>
        </div>
      </Card>

      {result && (
        <Card title="Results">
          <ul>
            <li>PnL: {result.pnl}</li>
            <li>Win Rate: {result.winRate}%</li>
            <li>Max Drawdown: {result.maxDrawdown}%</li>
            <li>Trades: {Array.isArray(result.trades) ? result.trades.length : result.trades}</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
