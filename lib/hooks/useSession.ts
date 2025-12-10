import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionManager } from '../services/session-manager';
import { GameSession, PlayerInfo, PhaseSubmissionData, Phase } from '../types/session';
import { useAuth } from '@/contexts/AuthContext';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

/**
 * Custom React hook for session management
 * Provides easy interface to SessionManager
 * 
 * Usage:
 * const { session, isReconnecting, submitPhase, timeRemaining } = useSession(sessionId);
 */
export function useSession(sessionId: string | null) {
  const { user, userProfile } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionManager] = useState(() => new SessionManager());
  const [profileReady, setProfileReady] = useState(false);
  const playerInfoRef = useRef<PlayerInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    if (user && userProfile) {
      playerInfoRef.current = {
        displayName: userProfile.displayName,
        avatar: typeof userProfile.avatar === 'string' ? userProfile.avatar : '🌿',
        rank: userProfile.currentRank || 'Silver III',
      };
      setProfileReady(true);
    } else {
      playerInfoRef.current = null;
      setProfileReady(false);
    }
  }, [user, userProfile]);

  // Initialize session
  useEffect(() => {
    if (!user || !sessionId || !profileReady || !playerInfoRef.current) return;
    
    const init = async () => {
      try {
        setIsReconnecting(true);
        setError(null);
        
        // TypeScript guard: we know playerInfoRef.current is not null due to check above
        const playerInfo = playerInfoRef.current;
        if (!playerInfo) return;
        
        const gameSession = await sessionManager.joinSession(
          sessionId,
          user.uid,
          playerInfo
        );
        
        setSession(gameSession);
        setIsReconnecting(false);
        
        // Set up event handlers
        sessionManager.on('onSessionUpdate', (updatedSession) => {
          setSession(updatedSession);
        });
        
        sessionManager.on('onPhaseTransition', (newPhase) => {
          // Phase transition handled by components
        });
        
        sessionManager.on('onAllPlayersReady', () => {
          // All players ready - handled by components
        });
        
        sessionManager.on('onSessionError', (err) => {
          logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Session error', err);
          setError(err);
        });
        
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to join session', err);
        setError(err as Error);
        setIsReconnecting(false);
      }
    };
    
    init();
    
    // Cleanup on unmount
    return () => {
      sessionManager.leaveSession();
      setSession(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.uid, profileReady]);
  
  // Update time remaining every second
  useEffect(() => {
    if (!session) return;
    
    const updateTime = () => {
      const remaining = sessionManager.getPhaseTimeRemaining();
      setTimeRemaining(remaining);
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [session, sessionManager]);
  
  // Submit phase helper - returns transition info from atomic operation
  const submitPhase = useCallback(
    async (phase: Phase, data: PhaseSubmissionData): Promise<{ transitioned: boolean; nextPhase?: Phase }> => {
      // Check if session manager is initialized
      if (!sessionManager || !sessionId || !user?.uid) {
        const error = new Error('Session not initialized');
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Cannot submit phase: Session not initialized', undefined, {
          hasSessionManager: !!sessionManager,
          hasSessionId: !!sessionId,
          hasUserId: !!user?.uid,
        });
        setError(error);
        throw error;
      }
      
      // Double-check session manager has sessionId and userId set
      if (!sessionManager.sessionId || !sessionManager.userId) {
        const error = new Error('Session manager not properly initialized');
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Session manager missing sessionId/userId', undefined, {
          sessionManagerSessionId: sessionManager.sessionId,
          sessionManagerUserId: sessionManager.userId,
        });
        setError(error);
        throw error;
      }
      
      try {
        return await sessionManager.submitPhase(phase, data);
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to submit phase', err);
        setError(err as Error);
        throw err;
      }
    },
    [sessionManager, sessionId, user?.uid]
  );
  
  // Check if user has submitted
  const hasSubmitted = useCallback(() => {
    return sessionManager.hasSubmittedCurrentPhase();
  }, [sessionManager]);
  
  // Get connected players
  const connectedPlayers = useCallback(() => {
    return sessionManager.getConnectedPlayers();
  }, [sessionManager]);
  
  // Get submission count
  const submissionCount = useCallback(() => {
    return sessionManager.getSubmissionCount();
  }, [sessionManager]);
  
  return {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
    connectedPlayers,
    submissionCount,
  };
}

/**
 * Hook specifically for finding or joining a session (used by matchmaking)
 */
export function useCreateSession() {
  const [sessionManager] = useState(() => new SessionManager());
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const findOrJoinSession = useCallback(
    async (
      userId: string,
      playerInfo: { displayName: string; avatar: string; rank: string },
      trait: string
    ) => {
      try {
        setIsCreating(true);
        setError(null);
        
        const session = await sessionManager.findOrJoinSession(userId, playerInfo, trait);
        
        setIsCreating(false);
        return session;
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to find or join session', err);
        setError(err as Error);
        setIsCreating(false);
        throw err;
      }
    },
    [sessionManager]
  );

  const addPlayerToSession = useCallback(
    async (
      sessionId: string,
      userId: string,
      playerInfo: { displayName: string; avatar: string; rank: string },
      isAI: boolean = false
    ) => {
      try {
        await sessionManager.addPlayerToSession(sessionId, userId, playerInfo, isAI);
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to add player to session', err);
        throw err;
      }
    },
    [sessionManager]
  );

  const startSession = useCallback(
    async (
      sessionId: string,
      promptId: string,
      promptType: string,
      phaseDuration: number,
      userRank?: string
    ) => {
      try {
        await sessionManager.startSession(sessionId, promptId, promptType, phaseDuration, userRank);
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to start session', err);
        throw err;
      }
    },
    [sessionManager]
  );

  // Legacy createSession for backward compatibility
  const createSession = useCallback(
    async (options: Parameters<SessionManager['createSession']>[0]) => {
      try {
        setIsCreating(true);
        setError(null);
        
        const session = await sessionManager.createSession(options);
        
        setIsCreating(false);
        return session;
      } catch (err) {
        logger.error(LOG_CONTEXTS.SESSION_MANAGER, 'Failed to create session', err);
        setError(err as Error);
        setIsCreating(false);
        throw err;
      }
    },
    [sessionManager]
  );
  
  return {
    findOrJoinSession,
    addPlayerToSession,
    startSession,
    createSession, // Legacy support
    isCreating,
    error,
  };
}

