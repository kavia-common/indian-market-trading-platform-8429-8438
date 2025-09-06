//
// Core API service for REST and GraphQL using REACT_APP_API_BASE
//

const API_BASE = process.env.REACT_APP_API_BASE || '';

/**
 * Build full URL for REST endpoints, respecting REACT_APP_API_BASE.
 */
function url(path) {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

// PUBLIC_INTERFACE
export async function apiGet(path, options = {}) {
  /** Performs a GET request against the backend REST API.
   * path: string path (e.g., '/strategies')
   * returns: parsed JSON response
   */
  const res = await fetch(url(path), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body = {}, options = {}) {
  /** Performs a POST request against the backend REST API.
   * body: object payload to JSON.stringify
   */
  const res = await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body),
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function graphQL(query, variables = {}, options = {}) {
  /** Sends a GraphQL request to the backend.
   * The GraphQL endpoint is expected at `${REACT_APP_API_BASE}/graphql`.
   */
  const res = await fetch(url('/graphql'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify({ query, variables }),
    ...options,
  });
  const data = await res.json();
  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns the configured API base for debugging and display. */
  return API_BASE;
}

// Placeholder helpers for resources (can be extended as backend endpoints stabilize)
export const StrategyAPI = {
  list: () => apiGet('/strategies'),
  create: (payload) => apiPost('/strategies', payload),
  backtest: (payload) => apiPost('/backtest', payload),
};

export const OrdersAPI = {
  list: () => apiGet('/orders'),
  place: (payload) => apiPost('/orders', payload),
};

export const RiskAPI = {
  getStatus: () => apiGet('/risk/status'),
  getCompliance: () => apiGet('/compliance/logs'),
};

export const MarketAPI = {
  getInstruments: () => apiGet('/market/instruments'),
  getQuote: (symbol) => apiGet(`/market/quote?symbol=${encodeURIComponent(symbol)}`),
};
