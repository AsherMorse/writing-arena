'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function QuickMatchResultsContent() {
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const wordCount = parseInt(searchParams.get('wordCount') || '0');
  const aiScoresParam = searchParams.get('aiScores') || '0,0,0,0';
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
      const aiScores = aiScoresParam.split(',').map(Number);
      
      const rankings = [
        { name: 'You', avatar: '🌿', score: Math.round(yourScore), wordCount, isYou: true, rank: 0 },
        { name: 'WriteBot', avatar: '🤖', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0], isYou: false, rank: 0 },
        { name: 'PenPal AI', avatar: '✍️', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1], isYou: false, rank: 0 },
        { name: 'WordSmith', avatar: '📝', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2], isYou: false, rank: 0 },
        { name: 'QuillMaster', avatar: '🖋️', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3], isYou: false, rank: 0 },
      ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

      const yourRank = rankings.find(p => p.isYou)?.rank || 5;
      const xpEarned = Math.round(yourScore * 1.5) + (rankings.length - yourRank + 1) * 10;
      const pointsEarned = Math.round(yourScore) + (yourRank === 1 ? 25 : 0);

      setResults({
        rankings,
        yourRank,
        xpEarned,
        pointsEarned,
        isVictory: yourRank === 1,
      });
      setIsAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [wordCount, aiScoresParam]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🤖</div>
          <h2 className="text-3xl font-bold text-white mb-3">Analyzing Results...</h2>
          <p className="text-white/60 text-lg mb-6">Comparing your writing with the party</p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Result Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-bounce">
            {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : '💪'}
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            {results.isVictory ? 'Victory!' : results.yourRank <= 3 ? 'Great Job!' : 'Match Complete!'}
          </h1>
          <p className="text-xl text-white/70">
            You placed {getMedalEmoji(results.yourRank)} in your party
          </p>
        </div>

        {/* Rewards Card */}
        <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Match Rewards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-white/80 mb-2">Your Rank</div>
              <div className="text-5xl font-bold text-white mb-2">{getMedalEmoji(results.yourRank)}</div>
              <div className="text-white/80 text-sm">out of {results.rankings.length}</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">XP Earned</div>
              <div className="text-5xl font-bold text-yellow-300 mb-2">+{results.xpEarned}</div>
              <div className="text-white/80 text-sm">experience points</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">Points Earned</div>
              <div className="text-5xl font-bold text-white mb-2">+{results.pointsEarned}</div>
              <div className="text-white/80 text-sm">
                {results.isVictory && <span className="text-yellow-300">+25 Victory Bonus!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <span>🏅</span>
            <span>Final Rankings</span>
          </h2>
          
          <div className="space-y-3">
            {results.rankings.map((player: any) => (
              <div
                key={player.name}
                className={`p-5 rounded-xl transition-all ${
                  player.isYou
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 scale-105'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                      player.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                      player.rank === 2 ? 'bg-gray-300 text-gray-700' :
                      player.rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                    </div>

                    {/* Player Info */}
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${player.isYou ? 'text-green-400' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {player.isYou && (
                            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">You</span>
                          )}
                          {!player.isYou && (
                            <span className="text-xs px-2 py-1 bg-orange-500/50 text-white rounded-full">AI</span>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">{player.wordCount} words written</div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${player.isYou ? 'text-green-400' : 'text-white'}`}>
                      {player.score}
                    </div>
                    <div className="text-white/60 text-sm">score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/quick-match"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-200 text-center shadow-lg"
          >
            Play Again 🔄
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

export default function QuickMatchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    }>
      <QuickMatchResultsContent />
    </Suspense>
  );
}

