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
import { getPhaseColorByName } from '@/lib/constants/colors';

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
  const { expanded: expandedPhase, toggle: togglePhase, isExpanded } = useExpanded<'writing' | 'feedback' | 'revision'>('writing');
  const [realFeedback, setRealFeedback] = useState<any>({ writing: null, feedback: null, revision: null });

  useEffect(() => {
    const fetchAIFeedback = async () => {
      if (!user || !matchId) return;
      try {
        const [phase1Feedback, phase2Feedback, phase3Feedback] = await Promise.all([
          getAIFeedback(matchId, user.uid, 1),
          getAIFeedback(matchId, user.uid, 2),
          getAIFeedback(matchId, user.uid, 3),
        ]);
        setRealFeedback({ writing: phase1Feedback, feedback: phase2Feedback, revision: phase3Feedback });
      } catch (error) {}
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
            console.error('❌ RESULTS - Failed to fetch match rankings:', error);
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
            { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', phase1: Math.round(65 + Math.random() * 25), phase2: Math.round(70 + Math.random() * 20), phase3: Math.round(75 + Math.random() * 15), wordCount: 90 },
            { name: 'WordMaster', avatar: '📖', rank: 'Silver III', phase1: Math.round(60 + Math.random() * 30), phase2: Math.round(65 + Math.random() * 25), phase3: Math.round(70 + Math.random() * 20), wordCount: 95 },
            { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', phase1: Math.round(70 + Math.random() * 20), phase2: Math.round(75 + Math.random() * 15), phase3: Math.round(65 + Math.random() * 25), wordCount: 88 },
            { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', phase1: Math.round(55 + Math.random() * 30), phase2: Math.round(60 + Math.random() * 25), phase3: Math.round(70 + Math.random() * 20), wordCount: 92 },
          ];
        }

        const allPlayers = [
          { name: 'You', avatar: '🌿', rank: 'Silver III', phase1: Math.round(writingScore), phase2: Math.round(feedbackScore), phase3: Math.round(revisionScore), compositeScore: yourCompositeScore, wordCount, revisedWordCount, isYou: true, position: 0 },
          ...aiPlayers.map(player => ({ ...player, compositeScore: calculateCompositeScore(player.phase1, player.phase2, player.phase3), isYou: false, position: 0 }))
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
            await saveWritingSession({ userId: user.uid, mode: 'ranked', trait: trait || 'all', promptType: promptType || 'narrative', content: originalContent, wordCount, score: Math.round(yourCompositeScore), traitScores: { content: Math.round(writingScore), organization: Math.round(writingScore), grammar: Math.round(writingScore), vocabulary: Math.round(writingScore), mechanics: Math.round(writingScore) }, xpEarned, pointsEarned, lpChange, placement: yourRank, timestamp: new Date() as any, matchId });
            await updateUserStatsAfterSession(user.uid, xpEarned, pointsEarned, lpChange, isVictory, wordCount);
            await refreshProfile();
            
            for (const aiPlayer of aiPlayers) {
              if (!aiPlayer.name) continue;
              const aiComposite = calculateCompositeScore(aiPlayer.phase1, aiPlayer.phase2, aiPlayer.phase3);
              const aiPlayerData = allPlayers.find(p => p.name === aiPlayer.name);
              const aiPlacement = aiPlayerData?.position || 5;
              const aiLPChange = aiPlacement === 1 ? 35 : aiPlacement === 2 ? 22 : aiPlacement === 3 ? 12 : aiPlacement === 4 ? -5 : -15;
              const aiXP = calculateXPEarned(aiComposite, 'ranked');
              const aiIsWin = aiPlacement === 1;
              
              if (session && aiPlayer.userId && aiPlayer.userId.startsWith('ai-')) {
                const aiStudentId = aiPlayer.userId.replace('ai-', '').replace('student-', '');
                try { await updateAIStudentAfterMatch(aiStudentId, aiLPChange, aiXP, aiIsWin, aiPlayer.wordCount || 100).catch(() => {}); } catch (e) {}
              } else if (session && aiPlayer.userId) {
                try { await updateAIStudentAfterMatch(aiPlayer.userId, aiLPChange, aiXP, aiIsWin, aiPlayer.wordCount || 100).catch(() => {}); } catch (e) {}
              }
            }
          } catch (error) {}
        }

        setResults({ rankings, yourRank, lpChange, xpEarned, pointsEarned, isVictory, improvementBonus: Math.round(improvementBonus), phases: { writing: Math.round(writingScore), feedback: Math.round(feedbackScore), revision: Math.round(revisionScore), composite: Math.round(yourCompositeScore) } });
        setIsAnalyzing(false);
      } catch (error) {
        setIsAnalyzing(false);
      }
    };
    analyzeRankedMatch();
  }, [wordCount, trait, promptType, writingScore, feedbackScore, revisionScore, session, user]);

  if (isAnalyzing) return <LoadingState variant="analyzing" />;

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-lg font-semibold">Match Results</span>
          </Link>
          <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-8 py-10">
        <div className="mb-10 text-center">
          <div className="mb-4 text-6xl animate-bounce">
            {results.isVictory ? '🏆' : results.yourRank <= 3 ? '🎉' : results.lpChange >= 0 ? '💪' : '😔'}
          </div>
          <h1 className="mb-2 text-3xl font-semibold">
            {results.isVictory ? 'Victory!' : results.yourRank <= 3 ? 'Great Job!' : results.lpChange >= 0 ? 'Match Complete!' : 'Keep Improving!'}
          </h1>
          <p className="text-[rgba(255,255,255,0.5)]">
            You placed {getMedalEmoji(results.yourRank)} in your ranked party
          </p>
        </div>

        <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-1 text-center text-lg font-semibold">Your Performance</h2>
          <p className="mb-5 text-center text-xs text-[rgba(255,255,255,0.4)]">Click phases to see feedback</p>
          
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <button onClick={() => togglePhase('writing')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('writing') ? 'border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
              <div className="mb-1 text-xs text-[#00e5e5]">📝 Phase 1</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Writing</div>
              <div className="font-mono text-2xl font-medium">{results.phases.writing}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">40% weight</div>
            </button>
            
            <button onClick={() => togglePhase('feedback')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('feedback') ? 'border-2 border-[#ff5f8f] bg-[rgba(255,95,143,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
              <div className="mb-1 text-xs text-[#ff5f8f]">🔍 Phase 2</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Feedback</div>
              <div className="font-mono text-2xl font-medium">{results.phases.feedback}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
            </button>
            
            <button onClick={() => togglePhase('revision')} className={`rounded-[10px] p-4 text-center transition-all ${isExpanded('revision') ? 'border-2 border-[#00d492] bg-[rgba(0,212,146,0.1)] scale-105' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
              <div className="mb-1 text-xs text-[#00d492]">✏️ Phase 3</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Revision</div>
              <div className="font-mono text-2xl font-medium">{results.phases.revision}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
            </button>
            
            <div className="rounded-[10px] border-2 border-[#ff9030] bg-[rgba(255,144,48,0.1)] p-4 text-center">
              <div className="mb-1 text-xs text-[#ff9030]">⭐ Final</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Composite</div>
              <div className="font-mono text-2xl font-medium text-[#ff9030]">{results.phases.composite}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.4)]">Overall</div>
            </div>
          </div>

          {expandedPhase && (() => {
            const phaseFeedbackData = expandedPhase === 'writing' ? realFeedback.writing : expandedPhase === 'feedback' ? realFeedback.feedback : realFeedback.revision;
            const mockFeedback = MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK];
            const strengths = phaseFeedbackData?.strengths || mockFeedback.strengths;
            const improvements = phaseFeedbackData?.improvements || phaseFeedbackData?.suggestions || mockFeedback.improvements;
            
            let nextSteps = phaseFeedbackData?.nextSteps;
            if (!nextSteps && improvements && Array.isArray(improvements) && improvements.length > 0) {
              nextSteps = improvements.slice(0, 3).map((imp: string) => {
                if (typeof imp === 'string') {
                  if (imp.includes('Try') || imp.includes('Practice') || imp.includes('Add')) return imp;
                  if (imp.includes('because/but/so') || imp.includes('sentence expansion')) return 'Practice sentence expansion: Add "because", "but", or "so" to show deeper thinking';
                  if (imp.includes('appositive')) return 'Try appositives: Add description using commas (e.g., "Sarah, a curious student, wrote...")';
                  if (imp.includes('transition')) return 'Use transition words: Connect ideas with "First", "Then", "However", "Therefore"';
                  return `Focus on: ${imp}`;
                }
                return imp;
              });
            }
            if (!nextSteps || nextSteps.length === 0) nextSteps = phaseFeedbackData?.specificFeedback ? Object.values(phaseFeedbackData.specificFeedback) : mockFeedback.writingRevConcepts;
            const traitFeedback = phaseFeedbackData?.traitFeedback || {};
            
            const phaseColor = getPhaseColorByName(expandedPhase);
            
            return (
              <div className="animate-in fade-in slide-in-from-top rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#101012] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <span>{expandedPhase === 'writing' ? '📝' : expandedPhase === 'feedback' ? '🔍' : '✏️'}</span>
                  <span>{expandedPhase === 'writing' ? 'Writing' : expandedPhase === 'feedback' ? 'Feedback' : 'Revision'} Feedback</span>
                  {phaseFeedbackData && <span className="text-[10px] text-[#00d492]">✓ AI</span>}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-[#00d492]">✨ Strengths</div>
                    <ul className="space-y-1">
                      {Array.isArray(strengths) && strengths.length > 0 ? strengths.map((s, i) => (
                        <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {s}</li>
                      )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'No strengths identified' : 'Submit work to receive feedback'}</li>}
                    </ul>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-[#ff9030]">🎯 Areas for Growth</div>
                    <ul className="space-y-1">
                      {Array.isArray(improvements) && improvements.length > 0 ? improvements.map((imp, i) => (
                        <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {imp}</li>
                      )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'No improvements identified' : 'Submit work to receive feedback'}</li>}
                    </ul>
                  </div>
                  
                  {expandedPhase === 'writing' && traitFeedback && Object.keys(traitFeedback).length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-semibold text-[#00e5e5]">📊 Trait Feedback</div>
                      <div className="space-y-2">
                        {Object.entries(traitFeedback).map(([trait, feedback]) => (
                          <div key={trait} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-2">
                            <div className="text-[10px] font-semibold capitalize text-[#00e5e5]">{trait}</div>
                            <p className="text-xs text-[rgba(255,255,255,0.5)]">{feedback as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-xs font-semibold" style={{ color: phaseColor }}>🚀 Next Steps</div>
                    <ul className="space-y-1">
                      {Array.isArray(nextSteps) && nextSteps.length > 0 ? nextSteps.map((step, i) => (
                        <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3">• {step}</li>
                      )) : typeof nextSteps === 'object' && nextSteps !== null ? Object.entries(nextSteps).map(([key, value], i) => (
                        <li key={i} className="text-sm text-[rgba(255,255,255,0.6)] pl-3"><strong className="capitalize">{key}:</strong> {value as string}</li>
                      )) : <li className="text-sm italic text-[rgba(255,255,255,0.3)] pl-3">{phaseFeedbackData ? 'Review improvements above' : 'Submit work for next steps'}</li>}
                    </ul>
                  </div>
                  
                  {!phaseFeedbackData && (
                    <div className="rounded-[6px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.1)] p-3">
                      <p className="text-xs text-[#ff9030]">⚠️ General feedback. Submit work for personalized AI feedback.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {results.improvementBonus > 0 && (
            <div className="mt-5 rounded-[10px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.1)] p-4 text-center">
              <div className="font-medium text-[#00d492]">🌟 Improvement Bonus: +{results.improvementBonus} points from revision!</div>
            </div>
          )}
        </div>

        <div className={`mb-8 rounded-[14px] p-6 text-center ${results.lpChange > 0 ? 'bg-[rgba(0,212,146,0.15)] border border-[rgba(0,212,146,0.3)]' : 'bg-[rgba(255,95,143,0.15)] border border-[rgba(255,95,143,0.3)]'}`}>
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Rank Change</div>
          <div className="font-mono text-4xl font-medium" style={{ color: results.lpChange > 0 ? '#00d492' : '#ff5f8f' }}>
            {results.lpChange > 0 ? '+' : ''}{results.lpChange} LP
          </div>
          <div className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
            {results.lpChange > 0 ? '🎉 Climbing the ranks!' : '💪 Keep fighting!'}
          </div>
        </div>

        <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-5 text-center text-lg font-semibold">Match Rewards</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Placement</div>
              <div className="font-mono text-3xl">{getMedalEmoji(results.yourRank)}</div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">of {results.rankings.length}</div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">XP Earned</div>
              <div className="font-mono text-3xl text-[#ff9030]">+{results.xpEarned}</div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">2.5x ranked</div>
            </div>
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Points</div>
              <div className="font-mono text-3xl">+{results.pointsEarned}</div>
              <div className="mt-1 text-xs">
                {results.isVictory && <span className="text-[#ff9030]">+30 Victory!</span>}
                {results.yourRank === 2 && <span className="text-[rgba(255,255,255,0.4)]">+15 Runner-up!</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <span>🏆</span><span>Final Rankings</span>
          </h2>
          
          <div className="space-y-3">
            {results.rankings.map((player: any) => (
              <div key={player.name} className={`rounded-[10px] p-4 transition-all ${player.isYou ? 'border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)] scale-[1.02]' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold ${player.position === 1 ? 'bg-[#ff9030] text-[#101012]' : player.position === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' : player.position === 3 ? 'bg-[#ff9030]/60 text-[#101012]' : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)]'}`}>
                      {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.name}</span>
                          {player.isYou && <span className="rounded-[20px] bg-[#00e5e5] px-2 py-0.5 text-[10px] font-medium text-[#101012]">You</span>}
                        </div>
                        <div className="text-xs text-[rgba(255,255,255,0.4)]">{player.rank}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-2xl font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.compositeScore}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">composite</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[rgba(255,255,255,0.05)] pt-3">
                  <div className="text-center">
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Writing</div>
                    <div className="font-mono text-sm">{player.phase1}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Feedback</div>
                    <div className="font-mono text-sm">{player.phase2}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Revision</div>
                    <div className="font-mono text-sm">{player.phase3}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/ranked" className="rounded-[10px] border border-[#00e5e5] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.04em] text-[#00e5e5] transition hover:bg-[rgba(0,229,229,0.1)]">
            Play Again 🏆
          </Link>
          <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
