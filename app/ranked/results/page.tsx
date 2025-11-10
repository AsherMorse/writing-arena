'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/firestore';

function RankedResultsContent() {
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
    const analyzeRankedMatch = async () => {
      try {
        // Call Claude API for real feedback
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: decodeURIComponent(content),
            trait,
            promptType,
          }),
        });

        const data = await response.ok ? await response.json() : null;
        const yourScore = data?.overallScore || Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
        const aiScores = aiScoresParam.split(',').map(Number);
      
      const rankings = [
        { name: 'You', avatar: '🌿', rank: 'Silver III', score: Math.round(yourScore), wordCount, isYou: true, position: 0 },
        { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0], isYou: false, position: 0 },
        { name: 'WordMaster', avatar: '📖', rank: 'Silver III', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1], isYou: false, position: 0 },
        { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2], isYou: false, position: 0 },
        { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3], isYou: false, position: 0 },
      ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, position: index + 1 }));

        const yourRank = rankings.find(p => p.isYou)?.position || 5;
        const lpChange = yourRank === 1 ? 28 : yourRank === 2 ? 18 : yourRank === 3 ? 10 : -12;
        const xpEarned = Math.round(yourScore * 2); // 2x for ranked
        const pointsEarned = Math.round(yourScore * 2) + (yourRank === 1 ? 25 : 0);
        const isVictory = yourRank === 1;

        // Save to Firebase if user is logged in
        if (user && data) {
          try {
            await saveWritingSession({
              userId: user.uid,
              mode: 'ranked',
              trait: trait || 'all',
              promptType: promptType || 'narrative',
              content: decodeURIComponent(content),
              wordCount,
              score: Math.round(yourScore),
              traitScores: data.traits,
              xpEarned,
              pointsEarned,
              lpChange,
              placement: yourRank,
              timestamp: new Date() as any,
            });
            
            await updateUserStatsAfterSession(
              user.uid,
              xpEarned,
              pointsEarned,
              lpChange, // Update LP for ranked
              isVictory,
              wordCount
            );
            
            await refreshProfile();
          } catch (error) {
            console.error('Error saving Ranked session:', error);
          }
        }

        setResults({
          rankings,
          yourRank,
          lpChange,
          xpEarned,
          pointsEarned,
          isVictory,
        });
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error analyzing Ranked Match:', error);
        // Fallback to mock if API fails
        const yourScore = Math.min(Math.max(60 + (wordCount / 5), 40), 100);
        const aiScores = aiScoresParam.split(',').map(Number);
        const rankings = [
          { name: 'You', avatar: '🌿', rank: 'Silver III', score: Math.round(yourScore), wordCount, isYou: true, position: 0 },
          { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0], isYou: false, position: 0 },
          { name: 'WordMaster', avatar: '📖', rank: 'Silver III', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1], isYou: false, position: 0 },
          { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2], isYou: false, position: 0 },
          { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3], isYou: false, position: 0 },
        ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, position: index + 1 }));
        
        const yourRank = rankings.find(p => p.isYou)?.position || 5;
        const lpChange = yourRank === 1 ? 28 : yourRank === 2 ? 18 : yourRank === 3 ? 10 : -12;
        
        setResults({
          rankings,
          yourRank,
          lpChange,
          xpEarned: Math.round(yourScore * 2),
          pointsEarned: Math.round(yourScore * 2),
          isVictory: yourRank === 1,
        });
        setIsAnalyzing(false);
      }
    };

    analyzeRankedMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount, aiScoresParam, trait, promptType, content]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-3">Analyzing Ranked Match...</h2>
          <p className="text-white/60 text-lg mb-6">Calculating LP changes</p>
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
            {results.isVictory ? 'Victory!' : results.yourRank <= 3 ? 'Great Job!' : results.lpChange >= 0 ? 'Match Complete!' : 'Defeat'}
          </h1>
          <p className="text-xl text-white/70">
            You placed {getMedalEmoji(results.yourRank)} in your ranked party
          </p>
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-2xl">
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
              <div className="text-white/80 text-sm">2x ranked bonus</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">Points Earned</div>
              <div className="text-5xl font-bold text-white mb-2">+{results.pointsEarned}</div>
              <div className="text-white/80 text-sm">
                {results.isVictory && <span className="text-yellow-300">+25 Victory!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
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
                <div className="flex items-center justify-between">
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
                        <div className="text-white/60 text-sm">{player.rank} • {player.wordCount} words</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-3xl font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
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

