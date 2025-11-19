'use client';

import { useConnectionStatus } from '@/lib/hooks/useConnectionStatus';

/**
 * Connection status indicator component
 * Shows user when connection is lost or recovered
 */
export function ConnectionStatus() {
  const { isConnected, isReconnecting, disconnectCount } = useConnectionStatus();

  if (isConnected && disconnectCount === 0) {
    return null; // Don't show anything when connected normally
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 shadow-lg transition-all duration-300 ${
        isConnected
          ? 'bg-green-500/90 text-white'
          : isReconnecting
          ? 'bg-yellow-500/90 text-white'
          : 'bg-red-500/90 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="text-lg">✅</span>
            <span className="text-sm font-semibold">Reconnected</span>
          </>
        ) : isReconnecting ? (
          <>
            <span className="text-lg animate-spin">🔄</span>
            <span className="text-sm font-semibold">Reconnecting...</span>
          </>
        ) : (
          <>
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-semibold">Connection Lost</span>
          </>
        )}
      </div>
    </div>
  );
}

