'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Mock feedback based on The Writing Revolution concepts
const MOCK_PHASE_FEEDBACK = {
  writing: {
    strengths: [
      'Clear topic sentence establishes the main idea.',
      'Effective transition language keeps the draft moving.',
      'Concrete details show rather than tell.',
    ],
    improvements: [
      'Try sentence expansion with because/but/so to deepen reasoning.',
      'Add sensory detail to ground the reader in the setting.',
      'Introduce an appositive to enrich description.',
    ],
    writingRevConcepts: [
      'Sentence expansion',
      'Note-taking before drafting',
      'Single paragraph outline (topic + evidence + close)',
    ],
  },
  feedback: {
    strengths: [
      'Highlighted specific strengths from the peer draft.',
      'Suggestions were constructive and actionable.',
      'Called out organization in a helpful way.',
    ],
    improvements: [
      'Reference exact sentences when praising strengths.',
      'Tie comments back to Writing Revolution strategies.',
      'Offer concrete revision moves instead of general advice.',
    ],
    writingRevConcepts: [
      'Analyze sentence structure for fragments/run-ons.',
      'Check transitions for logical flow.',
      'Evaluate paragraph structure: topic, evidence, wrap-up.',
    ],
  },
  revision: {
    strengths: [
      'Applied peer suggestions by adding specific detail.',
      'Improved sentence variety and rhythm.',
      'Stronger transitions between key ideas.',
    ],
    improvements: [
      'Combine short sentences where ideas connect.',
      'Add subordinating conjunctions (although, since, while).',
      'Use appositives to pack more information into a sentence.',
    ],
    writingRevConcepts: [
      'Revision vs. editing: ideas first, polish later.',
      'Sentence combining to tighten prose.',
      'Use FANBOYS and subordinators to connect ideas.',
    ],
  },
} as const;

function RankedResultsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');
  const originalContent = searchParams.get('originalContent') || '';
  const revisedContent = searchParams.get('revisedContent') || '';
  const wordCount = parseInt(searchParams.get('wordCount') || '0');
  const revisedWordCount = parseInt(searchParams.get('revisedWordCount') || '0');
  const aiScoresParam = searchParams.get('aiScores') || '0,0,0,0';
  const writingScore = parseFloat(searchParams.get('writingScore') || '75');
  const feedbackScore = parseFloat(searchParams.get('feedbackScore') || '80');
  const revisionScore = parseFloat(searchParams.get('revisionScore') || '78');
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [activePhase, setActivePhase] = useState<'writing' | 'feedback' | 'revision'>('writing');

  useEffect(() => {
    const analyzeRankedMatch = async () => {
      try {
        const yourCompositeScore = (writingScore * 0.4) + (feedbackScore * 0.3) + (revisionScore * 0.3);
        const aiScores = aiScoresParam.split(',').map(Number);
        const aiPlayers = [
          {
            name: 'ProWriter99',
            avatar: '🎯',
            rank: 'Silver II',
            phase1: Math.round(65 + Math.random() * 25),
            phase2: Math.round(70 + Math.random() * 20),
            phase3: Math.round(75 + Math.random() * 15),
            wordCount: aiScores[0],
          },
          {
            name: 'WordMaster',
            avatar: '📖',
            rank: 'Silver III',
            phase1: Math.round(60 + Math.random() * 30),
            phase2: Math.round(65 + Math.random() * 25),
            phase3: Math.round(70 + Math.random() * 20),
            wordCount: aiScores[1],
          },
          {
            name: 'EliteScribe',
            avatar: '✨',
            rank: 'Silver II',
            phase1: Math.round(70 + Math.random() * 20),
            phase2: Math.round(75 + Math.random() * 15),
            phase3: Math.round(65 + Math.random() * 25),
            wordCount: aiScores[2],
          },
          {
            name: 'PenChampion',
            avatar: '🏅',
            rank: 'Silver IV',
            phase1: Math.round(55 + Math.random() * 30),
            phase2: Math.round(60 + Math.random() * 25),
            phase3: Math.round(70 + Math.random() * 20),
            wordCount: aiScores[3],
          },
        ];

        const allPlayers = [
          {
            name: 'You',
            avatar: '🌿',
            rank: 'Silver III',
            phase1: Math.round(writingScore),
            phase2: Math.round(feedbackScore),
            phase3: Math.round(revisionScore),
            compositeScore: Math.round(yourCompositeScore),
            wordCount,
            revisedWordCount,
            isYou: true,
            position: 0,
          },
          ...aiPlayers.map(player => ({
            ...player,
            compositeScore: Math.round((player.phase1 * 0.4) + (player.phase2 * 0.3) + (player.phase3 * 0.3)),
            isYou: false,
            position: 0,
          })),
        ];

        const rankings = allPlayers
          .sort((a, b) => b.compositeScore - a.compositeScore)
          .map((player, index) => ({ ...player, position: index + 1 }));

        const yourRank = rankings.find(p => p.isYou)?.position || 5;
        const lpChange = yourRank === 1 ? 35 : yourRank === 2 ? 22 : yourRank === 3 ? 12 : yourRank === 4 ? -5 : -15;
        const xpEarned = Math.round(yourCompositeScore * 2.5);
        const pointsEarned = Math.round(yourCompositeScore * 2) + (yourRank === 1 ? 30 : yourRank === 2 ? 15 : 0);
        const improvementBonus = Math.max(0, revisionScore - writingScore);

        if (user) {
          console.log('Mock save ranked session', {
            userId: user.uid,
            mode: 'ranked',
            score: Math.round(yourCompositeScore),
            xpEarned,
            pointsEarned,
            lpChange,
            placement: yourRank,
          });
        }

        setResults({
          rankings,
          yourRank,
          lpChange,
          xpEarned,
          pointsEarned,
          isVictory: yourRank === 1,
          improvementBonus: Math.round(improvementBonus),
          phases: {
            writing: Math.round(writingScore),
            feedback: Math.round(feedbackScore),
            revision: Math.round(revisionScore),
            composite: Math.round(yourCompositeScore),
          },
        });
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing ranked match', error);
        setIsAnalyzing(false);
      }
    };

    analyzeRankedMatch();
  }, [wordCount, aiScoresParam, writingScore, feedbackScore, revisionScore, user]);

  if (isAnalyzing || !results) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[#141e27] text-4xl">🏆</div>
          <h2 className="text-2xl font-semibold">Calculating match results</h2>
          <p className="text-sm text-white/60">We are combining draft, feedback, and revision scores into your composite rank.</p>
          <div className="flex gap-2">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className="h-2 w-2 animate-bounce rounded-full bg-emerald-300"
                style={{ animationDelay: `${delay}ms` }}
              />
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

  const phaseMeta = {
    writing: { label: 'Draft', weight: '40%', icon: '📝' },
    feedback: { label: 'Peer feedback', weight: '30%', icon: '🔍' },
    revision: { label: 'Revision', weight: '30%', icon: '✏️' },
  } as const;

  const activeFeedback = MOCK_PHASE_FEEDBACK[activePhase];

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Link
            href="/ranked"
            className="rounded-full border border-emerald-200/40 bg-emerald-400 px-8 py-3 text-center text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
          >
            Queue another ranked match
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Return to dashboard
          </Link>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c141d] text-3xl">
                {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : results.lpChange >= 0 ? '💪' : '🔥'}
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Ranked circuit</div>
                <h1 className="mt-2 text-3xl font-semibold">
                  {results.isVictory ? 'Victory secured' : results.yourRank <= 3 ? 'Strong finish' : results.lpChange >= 0 ? 'Solid recovery' : 'Battle complete'}
                </h1>
                <p className="mt-2 text-sm text-white/60">Placement: {getMedalEmoji(results.yourRank)} · Composite {results.phases.composite}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <div className="text-white/50">LP change</div>
                <div className={`mt-2 text-2xl font-semibold ${results.lpChange >= 0 ? 'text-emerald-200' : 'text-red-300'}`}>
                  {results.lpChange >= 0 ? '+' : ''}{results.lpChange} LP
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <div className="text-white/50">XP earned</div>
                <div className="mt-2 text-2xl font-semibold text-white">+{results.xpEarned}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <div className="text-white/50">Points earned</div>
                <div className="mt-2 text-2xl font-semibold text-white">+{results.pointsEarned}</div>
              </div>
            </div>
            {results.improvementBonus > 0 && (
              <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                Revision bonus: +{results.improvementBonus} points compared to draft.
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <h2 className="text-lg font-semibold">Phase breakdown</h2>
            <p className="mt-2 text-xs text-white/50">Each phase contributes to your composite score. Tap to review targeted coaching.</p>
            <div className="mt-6 space-y-3">
              {(Object.keys(phaseMeta) as Array<'writing' | 'feedback' | 'revision'>).map(key => (
                <button
                  key={key}
                  onClick={() => setActivePhase(key)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    activePhase === key
                      ? 'border-emerald-300/40 bg-emerald-400/10'
                      : 'border-white/10 bg-white/5 hover:border-emerald-200/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c141d] text-lg">
                      {phaseMeta[key].icon}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{phaseMeta[key].label}</div>
                      <div className="text-xs text-white/50">Weight: {phaseMeta[key].weight}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-white">{results.phases[key]}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
              Trait focus: {trait || 'all'} · Prompt type: {promptType || 'n/a'}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Final rankings</h2>
                <p className="text-xs text-white/50">Composite scores across all three phases.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {results.rankings.length} competitors
              </span>
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
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold ${
                        player.position === 1
                          ? 'bg-yellow-400 text-[#0c141d]'
                          : player.position === 2
                          ? 'bg-white/80 text-[#0c141d]'
                          : player.position === 3
                          ? 'bg-orange-300 text-[#0c141d]'
                          : 'bg-white/10 text-white/60'
                      }`}
                      >
                        {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : `#${player.position}`}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{player.avatar}</span>
                        <div>
                          <div className={`text-sm font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.name}</div>
                          <div className="text-xs text-white/50">{player.rank}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>{player.compositeScore}</div>
                      <div className="text-xs text-white/50">composite</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-[#0c141d] px-4 py-3 text-center text-xs text-white/60">
                    <div>
                      <div>Draft</div>
                      <div className="mt-1 text-sm font-semibold text-white">{player.phase1}</div>
                    </div>
                    <div>
                      <div>Feedback</div>
                      <div className="mt-1 text-sm font-semibold text-white">{player.phase2}</div>
                    </div>
                    <div>
                      <div>Revision</div>
                      <div className="mt-1 text-sm font-semibold text-white">{player.phase3}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <header className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d]">
                  {phaseMeta[activePhase].icon}
                </span>
                <div>
                  <div>{phaseMeta[activePhase].label} coaching</div>
                  <div className="text-xs text-white/50">Weight {phaseMeta[activePhase].weight}</div>
                </div>
              </header>
              <div className="mt-6 space-y-5 text-sm text-white/70">
                <div>
                  <div className="text-xs uppercase text-emerald-200">Strengths</div>
                  <ul className="mt-2 space-y-1">
                    {activeFeedback.strengths.map((item, index) => (
                      <li key={index}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase text-yellow-300">Improve next time</div>
                  <ul className="mt-2 space-y-1">
                    {activeFeedback.improvements.map((item, index) => (
                      <li key={index}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <div className="text-white/70">Writing Revolution cues:</div>
                  <ul className="mt-2 space-y-1 text-white/60">
                    {activeFeedback.writingRevConcepts.map((item, index) => (
                      <li key={index}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 text-xs text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Draft vs. Revision</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Original words</span>
                  <span className="font-semibold text-white">{wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Revised words</span>
                  <span className="font-semibold text-white">{revisedWordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Change</span>
                  <span className={`${revisedWordCount - wordCount >= 0 ? 'text-emerald-200' : 'text-white/50'} font-semibold`}>
                    {revisedWordCount - wordCount >= 0 ? '+' : ''}{revisedWordCount - wordCount}
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                <div className="text-white/60">Prompt recap</div>
                <p className="mt-2 text-xs">
                  Continue iterating on this prompt to solidify gains, or queue another ranked match to push momentum.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="flex flex-col gap-4 text-sm text-white/60">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Original draft</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                  {originalContent || 'Original draft unavailable.'}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Revised submission</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
                  {revisedContent || 'Revision unavailable.'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <p className="text-center text-xs text-white/50 sm:text-left">
            Review the breakdown above before jumping into your next match.
          </p>
        </section>
      </main>
    </div>
  );
}

export default function RankedResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading results...
      </div>
    }>
      <RankedResultsContent />
    </Suspense>
  );
}
