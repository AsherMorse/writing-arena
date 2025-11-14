import { useState, useEffect, useCallback } from 'react';
import { SessionManager } from '../services/session-manager';
import { GameSession, PlayerInfo, PhaseSubmissionData, Phase } from '../types/session';
import { useAuth } from '@/contexts/AuthContext';

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
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Initialize session
  useEffect(() => {
    if (!user || !userProfile || !sessionId) return;
    
    const init = async () => {
      try {
        setIsReconnecting(true);
        setError(null);
        
        const playerInfo: PlayerInfo = {
          displayName: userProfile.displayName,
          avatar: typeof userProfile.avatar === 'string' ? userProfile.avatar : '🌿',
          rank: userProfile.currentRank || 'Silver III',
        };
        
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
          console.log('📍 HOOK - Phase transition:', newPhase);
        });
        
        sessionManager.on('onAllPlayersReady', () => {
          console.log('✅ HOOK - All players ready!');
        });
        
        sessionManager.on('onSessionError', (err) => {
          console.error('❌ HOOK - Session error:', err);
          setError(err);
        });
        
      } catch (err) {
        console.error('❌ HOOK - Failed to join session:', err);
        setError(err as Error);
        setIsReconnecting(false);
      }
    };
    
    init();
    
    // Cleanup on unmount
    return () => {
      sessionManager.leaveSession();
    };
  }, [sessionId, user, userProfile]);
  
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
  
  // Submit phase helper
  const submitPhase = useCallback(
    async (phase: Phase, data: PhaseSubmissionData) => {
      try {
        await sessionManager.submitPhase(phase, data);
      } catch (err) {
        console.error('❌ HOOK - Failed to submit phase:', err);
        setError(err as Error);
        throw err;
      }
    },
    [sessionManager]
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
 * Hook specifically for creating a new session (used by matchmaking)
 */
export function useCreateSession() {
  const [sessionManager] = useState(() => new SessionManager());
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createSession = useCallback(
    async (options: Parameters<SessionManager['createSession']>[0]) => {
      try {
        setIsCreating(true);
        setError(null);
        
        const session = await sessionManager.createSession(options);
        
        setIsCreating(false);
        return session;
      } catch (err) {
        console.error('❌ HOOK - Failed to create session:', err);
        setError(err as Error);
        setIsCreating(false);
        throw err;
      }
    },
    [sessionManager]
  );
  
  return {
    createSession,
    isCreating,
    error,
  };
}

