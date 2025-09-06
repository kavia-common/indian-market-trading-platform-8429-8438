# Market Navigator Frontend

This React app provides:
- Dashboard with KPIs and quick actions
- Strategy builder for multiple strategy families (trend-following, mean-reversion, VWAP/TWAP, arbitrage)
- Backtesting runner (REST/GraphQL)
- Real-time monitor via WebSocket with auto-reconnect
- Order execution tracker and placement
- Risk and compliance visualization
- Placeholders for Zerodha Kite Connect integration, risk engine checks, and compliance logging

Configuration:
- Set REACT_APP_API_BASE in .env to your backend base URL (e.g., http://localhost:8000)

Structure:
- src/services: api.js, ws.js, integrations.js
- src/hooks: useApi.js, useWebSocket.js
- src/components: layout and common UI
- src/pages: Dashboard, StrategyBuilder, Backtest, Monitor, Orders, RiskCompliance
