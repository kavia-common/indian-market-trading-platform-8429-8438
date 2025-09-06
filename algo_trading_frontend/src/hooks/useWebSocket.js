import { useEffect, useRef, useState } from 'react';
import { ReconnectingWebSocketClient } from '../services/ws';

// PUBLIC_INTERFACE
export function useWebSocket(path = '/ws/stream') {
  /** Connects to WebSocket and returns messages array and a send function. */
  const clientRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const client = new ReconnectingWebSocketClient(path);
    clientRef.current = client;
    const unsub = client.subscribe((msg) => {
      setMessages((prev) => [...prev.slice(-199), msg]); // keep last 200 messages
    });
    return () => {
      unsub();
      client.close();
    };
  }, [path]);

  return {
    messages,
    send: (payload) => clientRef.current && clientRef.current.send(payload),
  };
}
