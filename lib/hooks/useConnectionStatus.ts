/**
 * Hook to monitor Firestore connection status
 * Provides connection state and automatic reconnection handling
 */

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/config/firebase';

export interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnectedAt: Date | null;
  disconnectCount: number;
}

/**
 * Monitor Firestore connection status
 * Uses Firestore's built-in connection state monitoring
 */
export function useConnectionStatus(): ConnectionStatus {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(new Date());
  const [disconnectCount, setDisconnectCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Firestore doesn't have direct connection status API
    // We'll use a heartbeat mechanism instead
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let lastHeartbeat = Date.now();
    const heartbeatTimeout = 10000; // 10 seconds

    const checkConnection = () => {
      const now = Date.now();
      const timeSinceLastHeartbeat = now - lastHeartbeat;

      if (timeSinceLastHeartbeat > heartbeatTimeout * 2) {
        // No heartbeat for 20 seconds = disconnected
        if (isConnected) {
          console.warn('⚠️ CONNECTION - Appears disconnected (no heartbeat)');
          setIsConnected(false);
          setIsReconnecting(true);
          setDisconnectCount(prev => prev + 1);
        }
      } else {
        // Heartbeat received = connected
        if (!isConnected) {
          console.log('✅ CONNECTION - Reconnected');
          setIsConnected(true);
          setIsReconnecting(false);
          setLastConnectedAt(new Date());
        }
      }
    };

    // Start heartbeat check
    heartbeatInterval = setInterval(checkConnection, 5000);

    // Simulate heartbeat by checking Firestore availability
    const simulateHeartbeat = async () => {
      try {
        // Try to read from Firestore (lightweight operation)
        const { doc, getDoc } = await import('firebase/firestore');
        const testDoc = doc(db, '_health', 'check');
        await getDoc(testDoc);
        lastHeartbeat = Date.now();
      } catch (error) {
        // If Firestore is unavailable, mark as disconnected
        console.warn('⚠️ CONNECTION - Firestore unavailable:', error);
        setIsConnected(false);
        setIsReconnecting(true);
      }
    };

    // Run heartbeat every 5 seconds
    const heartbeatInterval2 = setInterval(simulateHeartbeat, 5000);
    simulateHeartbeat(); // Initial heartbeat

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (heartbeatInterval2) clearInterval(heartbeatInterval2);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timeout = reconnectTimeoutRef.current;
      if (timeout) clearTimeout(timeout);
    };
  }, [isConnected]);

  return {
    isConnected,
    isReconnecting,
    lastConnectedAt,
    disconnectCount,
  };
}

