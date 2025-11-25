'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GameSession } from '@/lib/types/session';
import AnimatedScore from '@/components/shared/AnimatedScore';
import { getAIFeedback } from '@/lib/services/match-sync';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/services/firestore';
import { updateAIStudentAfterMatch } from '@/lib/services/ai-students';
import { calculateCompositeScore, calculateLPChange, calculateXPEarned, calculatePointsEarned, calculateImprovementBonus } from '@/lib/utils/score-calculator';
import { LoadingState } from '@/components/shared/LoadingState';
import { getMedalEmoji } from '@/lib/utils/rank-utils';
import { rankPlayers, getPlayerRank } from '@/lib/utils/ranking-utils';
import { useExpanded } from '@/lib/hooks/useExpanded';
import { MOCK_PHASE_FEEDBACK } from '@/lib/utils/mock-data';

interface ResultsContentProps {
  session?: GameSession;
}

export default function ResultsContent({ session }: ResultsContentProps = {}) {
  const { user, refreshProfile } = useAuth();
  
  const matchId = session?.matchId || '';
  const trait = session?.config.trait;
  const promptType = session?.config.promptType;
  
  const userPlayer = session && user ? session.players[user.uid] : null;
  const originalContent = userPlayer?.phases.phase1?.content || '';
  const revisedContent = (userPlayer?.phases.phase3 as any)?.revisedContent || '';
  const wordCount = userPlayer?.phases.phase1?.wordCount || 0;
  const revisedWordCount = userPlayer?.phases.phase3?.wordCount || 0;
  const writingScore = userPlayer?.phases.phase1?.score || 75;
  const feedbackScore = (userPlayer?.phases.phase2 as any)?.score || 80;
  const revisionScore = userPlayer?.phases.phase3?.score || 78;
  
  const hadEmptyWriting = wordCount === 0 || !originalContent;
  const hadEmptyFeedback = feedbackScore === 0;
  const hadEmptyRevision = revisionScore === 0 || revisedWordCount === 0;
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);
  const { expanded: expandedPhase, toggle: togglePhase, isExpanded } = useExpanded<string>('writing');
  const [realFeedback, setRealFeedback] = useState<any>({
    writing: null,
    feedback: null,
    revision: null,
  });

  useEffect(() => {
    const fetchAIFeedback = async () => {
      if (!user || !matchId) return;
      
      try {
        const [phase1Feedback, phase2Feedback, phase3Feedback] = await Promise.all([
          getAIFeedback(matchId, user.uid, 1),
          getAIFeedback(matchId, user.uid, 2),
          getAIFeedback(matchId, user.uid, 3),
        ]);
        
        setRealFeedback({
          writing: phase1Feedback,
          feedback: phase2Feedback,
          revision: phase3Feedback,
        });
      } catch (error) {
        // Silent fail
      }
    };
    
    fetchAIFeedback();
  }, [user, matchId]);

  useEffect(() => {
    const analyzeRankedMatch = async () => {
      try {
        let realPhase1Rankings: any[] = [];
        let realPhase2Rankings: any[] = [];
        let realPhase3Rankings: any[] = [];
        
        if (matchId) {
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('@/lib/config/firebase');
            
            const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
            if (matchDoc.exists()) {
              const matchState = matchDoc.data();
              realPhase1Rankings = matchState?.rankings?.phase1 || [];
              realPhase2Rankings = matchState?.rankings?.phase2 || [];
              realPhase3Rankings = matchState?.rankings?.phase3 || [];
            }
          } catch (error) {
            // Silent fail
          }
        }
        
        const yourCompositeScore = calculateCompositeScore(writingScore, feedbackScore, revisionScore);
        
        let aiPlayers: any[] = [];
        
        if (realPhase1Rankings.length > 0) {
          const aiPlayerData = realPhase1Rankings.filter((r: any) => r.isAI);
          
          aiPlayers = aiPlayerData.map((p1: any, idx: number) => {
            const p2 = realPhase2Rankings.find((r: any) => r.playerId === p1.playerId);
            const p3 = realPhase3Rankings.find((r: any) => r.playerId === p1.playerId);
            
            return {
              name: p1.playerName,
              avatar: ['🎯', '📖', '✨', '🏅'][idx % 4],
              rank: ['Silver II', 'Silver III', 'Silver II', 'Silver IV'][idx % 4],
              phase1: p1.score,
              phase2: p2?.score || Math.round(65 + Math.random() * 25),
              phase3: p3?.score || Math.round(70 + Math.random() * 20),
              wordCount: 90 + Math.floor(Math.random() * 20),
            };
          });
        } else {
          aiPlayers = [
            {
              name: 'ProWriter99',
              avatar: '🎯',
              rank: 'Silver II',
              phase1: Math.round(65 + Math.random() * 25),
              phase2: Math.round(70 + Math.random() * 20),
              phase3: Math.round(75 + Math.random() * 15),
              wordCount: 90,
            },
            {
              name: 'WordMaster',
              avatar: '📖',
              rank: 'Silver III',
              phase1: Math.round(60 + Math.random() * 30),
              phase2: Math.round(65 + Math.random() * 25),
              phase3: Math.round(70 + Math.random() * 20),
              wordCount: 95,
            },
            {
              name: 'EliteScribe',
              avatar: '✨',
              rank: 'Silver II',
              phase1: Math.round(70 + Math.random() * 20),
              phase2: Math.round(75 + Math.random() * 15),
              phase3: Math.round(65 + Math.random() * 25),
              wordCount: 88,
            },
            {
              name: 'PenChampion',
              avatar: '🏅',
              rank: 'Silver IV',
              phase1: Math.round(55 + Math.random() * 30),
              phase2: Math.round(60 + Math.random() * 25),
              phase3: Math.round(70 + Math.random() * 20),
              wordCount: 92,
            },
          ];
        }

        const allPlayers = [
          {
            name: 'You',
            avatar: '🌿',
            rank: 'Silver III',
            phase1: Math.round(writingScore),
            phase2: Math.round(feedbackScore),
            phase3: Math.round(revisionScore),
            compositeScore: yourCompositeScore,
            wordCount,
            revisedWordCount,
            isYou: true,
            position: 0,
          },
          ...aiPlayers.map(player => ({
            ...player,
            compositeScore: calculateCompositeScore(player.phase1, player.phase2, player.phase3),
            isYou: false,
            position: 0,
          }))
        ];

        const rankings = rankPlayers(allPlayers, 'compositeScore');
        const yourRank = getPlayerRank(rankings, user?.uid);
        
        const lpChange = calculateLPChange(yourRank);
        
        const xpEarned = calculateXPEarned(yourCompositeScore, 'ranked');
        const pointsEarned = calculatePointsEarned(yourCompositeScore, yourRank);
        const isVictory = yourRank === 1;

        const improvementBonus = calculateImprovementBonus(writingScore, revisionScore);

        if (user) {
          try {
            await saveWritingSession({
              userId: user.uid,
              mode: 'ranked',
              trait: trait || 'all',
              promptType: promptType || 'narrative',
              content: originalContent,
              wordCount: wordCount,
              score: Math.round(yourCompositeScore),
              traitScores: {
                content: Math.round(writingScore),
                organization: Math.round(writingScore),
                grammar: Math.round(writingScore),
                vocabulary: Math.round(writingScore),
                mechanics: Math.round(writingScore),
              },
              xpEarned,
              pointsEarned,
              lpChange,
              placement: yourRank,
              timestamp: new Date() as any,
              matchId: matchId,
            });

            await updateUserStatsAfterSession(
              user.uid,
              xpEarned,
              pointsEarned,
              lpChange,
              isVictory,
              wordCount
            );
            
            await refreshProfile();
            
            for (const aiPlayer of aiPlayers) {
              if (!aiPlayer.name) continue;
              
              const aiComposite = calculateCompositeScore(aiPlayer.phase1, aiPlayer.phase2, aiPlayer.phase3);
              const aiPlayerData = allPlayers.find(p => p.name === aiPlayer.name);
              const aiPlacement = aiPlayerData?.position || 5;
              
              const aiLPChange = 
                aiPlacement === 1 ? 35 : 
                aiPlacement === 2 ? 22 : 
                aiPlacement === 3 ? 12 : 
                aiPlacement === 4 ? -5 : -15;
              
              const aiXP = calculateXPEarned(aiComposite, 'ranked');
              const aiIsWin = aiPlacement === 1;
              
              const aiStudentId = aiPlayer.name;
              
              if (session && aiPlayer.userId && aiPlayer.userId.startsWith('ai-')) {
                const aiStudentId = aiPlayer.userId.replace('ai-', '').replace('student-', '');
                try {
                    await updateAIStudentAfterMatch(
                    aiStudentId,
                      aiLPChange,
                      aiXP,
                      aiIsWin,
                      aiPlayer.wordCount || 100
                    ).catch(() => {});
                } catch (e) {
                  // Silent fail
                }
              } else if (session && aiPlayer.userId) {
                try {
                  await updateAIStudentAfterMatch(
                    aiPlayer.userId,
                    aiLPChange,
                    aiXP,
                    aiIsWin,
                    aiPlayer.wordCount || 100
                  ).catch(() => {});
                } catch (e) {
                  // Silent fail
                }
              }
            }
            
          } catch (error) {
            // Silent fail
          }
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
        setIsAnalyzing(false);
      }
    };

    analyzeRankedMatch();
  }, [wordCount, trait, promptType, writingScore, feedbackScore, revisionScore, session, user]);

  if (isAnalyzing) {
    return <LoadingState variant="analyzing" />;
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Match Results</span>
          </Link>
          <Link 
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
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

        <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Performance</h2>
          <p className="text-white/80 text-center mb-6 text-sm">Click on each phase to review detailed feedback</p>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => togglePhase('writing')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                isExpanded('writing') ? 'border-purple-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-purple-300 text-sm mb-2">📝 Phase 1</div>
              <div className="text-white text-xs mb-2">Writing</div>
              <div className="text-4xl font-bold text-white">{results.phases.writing}</div>
              <div className="text-white/60 text-xs mt-1">40% weight</div>
              {isExpanded('writing') && (
                <div className="text-purple-300 text-xs mt-2">▼ Click to close</div>
              )}
            </button>
            
            <button
              onClick={() => togglePhase('feedback')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                isExpanded('feedback') ? 'border-blue-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-blue-300 text-sm mb-2">🔍 Phase 2</div>
              <div className="text-white text-xs mb-2">Peer Feedback</div>
              <div className="text-4xl font-bold text-white">{results.phases.feedback}</div>
              <div className="text-white/60 text-xs mt-1">30% weight</div>
              {isExpanded('feedback') && (
                <div className="text-blue-300 text-xs mt-2">▼ Click to close</div>
              )}
            </button>
            
            <button
              onClick={() => togglePhase('revision')}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer border-2 ${
                isExpanded('revision') ? 'border-emerald-400 scale-105' : 'border-transparent'
              }`}
            >
              <div className="text-emerald-300 text-sm mb-2">✏️ Phase 3</div>
              <div className="text-white text-xs mb-2">Revision</div>
              <div className="text-4xl font-bold text-white">{results.phases.revision}</div>
              <div className="text-white/60 text-xs mt-1">30% weight</div>
              {isExpanded('revision') && (
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

          {expandedPhase && (() => {
            const phaseFeedbackData = expandedPhase === 'writing' ? realFeedback.writing : 
                                      expandedPhase === 'feedback' ? realFeedback.feedback : 
                                      realFeedback.revision;
            
            const mockFeedback = MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK];
            
            const strengths = phaseFeedbackData?.strengths || mockFeedback.strengths;
            const improvements = phaseFeedbackData?.improvements || 
                                (phaseFeedbackData?.suggestions) ||
                                mockFeedback.improvements;
            
            let nextSteps = phaseFeedbackData?.nextSteps;
            if (!nextSteps && improvements && Array.isArray(improvements) && improvements.length > 0) {
              nextSteps = improvements.slice(0, 3).map((imp: string) => {
                if (typeof imp === 'string') {
                  if (imp.includes('Try') || imp.includes('Practice') || imp.includes('Add')) {
                    return imp;
                  }
                  if (imp.includes('because/but/so') || imp.includes('sentence expansion')) {
                    return 'Practice sentence expansion: Add "because", "but", or "so" to show deeper thinking';
                  }
                  if (imp.includes('appositive')) {
                    return 'Try appositives: Add description using commas (e.g., "Sarah, a curious student, wrote...")';
                  }
                  if (imp.includes('transition')) {
                    return 'Use transition words: Connect ideas with "First", "Then", "However", "Therefore"';
                  }
                  return `Focus on: ${imp}`;
                }
                return imp;
              });
            }
            
            if (!nextSteps || nextSteps.length === 0) {
              nextSteps = phaseFeedbackData?.specificFeedback ? 
                         Object.values(phaseFeedbackData.specificFeedback) : 
                         mockFeedback.writingRevConcepts;
            }
            
            const traitFeedback = phaseFeedbackData?.traitFeedback || {};
            
            return (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 animate-in fade-in slide-in-from-top duration-300">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span>{expandedPhase === 'writing' ? '📝' : expandedPhase === 'feedback' ? '🔍' : '✏️'}</span>
                  <span>
                    {expandedPhase === 'writing' ? 'Phase 1: Writing' : 
                     expandedPhase === 'feedback' ? 'Phase 2: Peer Feedback' : 
                     'Phase 3: Revision'} Feedback
                  </span>
                  {phaseFeedbackData && (
                    <span className="text-emerald-400 text-xs ml-2">✓ Real AI</span>
                  )}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-emerald-300 font-semibold mb-2 flex items-center space-x-2">
                      <span>✨</span>
                      <span>Strengths</span>
                    </div>
                    <ul className="space-y-2">
                      {Array.isArray(strengths) && strengths.length > 0 ? strengths.map((strength, i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          • {strength}
                        </li>
                      )) : (
                        <li className="text-white/60 text-sm italic pl-4">
                          {phaseFeedbackData ? 'No strengths identified' : 'Submit your work to receive feedback'}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="text-yellow-300 font-semibold mb-2 flex items-center space-x-2">
                      <span>🎯</span>
                      <span>Areas for Growth</span>
                    </div>
                    <ul className="space-y-2">
                      {Array.isArray(improvements) && improvements.length > 0 ? improvements.map((improvement, i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          • {improvement}
                        </li>
                      )) : (
                        <li className="text-white/60 text-sm italic pl-4">
                          {phaseFeedbackData ? 'No specific improvements identified' : 'Submit your work to receive feedback'}
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {expandedPhase === 'writing' && traitFeedback && Object.keys(traitFeedback).length > 0 && (
                    <div>
                      <div className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                        <span>📊</span>
                        <span>Trait-Specific Feedback</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(traitFeedback).map(([trait, feedback]) => (
                          <div key={trait} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="text-purple-300 text-xs font-semibold mb-1 capitalize">{trait}</div>
                            <p className="text-white/80 text-xs leading-relaxed">{feedback as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Actionable Next Steps</span>
                    </div>
                    <ul className="space-y-2">
                      {Array.isArray(nextSteps) && nextSteps.length > 0 ? nextSteps.map((step, i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          • {step}
                        </li>
                      )) : typeof nextSteps === 'object' && nextSteps !== null ? Object.entries(nextSteps).map(([key, value], i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          <strong className="capitalize">{key}:</strong> {value as string}
                        </li>
                      )) : (
                        <li className="text-white/60 text-sm italic pl-4">
                          {phaseFeedbackData ? 'Review improvements above for specific next steps' : 'Submit your work to receive personalized next steps'}
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {!phaseFeedbackData && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-4">
                      <p className="text-yellow-300 text-xs">
                        ⚠️ This is general feedback. Submit your work to receive personalized, actionable feedback based on your actual writing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {results.improvementBonus > 0 && (
            <div className="mt-6 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4 text-center">
              <div className="text-emerald-300 font-semibold">
                🌟 Improvement Bonus: +{results.improvementBonus} points from revision!
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-3xl border border-white/10 p-8 mb-8 text-center ${
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

        <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 mb-8">
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

        <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 mb-8">
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
