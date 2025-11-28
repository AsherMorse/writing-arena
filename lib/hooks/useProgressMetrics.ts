import { useMemo } from 'react';
import { WritingSession } from '@/lib/services/firestore';

interface ProgressMetrics {
  avgScores: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  overallAvg: number;
  trend: 'improving' | 'declining' | 'stable';
  trendDiff: number;
}

export function useProgressMetrics(rankedMatches: WritingSession[]): ProgressMetrics | null {
  return useMemo(() => {
    if (rankedMatches.length === 0) return null;

    const avgScores = {
      content: rankedMatches.reduce((sum, m) => sum + m.traitScores.content, 0) / rankedMatches.length,
      organization: rankedMatches.reduce((sum, m) => sum + m.traitScores.organization, 0) / rankedMatches.length,
      grammar: rankedMatches.reduce((sum, m) => sum + m.traitScores.grammar, 0) / rankedMatches.length,
      vocabulary: rankedMatches.reduce((sum, m) => sum + m.traitScores.vocabulary, 0) / rankedMatches.length,
      mechanics: rankedMatches.reduce((sum, m) => sum + m.traitScores.mechanics, 0) / rankedMatches.length,
    };

    const overallAvg = rankedMatches.reduce((sum, m) => sum + m.score, 0) / rankedMatches.length;
    const firstHalf = rankedMatches.slice(0, 2);
    const lastHalf = rankedMatches.slice(-2);
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length;
    const lastHalfAvg = lastHalf.reduce((sum, m) => sum + m.score, 0) / lastHalf.length;
    const trend = lastHalfAvg > firstHalfAvg ? 'improving' : lastHalfAvg < firstHalfAvg ? 'declining' : 'stable';

    return {
      avgScores,
      overallAvg,
      trend,
      trendDiff: Math.abs(lastHalfAvg - firstHalfAvg),
    };
  }, [rankedMatches]);
}

