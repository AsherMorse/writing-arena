/**
 * Navigation Hook
 * 
 * Provides type-safe navigation utilities for common routes.
 * Wraps Next.js router with consistent patterns and error handling.
 * 
 * @example
 * ```typescript
 * const { navigateToDashboard, navigateToSession, navigateToResults } = useNavigation();
 * 
 * navigateToDashboard();
 * navigateToSession(sessionId);
 * navigateToResults({ matchId, trait, ... });
 * ```
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { buildResultsURL, ResultsURLParams } from '@/lib/utils/navigation';

export function useNavigation() {
  const router = useRouter();

  const navigateToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const navigateToAuth = useCallback((redirect?: string) => {
    const url = redirect ? `/auth?redirect=${encodeURIComponent(redirect)}` : '/auth';
    router.push(url);
  }, [router]);

  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const navigateToSession = useCallback((sessionId: string) => {
    router.push(`/session/${sessionId}`);
  }, [router]);

  const navigateToRanked = useCallback(() => {
    router.push('/ranked');
  }, [router]);

  const navigateToRankedMatchmaking = useCallback((trait: string = 'all') => {
    router.push(`/ranked/matchmaking?trait=${trait}`);
  }, [router]);

  const navigateToRankedResults = useCallback((sessionId: string) => {
    router.push(`/ranked/results?sessionId=${sessionId}`);
  }, [router]);

  const navigateToRankedPhaseRankings = useCallback((sessionId: string) => {
    router.push(`/ranked/phase-rankings?sessionId=${sessionId}`);
  }, [router]);

  const navigateToResults = useCallback((params: ResultsURLParams) => {
    router.push(buildResultsURL(params));
  }, [router]);

  const navigateToQuickMatch = useCallback(() => {
    router.push('/quick-match');
  }, [router]);

  const navigateToQuickMatchMatchmaking = useCallback((trait: string = 'all') => {
    router.push(`/quick-match/matchmaking?trait=${trait}`);
  }, [router]);

  const navigateToQuickMatchSession = useCallback((trait: string, promptType: string) => {
    router.push(`/quick-match/session?trait=${trait}&promptType=${promptType}`);
  }, [router]);

  const navigateToQuickMatchResults = useCallback((params: {
    trait: string;
    promptType: string;
    content: string;
    wordCount: number;
    aiScores: string;
  }) => {
    const queryParams = new URLSearchParams({
      trait: params.trait,
      promptType: params.promptType,
      content: encodeURIComponent(params.content),
      wordCount: params.wordCount.toString(),
      aiScores: params.aiScores,
    });
    router.push(`/quick-match/results?${queryParams.toString()}`);
  }, [router]);

  const navigateToPractice = useCallback(() => {
    router.push('/practice');
  }, [router]);

  const navigateToImprove = useCallback(() => {
    router.push('/improve');
  }, [router]);

  const navigateToAPLang = useCallback(() => {
    router.push('/ap-lang');
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateReplace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  return {
    // Common routes
    navigateToDashboard,
    navigateToAuth,
    navigateToHome,
    navigateBack,
    navigateReplace,
    
    // Ranked routes
    navigateToRanked,
    navigateToRankedMatchmaking,
    navigateToRankedResults,
    navigateToRankedPhaseRankings,
    navigateToResults,
    
    // Session routes
    navigateToSession,
    
    // Quick match routes
    navigateToQuickMatch,
    navigateToQuickMatchMatchmaking,
    navigateToQuickMatchSession,
    navigateToQuickMatchResults,
    
    // Other routes
    navigateToPractice,
    navigateToImprove,
    navigateToAPLang,
    
    // Direct router access for custom navigation
    router,
  };
}

