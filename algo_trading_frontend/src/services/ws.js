//
// WebSocket client with auto-reconnect and event subscription
//

const API_BASE = process.env.REACT_APP_API_BASE || '';

function wsUrl(path = '/ws') {
  const base = API_BASE || window.location.origin;
  const urlObj = new URL(base, window.location.origin);
  urlObj.protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
  const clean = path.startsWith('/') ? path : `/${path}`;
  urlObj.pathname = clean;
  return urlObj.toString();
}

// PUBLIC_INTERFACE
export class ReconnectingWebSocketClient {
  /** WebSocket client that reconnects with backoff and supports event listeners. */
  constructor(path = '/ws', { maxRetries = 10, onOpen, onMessage, onClose, onError } = {}) {
    this.path = path;
    this.maxRetries = maxRetries;
    this.retries = 0;
    this.socket = null;
    this.listeners = new Set();
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.onError = onError;
    this._connect();
  }

  _connect() {
    const url = wsUrl(this.path);
    this.socket = new WebSocket(url);

    this.socket.onopen = (ev) => {
      this.retries = 0;
      if (this.onOpen) this.onOpen(ev);
    };

    this.socket.onmessage = (msg) => {
      let parsed = null;
      try {
        parsed = JSON.parse(msg.data);
      } catch {
        parsed = { type: 'raw', data: msg.data };
      }
      this.listeners.forEach((fn) => fn(parsed));
      if (this.onMessage) this.onMessage(parsed);
    };

    this.socket.onclose = (ev) => {
      if (this.onClose) this.onClose(ev);
      this._retry();
    };

    this.socket.onerror = (err) => {
      if (this.onError) this.onError(err);
      try { this.socket.close(); } catch {}
    };
  }

  _retry() {
    if (this.retries >= this.maxRetries) return;
    const timeout = Math.min(30000, 1000 * 2 ** this.retries);
    this.retries += 1;
    setTimeout(() => this._connect(), timeout);
  }

  // PUBLIC_INTERFACE
  subscribe(listener) {
    /** Subscribe to incoming messages. Returns an unsubscribe function. */
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // PUBLIC_INTERFACE
  send(data) {
    /** Send data over the socket; if not ready, it is ignored. */
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(payload);
    }
  }

  // PUBLIC_INTERFACE
  close() {
    /** Close the socket and stop reconnect attempts. */
    this.maxRetries = 0;
    try { this.socket && this.socket.close(); } catch {}
  }
}
