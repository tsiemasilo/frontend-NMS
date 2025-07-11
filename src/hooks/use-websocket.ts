import { useEffect, useState, useRef } from 'react';

export function useWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsUrl = API_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setReadyState(WebSocket.OPEN);
    };

    ws.current.onmessage = (event) => {
      console.log('WebSocket message received, refreshing data:', JSON.parse(event.data));
      setLastMessage(event);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setReadyState(WebSocket.CLOSED);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setReadyState(WebSocket.CLOSED);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current && readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return { lastMessage, readyState, sendMessage };
}