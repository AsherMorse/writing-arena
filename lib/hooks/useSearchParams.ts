import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Type-safe URL parameter parsing hook
 * Provides a cleaner API for parsing search parameters with type safety
 */
export function useSearchParams<T>(
  parser: (params: URLSearchParams) => T
): T {
  const searchParams = useNextSearchParams();
  return useMemo(() => parser(searchParams), [searchParams, parser]);
}

/**
 * Helper function to parse common results page parameters
 */
export function parseResultsSearchParams(searchParams: URLSearchParams) {
  return {
    trait: searchParams.get('trait'),
    promptType: searchParams.get('promptType'),
    content: searchParams.get('content') || '',
    wordCount: parseInt(searchParams.get('wordCount') || '0', 10),
    aiScores: searchParams.get('aiScores') || '0,0,0,0',
    matchId: searchParams.get('matchId') || '',
    promptId: searchParams.get('promptId'),
  };
}

