const config = {
  // API configuration
  apiBase: process.env.REACT_APP_API_BASE || 'http://localhost:8000',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  
  // Feature flags
  enableWebsocket: process.env.REACT_APP_ENABLE_WS !== 'false',
  enableMockData: process.env.REACT_APP_MOCK_DATA === 'true',
  
  // Trading configuration
  maxLeverage: process.env.REACT_APP_MAX_LEVERAGE || 5,
  maxOrderValue: process.env.REACT_APP_MAX_ORDER_VALUE || 500000,
  
  // UI configuration
  defaultTheme: process.env.REACT_APP_DEFAULT_THEME || 'light',
  refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL || 5000),
};

export default config;
