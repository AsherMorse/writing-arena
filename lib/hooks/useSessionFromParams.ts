import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameSession } from '@/lib/types/session';
import { useSession } from './useSession';
import { getMatchState } from '@/lib/utils/firestore-match-state';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

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
  const [matchIdForSessionId, setMatchIdForSessionId] = useState<string>('');
  const loadingRef = useRef(false);
  const currentFetchingMatchIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const fetchSessionIdFromMatch = async () => {
      // Check if we need to fetch (either no sessionId yet, or it's for a different match)
      const needsFetch = matchIdFromParams && !sessionIdFromParams && !sessionProp && 
                         !loadingRef.current && matchIdFromParams !== matchIdForSessionId;
      
      if (needsFetch) {
        loadingRef.current = true;
        currentFetchingMatchIdRef.current = matchIdFromParams;
        const fetchingMatchId = matchIdFromParams;
        
        try {
          const matchState = await getMatchState(matchIdFromParams);
          
          // Only update state if the matchId hasn't changed during the fetch
          if (currentFetchingMatchIdRef.current === fetchingMatchId && matchState?.sessionId) {
            logger.debug(LOG_CONTEXTS.SESSION_FROM_PARAMS, 'Found sessionId from matchState', matchState.sessionId);
            setSessionIdFromMatch(matchState.sessionId);
            setMatchIdForSessionId(fetchingMatchId);
          }
        } catch (error) {
          logger.error(LOG_CONTEXTS.SESSION_FROM_PARAMS, 'Failed to get sessionId from matchState', error);
        } finally {
          // Only reset loading if this is still the active fetch
          if (currentFetchingMatchIdRef.current === fetchingMatchId) {
            loadingRef.current = false;
          }
        }
      }
    };
    fetchSessionIdFromMatch();
    
    // Cleanup: reset refs when matchIdFromParams changes to allow new fetches
    return () => {
      currentFetchingMatchIdRef.current = null;
      loadingRef.current = false;
    };
  }, [matchIdFromParams, sessionIdFromParams, sessionProp, matchIdForSessionId]);
  
  // Use sessionId from params, matchState, or null
  const finalSessionId = sessionIdFromParams || sessionIdFromMatch;
  const { session: sessionFromHook } = useSession(finalSessionId || null);
  
  // Prefer prop, then hook, then null
  const session = sessionProp || sessionFromHook;
  
  return {
    session,
    sessionId: finalSessionId,
    matchId: matchIdFromParams,
  };
}

