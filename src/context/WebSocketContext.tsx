import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

interface WebSocketContextProps {
  isConnected: boolean;
  sendMessage: (data: any) => void;
  lastMessage: any | null;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  
  // Set up the WebSocket URL with the correct protocol based on current connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  // Set up message handler
  const handleMessage = useCallback((event: WebSocketEventMap['message']) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      console.log('WebSocket message received:', data);
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  }, []);
  
  // Initialize WebSocket connection
  const { 
    isConnected, 
    sendMessage, 
    connect, 
    disconnect 
  } = useWebSocket(wsUrl, {
    onMessage: handleMessage,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    autoConnect: true
  });
  
  // Create context value
  const value = {
    isConnected,
    sendMessage,
    lastMessage,
    connect,
    disconnect
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook for using the WebSocket context
export const useWebSocketContext = (): WebSocketContextProps => {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
};

export default WebSocketContext;