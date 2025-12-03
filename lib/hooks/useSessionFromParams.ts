import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameSession } from '@/lib/types/session';
import { useSession } from './useSession';
import { getMatchState } from '@/lib/utils/firestore-match-state';

/**
 * Hook to fetch session from multiple sources:
 * 1. Prop (if provided)
 * 2. URL params (sessionId)
 * 3. MatchState (if matchId provided but no sessionId)
 * 
 * @param sessionProp - Optional session prop passed to component
 * @returns Session object or null
 */
export function useSessionFromParams(sessionProp?: GameSession | null) {
  const searchParams = useSearchParams();
  
  // Get sessionId from URL params or matchId
  const sessionIdFromParams = searchParams?.get('sessionId') || '';
  const matchIdFromParams = searchParams?.get('matchId') || '';
  
  // Try to get sessionId from matchState if we have matchId but no sessionId
  const [sessionIdFromMatch, setSessionIdFromMatch] = useState<string>('');
  const loadingRef = useRef(false);
  
  useEffect(() => {
    const fetchSessionIdFromMatch = async () => {
      // Use ref to prevent re-triggering and check if we already have sessionId
      if (matchIdFromParams && !sessionIdFromParams && !sessionProp && !loadingRef.current && !sessionIdFromMatch) {
        loadingRef.current = true;
        try {
          const matchState = await getMatchState(matchIdFromParams);
          if (matchState?.sessionId) {
            console.log('📋 SESSION FROM PARAMS - Found sessionId from matchState:', matchState.sessionId);
            setSessionIdFromMatch(matchState.sessionId);
          }
        } catch (error) {
          console.error('❌ SESSION FROM PARAMS - Failed to get sessionId from matchState:', error);
        } finally {
          loadingRef.current = false;
        }
      }
    };
    fetchSessionIdFromMatch();
  }, [matchIdFromParams, sessionIdFromParams, sessionProp, sessionIdFromMatch]);
  
  // Use sessionId from params, matchState, or null
  const finalSessionId = sessionIdFromParams || sessionIdFromMatch;
  const { session: sessionFromHook } = useSession(finalSessionId || null);
  
  // Prefer prop, then hook, then null
  const session = sessionProp || sessionFromHook;
  
  return {
    session,
    sessionId: finalSessionId,
    matchId: matchIdFromParams,
    isLoading: loadingRef.current,
  };
}

