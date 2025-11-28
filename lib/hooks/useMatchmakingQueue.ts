import { useState, useEffect, useRef, useCallback } from 'react';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry } from '@/lib/services/matchmaking-queue';

interface UseMatchmakingQueueOptions {
  userId: string;
  userName: string;
  userAvatar: string;
  userRank: string;
  userRankLP: number;
  trait: string;
  enabled: boolean;
  onQueueUpdate?: (players: QueueEntry[]) => void;
}

/**
 * Hook for managing matchmaking queue operations
 * Handles joining, leaving, and listening to queue updates
 */
export function useMatchmakingQueue({
  userId,
  userName,
  userAvatar,
  userRank,
  userRankLP,
  trait,
  enabled,
  onQueueUpdate,
}: UseMatchmakingQueueOptions) {
  const [queueSnapshot, setQueueSnapshot] = useState<QueueEntry[]>([]);
  const hasJoinedQueueRef = useRef(false);

  const join = useCallback(async () => {
    if (hasJoinedQueueRef.current) return;
    hasJoinedQueueRef.current = true;
    await joinQueue(userId, userName, userAvatar, userRank, userRankLP, trait);
  }, [userId, userName, userAvatar, userRank, userRankLP, trait]);

  const leave = useCallback(async () => {
    if (!hasJoinedQueueRef.current) return;
    hasJoinedQueueRef.current = false;
    await leaveQueue(userId).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!enabled) {
      leave();
      return;
    }

    let unsubscribeQueue: (() => void) | null = null;

    const startQueue = async () => {
      try {
        await join();
        unsubscribeQueue = listenToQueue(trait, userId, (queuePlayers: QueueEntry[]) => {
          setQueueSnapshot(queuePlayers);
          onQueueUpdate?.(queuePlayers);
        });
      } catch (error) {
        // Silent fail
      }
    };

    startQueue();

    return () => {
      if (unsubscribeQueue) {
        unsubscribeQueue();
      }
      leave();
    };
  }, [enabled, userId, userName, userAvatar, userRank, userRankLP, trait, join, leave, onQueueUpdate]);

  return {
    queueSnapshot,
    join,
    leave,
    hasJoined: hasJoinedQueueRef.current,
  };
}

