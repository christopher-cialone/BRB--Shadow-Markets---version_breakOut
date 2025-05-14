import { useState, useEffect, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

interface UseWebSocketResult {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (data: any) => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    autoConnect = true,
  } = options;
  
  // Create WebSocket connection
  const connect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    
    try {
      const newSocket = new WebSocket(url);
      
      newSocket.onopen = (event) => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setReconnectCount(0);
        onOpen?.(event);
      };
      
      newSocket.onmessage = (event) => {
        onMessage?.(event);
      };
      
      newSocket.onclose = (event) => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        onClose?.(event);
        
        // Attempt reconnection if not intentionally closed
        if (reconnectCount < reconnectAttempts) {
          setTimeout(() => {
            setReconnectCount((prev) => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };
      
      newSocket.onerror = (event) => {
        console.error('WebSocket error:', event);
        onError?.(event);
      };
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [
    url,
    socket,
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectCount,
    reconnectAttempts,
    reconnectInterval,
  ]);
  
  // Close WebSocket connection
  const disconnect = useCallback(() => {
    if (socket) {
      // Use code 1000 for normal closure
      socket.close(1000, 'User disconnected');
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);
  
  // Send message through WebSocket
  const sendMessage = useCallback(
    (data: any) => {
      if (socket && isConnected) {
        socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      } else {
        console.warn('Cannot send message: WebSocket is not connected');
      }
    },
    [socket, isConnected]
  );
  
  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [autoConnect, connect, socket]);
  
  return {
    socket,
    isConnected,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useWebSocket;