'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/services/firestore';
import { calculateXPEarned } from '@/lib/utils/score-calculator';
import { getMedalEmoji } from '@/lib/utils/rank-utils';
import { rankPlayers, getPlayerRank } from '@/lib/utils/ranking-utils';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { useSearchParams, parseResultsSearchParams } from '@/lib/hooks/useSearchParams';
import { roundScore, clamp } from '@/lib/utils/math-utils';
import { getCurrentTimestamp } from '@/lib/utils/date-utils';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { AnalyzingState } from '@/components/shared/AnalyzingState';
import { ResultsLayout } from '@/components/shared/ResultsLayout';
import { PlayerCard } from '@/components/shared/PlayerCard';
import { generateMockQuickMatchResults } from '@/lib/utils/mock-data';

function ResultsContentInner() {
  const { user, refreshProfile } = useAuth();
  const params = useSearchParams(parseResultsSearchParams);
  const { trait, promptType, content, wordCount, aiScores } = params;
  const decodedContent = decodeURIComponent(content);
  const aiScoresArray = aiScores.split(',').map(Number);

  const [results, setResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { data: analysisData, loading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringifyJSON({ content: decodedContent, trait, promptType }) || '',
      });
      if (!response.ok) throw new Error('analysis failed');
      return await parseJSONResponse(response);
    },
    [decodedContent, trait, promptType],
    {
      onSuccess: async (data) => {
        const yourScore = data?.overallScore || clamp(60 + wordCount / 5 + Math.random() * 15, 40, 100);
        const allPlayers = generateMockQuickMatchResults(wordCount, aiScoresArray, yourScore);
        const rankings = rankPlayers(allPlayers, 'score').map(p => ({ ...p, rank: p.position }));
        const yourRank = getPlayerRank(rankings, user?.uid);
        const baseXP = calculateXPEarned(yourScore, 'quick-match');
        const placementBonus = (rankings.length - yourRank + 1) * 2;
        const xpEarned = baseXP + placementBonus;
        const pointsEarned = roundScore(yourScore) + (yourRank === 1 ? 25 : 0);
        const isVictory = yourRank === 1;

        if (user && data) {
          try {
            await saveWritingSession({ userId: user.uid, mode: 'quick-match', trait: trait || 'all', promptType: promptType || 'narrative', content: decodedContent, wordCount, score: roundScore(yourScore), traitScores: data.traits, xpEarned, pointsEarned, placement: yourRank, timestamp: getCurrentTimestamp() as any });
            await updateUserStatsAfterSession(user.uid, xpEarned, pointsEarned, undefined, isVictory, wordCount);
            await refreshProfile();
          } catch (error) { logger.error(LOG_CONTEXTS.QUICK_MATCH, 'Error saving Quick Match session', error); }
        }
        setTimeout(() => { setResults({ rankings, yourRank, xpEarned, pointsEarned, isVictory }); setIsAnalyzing(false); }, 1200);
      },
      onError: () => {
        const fallbackScore = clamp(60 + wordCount / 5, 40, 100);
        const allPlayers = generateMockQuickMatchResults(wordCount, aiScoresArray, fallbackScore);
        const rankings = rankPlayers(allPlayers, 'score').map(p => ({ ...p, rank: p.position }));
        const yourRank = getPlayerRank(rankings, user?.uid);
        setTimeout(() => { setResults({ rankings, yourRank, xpEarned: calculateXPEarned(fallbackScore, 'quick-match'), pointsEarned: roundScore(fallbackScore), isVictory: yourRank === 1 }); setIsAnalyzing(false); }, 1200);
      },
    }
  );

  if (isAnalyzing || !results) return <AnalyzingState message="Analyzing your draft" subtitle="Scoring your response against AI sparring partners." />;

  const actions = (
    <>
      <Link href="/quick-match" className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-center text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]">Play again</Link>
      <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-8 py-3 text-center text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Return to dashboard</Link>
    </>
  );

  return (
    <ResultsLayout actions={actions}>
      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <div className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-4xl">
            {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : '💪'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Quick match complete</h1>
            <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">You placed {getMedalEmoji(results.yourRank)} in a six-player lobby.</p>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
              <div className="text-[rgba(255,255,255,0.4)]">Placement</div>
              <div className="mt-2 font-mono text-xl font-medium">{getMedalEmoji(results.yourRank)}</div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
              <div className="text-[rgba(255,255,255,0.4)]">XP earned</div>
              <div className="mt-2 font-mono text-xl font-medium text-[#00e5e5]">+{results.xpEarned}</div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
              <div className="text-[rgba(255,255,255,0.4)]">Points earned</div>
              <div className="mt-2 font-mono text-xl font-medium text-[#00d492]">+{results.pointsEarned}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
          <header className="flex items-center justify-between">
            <div><h2 className="font-semibold">Scoreboard</h2><p className="text-xs text-[rgba(255,255,255,0.4)]">Higher scores reflect stronger draft execution.</p></div>
            <span className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)]">Trait focus: {trait || 'all'}</span>
          </header>
          <div className="mt-6 space-y-3">
            {results.rankings.map((player: any) => (<PlayerCard key={player.name} player={{ ...player, position: player.rank }} variant="ranking" showPosition showWordCount showScore />))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-sm text-[rgba(255,255,255,0.5)]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Next moves</div>
            <p className="mt-3">- Queue another quick match to build streaks and consistency.</p>
            <p className="mt-3">- Jump into ranked once you feel warmed up.</p>
            <p className="mt-3">- Log feedback on what worked well in this draft.</p>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-xs text-[rgba(255,255,255,0.5)]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Draft snapshot</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3"><div className="text-[rgba(255,255,255,0.4)]">Original words</div><div className="mt-1 font-medium">{wordCount}</div></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3"><div className="text-[rgba(255,255,255,0.4)]">Prompt type</div><div className="mt-1 font-medium capitalize">{promptType}</div></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3"><div className="text-[rgba(255,255,255,0.4)]">Trait lane</div><div className="mt-1 font-medium capitalize">{trait || 'all'}</div></div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Your draft</div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">{decodeURIComponent(content) || 'Draft content unavailable.'}</p>
      </section>
      <p className="text-center text-xs text-[rgba(255,255,255,0.4)]">Review your scores, then decide if you want another run.</p>
    </ResultsLayout>
  );
}

export default function ResultsContent() {
  return (<Suspense fallback={<AnalyzingState />}><ResultsContentInner /></Suspense>);
}
