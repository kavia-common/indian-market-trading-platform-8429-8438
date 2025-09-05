import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { showNotification } from '../utils/notification';

const SocketContext = createContext(null);

// PUBLIC_INTERFACE
export function SocketProvider({ url, enabled = true, children }) {
  /** Provides WebSocket connection and subscriptions for real-time updates. */
  const [status, setStatus] = useState('DISCONNECTED');
  const wsRef = useRef(null);
  const subsRef = useRef(new Map());
  const backoffRef = useRef(500);

  const notify = useCallback((msg) => {
    const data = (() => {
      try { 
        return JSON.parse(msg.data); 
      } catch { 
        return { type: 'raw', payload: msg.data }; 
      }
    })();
    subsRef.current.forEach(cb => {
      try { 
        cb(data); 
      } catch (e) { 
        showNotification('Socket message handler error', 'error');
      }
    });
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !url) return;
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus('CONNECTING');

      ws.onopen = () => { 
        setStatus('CONNECTED'); 
        backoffRef.current = 500; 
      };

      ws.onmessage = notify;

      ws.onclose = () => {
        setStatus('DISCONNECTED');
        // exponential backoff reconnect
        const backoff = Math.min(backoffRef.current, 6000);
        backoffRef.current *= 2;
        // Use window.setTimeout for browser context
        window.setTimeout(() => {
          connect();
        }, backoff);
      };

      ws.onerror = () => {
        showNotification('WebSocket connection error', 'error');
        ws.close();
      };
    } catch (e) {
      setStatus('ERROR');
      showNotification('Failed to establish WebSocket connection', 'error');
    }
  }, [notify, url, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();
      return () => {
        if (wsRef.current) wsRef.current.close();
      };
    } else {
      setStatus('DISABLED');
    }
  }, [connect, enabled]);

  // PUBLIC_INTERFACE
  const subscribe = useCallback((key, cb) => {
    /** Subscribe to incoming socket messages (dispatching to all topics client-side). */
    subsRef.current.set(key, cb);
    return () => subsRef.current.delete(key);
  }, []);

  // PUBLIC_INTERFACE
  const send = useCallback((obj) => {
    /** Send a JSON message over the socket if connected. */
    const ws = wsRef.current;
    if (ws?.readyState === 1) ws.send(JSON.stringify(obj));
  }, []);

  const ctx = useMemo(() => ({ status, subscribe, send }), [status, subscribe, send]);
  return <SocketContext.Provider value={ctx}>{children}</SocketContext.Provider>;
}

// PUBLIC_INTERFACE
export function useSocket() {
  /** Hook to access WebSocket utilities. */
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
