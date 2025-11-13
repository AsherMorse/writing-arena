'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/firestore';

function QuickMatchResultsContent() {
  const searchParams = useSearchParams();
  const { user, refreshProfile } = useAuth();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = parseInt(searchParams.get('wordCount') || '0');
  const aiScoresParam = searchParams.get('aiScores') || '0,0,0,0';

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const analyzeMatch = async () => {
      try {
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: decodeURIComponent(content),
            trait,
            promptType,
          }),
        });

        const data = await response.ok ? await response.json() : null;
        const yourScore = data?.overallScore || Math.min(Math.max(60 + wordCount / 5 + Math.random() * 15, 40), 100);
        const aiScores = aiScoresParam.split(',').map(Number);

        const rankings = [
          { name: 'You', avatar: '🌿', score: Math.round(yourScore), wordCount, isYou: true, rank: 0 },
          { name: 'WriteBot', avatar: '🤖', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0], isYou: false, rank: 0 },
          { name: 'PenPal AI', avatar: '✍️', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1], isYou: false, rank: 0 },
          { name: 'WordSmith', avatar: '📝', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2], isYou: false, rank: 0 },
          { name: 'QuillMaster', avatar: '🖋️', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3], isYou: false, rank: 0 },
        ]
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({ ...player, rank: index + 1 }));

        const yourRank = rankings.find(p => p.isYou)?.rank || 5;
        const xpEarned = Math.round(yourScore * 1.5) + (rankings.length - yourRank + 1) * 8;
        const pointsEarned = Math.round(yourScore) + (yourRank === 1 ? 25 : 0);
        const isVictory = yourRank === 1;

        if (user && data) {
          try {
            await saveWritingSession({
              userId: user.uid,
              mode: 'quick-match',
              trait: trait || 'all',
              promptType: promptType || 'narrative',
              content: decodeURIComponent(content),
              wordCount,
              score: Math.round(yourScore),
              traitScores: data.traits,
              xpEarned,
              pointsEarned,
              placement: yourRank,
              timestamp: new Date() as any,
            });

            await updateUserStatsAfterSession(user.uid, xpEarned, pointsEarned, undefined, isVictory, wordCount);
            await refreshProfile();
          } catch (error) {
            console.error('Error saving Quick Match session:', error);
          }
        }

        setResults({ rankings, yourRank, xpEarned, pointsEarned, isVictory });
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing Quick Match:', error);
        const fallbackScore = Math.min(Math.max(60 + wordCount / 5, 40), 100);
        const aiScores = aiScoresParam.split(',').map(Number);
        const rankings = [
          { name: 'You', avatar: '🌿', score: Math.round(fallbackScore), wordCount, isYou: true, rank: 0 },
          { name: 'WriteBot', avatar: '🤖', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0], isYou: false, rank: 0 },
          { name: 'PenPal AI', avatar: '✍️', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1], isYou: false, rank: 0 },
          { name: 'WordSmith', avatar: '📝', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2], isYou: false, rank: 0 },
          { name: 'QuillMaster', avatar: '🖋️', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3], isYou: false, rank: 0 },
        ]
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({ ...player, rank: index + 1 }));

        const yourRank = rankings.find(p => p.isYou)?.rank || 5;
        setResults({ rankings, yourRank, xpEarned: Math.round(fallbackScore * 1.5), pointsEarned: Math.round(fallbackScore), isVictory: yourRank === 1 });
        setIsAnalyzing(false);
      }
    };

    analyzeMatch();
  }, [wordCount, aiScoresParam, trait, promptType, content, user, refreshProfile]);

  if (isAnalyzing || !results) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#141e27] text-4xl">🤖</div>
          <h2 className="text-2xl font-semibold">Analyzing your draft</h2>
          <p className="text-sm text-white/60">Scoring your response against AI sparring partners.</p>
          <div className="flex gap-2">
            {[0, 150, 300].map(delay => (
              <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="flex flex-col gap-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#0c141d] text-4xl">
              {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : '💪'}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Quick match complete</h1>
              <p className="mt-2 text-sm text-white/60">You placed {getMedalEmoji(results.yourRank)} in a six-player lobby.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-white/50">Placement</div>
                <div className="mt-2 text-2xl font-semibold text-white">{getMedalEmoji(results.yourRank)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-white/50">XP earned</div>
                <div className="mt-2 text-2xl font-semibold text-white">+{results.xpEarned}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-white/50">Points earned</div>
                <div className="mt-2 text-2xl font-semibold text-white">+{results.pointsEarned}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Scoreboard</h2>
                <p className="text-xs text-white/50">Higher scores reflect stronger draft execution.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">Trait focus: {trait || 'all'}</span>
            </header>
            <div className="mt-6 space-y-3">
              {results.rankings.map((player: any) => (
                <div
                  key={player.name}
                  className={`rounded-2xl border px-5 py-4 transition ${
                    player.isYou ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold ${
                        player.rank === 1
                          ? 'bg-yellow-400 text-[#0c141d]'
                          : player.rank === 2
                          ? 'bg-white/80 text-[#0c141d]'
                          : player.rank === 3
                          ? 'bg-orange-300 text-[#0c141d]'
                          : 'bg-white/10 text-white/60'
                      }`}
                      >
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{player.avatar}</span>
                        <div>
                          <div className={`text-sm font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.name}</div>
                          <div className="text-xs text-white/50">{player.wordCount} words</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.score}</div>
                      <div className="text-xs text-white/50">score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Next moves</div>
              <p className="mt-3">- Queue another quick match to build streaks and consistency.</p>
              <p className="mt-3">- Jump into ranked once you feel warmed up.</p>
              <p className="mt-3">- Log feedback on what worked well in this draft.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Draft snapshot</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/40">Original words</div>
                  <div className="mt-1 text-white font-semibold">{wordCount}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/40">Prompt type</div>
                  <div className="mt-1 text-white font-semibold capitalize">{promptType}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/40">Trait lane</div>
                  <div className="mt-1 text-white font-semibold capitalize">{trait || 'all'}</div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Your draft</div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {decodeURIComponent(content) || 'Draft content unavailable.'}
          </p>
        </section>

        <section className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/quick-match"
            className="rounded-full border border-emerald-200/40 bg-emerald-400 px-8 py-3 text-center text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
          >
            Play again
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Return to dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}

export default function QuickMatchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading results...
      </div>
    }>
      <QuickMatchResultsContent />
    </Suspense>
  );
}

