'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Mock feedback based on The Writing Revolution concepts
const MOCK_PHASE_FEEDBACK = {
  writing: {
    strengths: [
      'Clear topic sentence establishes the main idea',
      'Good use of transition words (First, Then, Finally)',
      'Concrete details support your points'
    ],
    improvements: [
      'Try expanding sentences with because/but/so to show deeper thinking',
      'Add more specific details - use the five senses (what did you see, hear, feel?)',
      'Consider using an appositive to add description (e.g., "The lighthouse, an ancient stone tower, stood...")'
    ],
    writingRevConcepts: [
      'Sentence expansion: Practice combining short sentences',
      'Note-taking: Organize ideas before writing',
      'Single Paragraph Outline (SPO): Use topic sentence + supporting details + conclusion'
    ]
  },
  feedback: {
    strengths: [
      'You identified specific strengths in your peer\'s writing',
      'Suggestions were constructive and actionable',
      'Good attention to organization and structure'
    ],
    improvements: [
      'Be more specific about which sentences worked well and why',
      'Reference Writing Revolution strategies (sentence combining, transitions)',
      'Suggest concrete revision strategies, not just general comments'
    ],
    writingRevConcepts: [
      'Analyzing sentence structure: Look for fragments or run-ons',
      'Evaluating transitions: Check if ideas connect logically',
      'Assessing paragraph structure: Topic sentence + evidence + conclusion'
    ]
  },
  revision: {
    strengths: [
      'Applied peer feedback by adding descriptive details',
      'Improved sentence variety and complexity',
      'Better use of transitional phrases'
    ],
    improvements: [
      'Could combine more short sentences for better flow',
      'Add subordinating conjunctions (although, since, while) for complexity',
      'Use appositives to add information without new sentences'
    ],
    writingRevConcepts: [
      'Revision vs. Editing: Focus on ideas first, grammar later',
      'Sentence combining: Join related ideas',
      'Adding conjunctions: Use FANBOYS (for, and, nor, but, or, yet, so) and subordinating conjunctions'
    ]
  }
};

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
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  useEffect(() => {
    const analyzeRankedMatch = async () => {
      try {
        // Calculate composite score from all 3 phases
        const yourCompositeScore = (writingScore * 0.4) + (feedbackScore * 0.3) + (revisionScore * 0.3);
        
        // Generate mock scores for AI players across all 3 phases
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

        // Calculate composite scores for AI players
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
          }))
        ];

        // Sort by composite score and assign positions
        const rankings = allPlayers
          .sort((a, b) => b.compositeScore - a.compositeScore)
          .map((player, index) => ({ ...player, position: index + 1 }));

        const yourRank = rankings.find(p => p.isYou)?.position || 5;
        
        // LP calculation based on final placement
        const lpChange = 
          yourRank === 1 ? 35 : 
          yourRank === 2 ? 22 : 
          yourRank === 3 ? 12 : 
          yourRank === 4 ? -5 : -15;
        
        // XP based on performance across all phases
        const xpEarned = Math.round(yourCompositeScore * 2.5); // 2.5x for ranked
        const pointsEarned = Math.round(yourCompositeScore * 2) + (yourRank === 1 ? 30 : yourRank === 2 ? 15 : 0);
        const isVictory = yourRank === 1;

        // Calculate improvement from original to revision
        const improvementBonus = Math.max(0, revisionScore - writingScore);

        // MOCK: Skip Firebase calls for now
        if (user) {
          console.log('Mock: Would save session data:', {
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
          isVictory,
          improvementBonus: Math.round(improvementBonus),
          phases: {
            writing: Math.round(writingScore),
            feedback: Math.round(feedbackScore),
            revision: Math.round(revisionScore),
            composite: Math.round(yourCompositeScore),
          }
        });
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing Ranked Match:', error);
        setIsAnalyzing(false);
      }
    };

    analyzeRankedMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount, aiScoresParam, trait, promptType, writingScore, feedbackScore, revisionScore]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-3">Analyzing Complete Battle...</h2>
          <p className="text-white/60 text-lg mb-6">Calculating scores across all 3 phases</p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">✍️</span>
              </div>
              <span className="text-xl font-bold text-white">Writing Arena</span>
            </div>
            <Link 
              href="/dashboard"
              className="text-white/60 hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-bounce">
            {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : results.lpChange >= 0 ? '💪' : '😔'}
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            {results.isVictory ? 'Victory!' : results.yourRank <= 3 ? 'Great Job!' : results.lpChange >= 0 ? 'Match Complete!' : 'Keep Improving!'}
          </h1>
          <p className="text-xl text-white/70 mb-2">
            You placed {getMedalEmoji(results.yourRank)} in your ranked party
          </p>
          <p className="text-white/60">
            Performance evaluated across Writing, Peer Feedback, and Revision
          </p>
        </div>

        {/* Phase Breakdown - Clickable */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Performance</h2>
          <p className="text-white/80 text-center mb-6 text-sm">Click on each phase to review detailed feedback</p>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setExpandedPhase(expandedPhase === 'writing' ? null : 'writing')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                expandedPhase === 'writing' ? 'border-purple-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-purple-300 text-sm mb-2">📝 Phase 1</div>
              <div className="text-white text-xs mb-2">Writing</div>
              <div className="text-4xl font-bold text-white">{results.phases.writing}</div>
              <div className="text-white/60 text-xs mt-1">40% weight</div>
              {expandedPhase === 'writing' && (
                <div className="text-purple-300 text-xs mt-2">▼ Click to close</div>
              )}
            </button>
            
            <button
              onClick={() => setExpandedPhase(expandedPhase === 'feedback' ? null : 'feedback')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                expandedPhase === 'feedback' ? 'border-blue-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-blue-300 text-sm mb-2">🔍 Phase 2</div>
              <div className="text-white text-xs mb-2">Peer Feedback</div>
              <div className="text-4xl font-bold text-white">{results.phases.feedback}</div>
              <div className="text-white/60 text-xs mt-1">30% weight</div>
              {expandedPhase === 'feedback' && (
                <div className="text-blue-300 text-xs mt-2">▼ Click to close</div>
              )}
            </button>
            
            <button
              onClick={() => setExpandedPhase(expandedPhase === 'revision' ? null : 'revision')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                expandedPhase === 'revision' ? 'border-emerald-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-emerald-300 text-sm mb-2">✏️ Phase 3</div>
              <div className="text-white text-xs mb-2">Revision</div>
              <div className="text-4xl font-bold text-white">{results.phases.revision}</div>
              <div className="text-white/60 text-xs mt-1">30% weight</div>
              {expandedPhase === 'revision' && (
                <div className="text-emerald-300 text-xs mt-2">▼ Click to close</div>
              )}
            </button>
            
            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-yellow-400/50">
              <div className="text-yellow-300 text-sm mb-2">⭐ Final</div>
              <div className="text-white text-xs mb-2">Composite</div>
              <div className="text-4xl font-bold text-yellow-300">{results.phases.composite}</div>
              <div className="text-white/80 text-xs mt-1">Overall Score</div>
            </div>
          </div>

          {/* Expanded Feedback Panel */}
          {expandedPhase && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-in fade-in slide-in-from-top duration-300">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>{expandedPhase === 'writing' ? '📝' : expandedPhase === 'feedback' ? '🔍' : '✏️'}</span>
                <span>
                  {expandedPhase === 'writing' ? 'Phase 1: Writing' : 
                   expandedPhase === 'feedback' ? 'Phase 2: Peer Feedback' : 
                   'Phase 3: Revision'} Feedback
                </span>
              </h3>
              
              <div className="space-y-4">
                {/* Strengths */}
                <div>
                  <div className="text-emerald-300 font-semibold mb-2 flex items-center space-x-2">
                    <span>✨</span>
                    <span>Strengths</span>
                  </div>
                  <ul className="space-y-1">
                    {MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK].strengths.map((strength, i) => (
                      <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Growth */}
                <div>
                  <div className="text-yellow-300 font-semibold mb-2 flex items-center space-x-2">
                    <span>💡</span>
                    <span>Areas for Growth</span>
                  </div>
                  <ul className="space-y-1">
                    {MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK].improvements.map((improvement, i) => (
                      <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Writing Revolution Concepts */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <div className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                    <span>📚</span>
                    <span>The Writing Revolution - Key Strategies</span>
                  </div>
                  <ul className="space-y-1">
                    {MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK].writingRevConcepts.map((concept, i) => (
                      <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                        • {concept}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {results.improvementBonus > 0 && (
            <div className="mt-6 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4 text-center">
              <div className="text-emerald-300 font-semibold">
                🌟 Improvement Bonus: +{results.improvementBonus} points from revision!
              </div>
            </div>
          )}
        </div>

        {/* LP Change Banner */}
        <div className={`rounded-2xl p-6 mb-8 text-center shadow-2xl ${
          results.lpChange > 0 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
            : 'bg-gradient-to-r from-red-600 to-orange-600'
        }`}>
          <div className="text-white/80 text-sm mb-2">Rank Change</div>
          <div className="text-6xl font-bold text-white mb-2">
            {results.lpChange > 0 ? '+' : ''}{results.lpChange} LP
          </div>
          <div className="text-white/90">
            {results.lpChange > 0 ? '🎉 Climbing the ranks!' : '💪 Keep fighting to climb back!'}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Match Rewards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-white/80 mb-2">Placement</div>
              <div className="text-5xl font-bold text-white mb-2">{getMedalEmoji(results.yourRank)}</div>
              <div className="text-white/80 text-sm">of {results.rankings.length}</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">XP Earned</div>
              <div className="text-5xl font-bold text-yellow-300 mb-2">+{results.xpEarned}</div>
              <div className="text-white/80 text-sm">2.5x ranked bonus</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">Points Earned</div>
              <div className="text-5xl font-bold text-white mb-2">+{results.pointsEarned}</div>
              <div className="text-white/80 text-sm">
                {results.isVictory && <span className="text-yellow-300">+30 Victory!</span>}
                {results.yourRank === 2 && <span className="text-gray-300">+15 Runner-up!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Rankings with Phase Breakdown */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <span>🏆</span>
            <span>Final Rankings</span>
          </h2>
          
          <div className="space-y-3">
            {results.rankings.map((player: any) => (
              <div
                key={player.name}
                className={`p-5 rounded-xl transition-all ${
                  player.isYou
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400 scale-105'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                      player.position === 1 ? 'bg-yellow-500 text-yellow-900' :
                      player.position === 2 ? 'bg-gray-300 text-gray-700' :
                      player.position === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.isYou && (
                            <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">{player.rank}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-3xl font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                      {player.compositeScore}
                    </div>
                    <div className="text-white/60 text-sm">composite</div>
                  </div>
                </div>

                {/* Phase scores */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-1">Writing</div>
                    <div className="text-white text-sm font-semibold">{player.phase1}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-1">Feedback</div>
                    <div className="text-white text-sm font-semibold">{player.phase2}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40 text-xs mb-1">Revision</div>
                    <div className="text-white text-sm font-semibold">{player.phase3}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ranked"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-200 text-center shadow-lg"
          >
            Play Ranked Again 🏆
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-center text-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function RankedResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    }>
      <RankedResultsContent />
    </Suspense>
  );
}
