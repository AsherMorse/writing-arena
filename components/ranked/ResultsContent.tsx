'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GameSession } from '@/lib/types/session';
import AnimatedScore from '@/components/shared/AnimatedScore';
import { getAIFeedback } from '@/lib/services/match-sync';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/services/firestore';
import { updateAIStudentAfterMatch } from '@/lib/services/ai-students';

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

interface ResultsContentProps {
  session?: GameSession; // Optional for backward compatibility
}

export default function ResultsContent({ session }: ResultsContentProps = {}) {
  const { user, refreshProfile } = useAuth();
  
  // Extract data from session (new architecture) OR URL params (old architecture)
  const matchId = session?.matchId || '';
  const trait = session?.config.trait;
  const promptType = session?.config.promptType;
  
  // Get user's data from session if available
  const userPlayer = session && user ? session.players[user.uid] : null;
  const originalContent = userPlayer?.phases.phase1?.content || '';
  const revisedContent = (userPlayer?.phases.phase3 as any)?.revisedContent || '';
  const wordCount = userPlayer?.phases.phase1?.wordCount || 0;
  const revisedWordCount = userPlayer?.phases.phase3?.wordCount || 0;
  const writingScore = userPlayer?.phases.phase1?.score || 75;
  const feedbackScore = (userPlayer?.phases.phase2 as any)?.score || 80;
  const revisionScore = userPlayer?.phases.phase3?.score || 78;
  
  // Check for empty submissions
  const hadEmptyWriting = wordCount === 0 || !originalContent;
  const hadEmptyFeedback = feedbackScore === 0;
  const hadEmptyRevision = revisionScore === 0 || revisedWordCount === 0;
  
  console.log('📊 RESULTS - Session data:', {
    hasSession: !!session,
    matchId,
    userScores: { writingScore, feedbackScore, revisionScore },
    emptySubmissions: { writing: hadEmptyWriting, feedback: hadEmptyFeedback, revision: hadEmptyRevision },
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>('writing'); // Default to showing Phase 1 feedback
  const [realFeedback, setRealFeedback] = useState<any>({
    writing: null,
    feedback: null,
    revision: null,
  });

  // Fetch real AI feedback from Firestore
  useEffect(() => {
    const fetchAIFeedback = async () => {
      if (!user || !matchId) return;
      
      console.log('📥 RESULTS - Fetching AI feedback from Firestore...');
      try {
        const [phase1Feedback, phase2Feedback, phase3Feedback] = await Promise.all([
          getAIFeedback(matchId, user.uid, 1),
          getAIFeedback(matchId, user.uid, 2),
          getAIFeedback(matchId, user.uid, 3),
        ]);
        
        // Also try session storage as fallback
        const phase1Storage = sessionStorage.getItem(`${matchId}-phase1-feedback`);
        const phase2Storage = sessionStorage.getItem(`${matchId}-phase2-feedback`);
        const phase3Storage = sessionStorage.getItem(`${matchId}-phase3-feedback`);
        
        setRealFeedback({
          writing: phase1Feedback || (phase1Storage ? JSON.parse(phase1Storage) : null),
          feedback: phase2Feedback || (phase2Storage ? JSON.parse(phase2Storage) : null),
          revision: phase3Feedback || (phase3Storage ? JSON.parse(phase3Storage) : null),
        });
        
        console.log('✅ RESULTS - AI feedback loaded:', {
          hasPhase1: !!(phase1Feedback || phase1Storage),
          hasPhase2: !!(phase2Feedback || phase2Storage),
          hasPhase3: !!(phase3Feedback || phase3Storage),
        });
      } catch (error) {
        console.error('❌ RESULTS - Error fetching AI feedback:', error);
      }
    };
    
    fetchAIFeedback();
  }, [user, matchId]);

  useEffect(() => {
    const analyzeRankedMatch = async () => {
      try {
        // Try to get real rankings from Firestore
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
              
              console.log('✅ RESULTS - Loaded real rankings:', {
                phase1: realPhase1Rankings.length,
                phase2: realPhase2Rankings.length,
                phase3: realPhase3Rankings.length,
              });
            }
          } catch (error) {
            console.error('❌ RESULTS - Error loading real rankings:', error);
          }
        }
        
        // Calculate composite score from all 3 phases
        const yourCompositeScore = (writingScore * 0.4) + (feedbackScore * 0.3) + (revisionScore * 0.3);
        
        // Build AI players data from session or rankings
        let aiPlayers: any[] = [];
        
        if (realPhase1Rankings.length > 0) {
          // Use real AI scores from batch rankings
          console.log('📊 RESULTS - Using real AI scores from batch rankings');
          const aiPlayerData = realPhase1Rankings.filter((r: any) => r.isAI);
          
          aiPlayers = aiPlayerData.map((p1: any, idx: number) => {
            // Find matching player in phase 2 and 3
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
          // Fallback: Generate mock scores for AI players
          console.log('⚠️ RESULTS - No real rankings found, using fallback scores');
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

        // Save session and update user profile
        if (user) {
          console.log('💾 RESULTS - Saving session data and updating profile...');
          try {
            // Save writing session
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
            });
            console.log('✅ RESULTS - Session saved');

            // Update user stats (XP, points, LP, wins, word count)
            await updateUserStatsAfterSession(
              user.uid,
              xpEarned,
              pointsEarned,
              lpChange,
              isVictory,
              wordCount
            );
            console.log('✅ RESULTS - Profile updated with LP change:', lpChange);
            
            // Refresh the profile in AuthContext so dashboard shows updated LP
            console.log('🔄 RESULTS - Refreshing profile in AuthContext...');
            await refreshProfile();
            console.log('✅ RESULTS - Profile refreshed, new LP should be visible');
            
            // Update AI students' ranks and stats
            console.log('🤖 RESULTS - Updating AI student ranks...');
            for (const aiPlayer of aiPlayers) {
              if (!aiPlayer.name) continue;
              
              // Determine AI player's LP change based on their placement
              const aiComposite = (aiPlayer.phase1 * 0.4) + (aiPlayer.phase2 * 0.3) + (aiPlayer.phase3 * 0.3);
              const aiPlayerData = allPlayers.find(p => p.name === aiPlayer.name);
              const aiPlacement = aiPlayerData?.position || 5;
              
              const aiLPChange = 
                aiPlacement === 1 ? 35 : 
                aiPlacement === 2 ? 22 : 
                aiPlacement === 3 ? 12 : 
                aiPlacement === 4 ? -5 : -15;
              
              const aiXP = Math.round(aiComposite * 2.5);
              const aiIsWin = aiPlacement === 1;
              
              // Extract AI student ID from their data
              // AI player IDs are stored as "ai-student-XXX" from database
              const aiStudentId = aiPlayer.name; // This will be their userId which is the database ID
              
              // Try to get real AI student ID from stored players
              const storedPlayers = sessionStorage.getItem(`${matchId}-players`);
              if (storedPlayers) {
                try {
                  const players = JSON.parse(storedPlayers);
                  const aiPlayerMatch = players.find((p: any) => p.name === aiPlayer.name && p.isAI);
                  if (aiPlayerMatch && aiPlayerMatch.userId) {
                    // Update the persistent AI student
                    await updateAIStudentAfterMatch(
                      aiPlayerMatch.userId,
                      aiLPChange,
                      aiXP,
                      aiIsWin,
                      aiPlayer.wordCount || 100
                    ).catch(err => console.error('Error updating AI student:', err));
                  }
                } catch (e) {
                  console.warn('Could not update AI student:', e);
                }
              }
            }
            console.log('✅ RESULTS - AI students updated');
            
          } catch (error) {
            console.error('❌ RESULTS - Error saving session:', error);
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
        console.error('Error analyzing Ranked Match:', error);
        setIsAnalyzing(false);
      }
    };

    analyzeRankedMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordCount, trait, promptType, writingScore, feedbackScore, revisionScore, session, user]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
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

        {/* Phase Breakdown - Clickable */}
        <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 mb-8">
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
          {expandedPhase && (() => {
            // Get real AI feedback for this phase, fallback to mock if not available
            const phaseFeedbackData = expandedPhase === 'writing' ? realFeedback.writing : 
                                      expandedPhase === 'feedback' ? realFeedback.feedback : 
                                      realFeedback.revision;
            
            const mockFeedback = MOCK_PHASE_FEEDBACK[expandedPhase as keyof typeof MOCK_PHASE_FEEDBACK];
            
            // Use real feedback if available, otherwise use mock
            const strengths = phaseFeedbackData?.strengths || mockFeedback.strengths;
            const improvements = phaseFeedbackData?.improvements || 
                                (phaseFeedbackData?.suggestions) || // revision uses 'suggestions'
                                mockFeedback.improvements;
            const nextSteps = phaseFeedbackData?.nextSteps || 
                             phaseFeedbackData?.specificFeedback || 
                             mockFeedback.writingRevConcepts;
            
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
                  {/* Strengths */}
                  <div>
                    <div className="text-emerald-300 font-semibold mb-2 flex items-center space-x-2">
                      <span>✨</span>
                      <span>Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {Array.isArray(strengths) ? strengths.map((strength, i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          • {strength}
                        </li>
                      )) : <li className="text-white/60 text-sm italic pl-4">No strengths data available</li>}
                    </ul>
                  </div>

                  {/* Areas for Growth */}
                  <div>
                    <div className="text-yellow-300 font-semibold mb-2 flex items-center space-x-2">
                      <span>💡</span>
                      <span>Areas for Growth</span>
                    </div>
                    <ul className="space-y-1">
                      {Array.isArray(improvements) ? improvements.map((improvement, i) => (
                        <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                          • {improvement}
                        </li>
                      )) : <li className="text-white/60 text-sm italic pl-4">No improvement suggestions available</li>}
                    </ul>
                  </div>

                  {/* Writing Revolution Concepts / Next Steps */}
                  {(Array.isArray(nextSteps) || typeof nextSteps === 'object') && (
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                      <div className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                        <span>📚</span>
                        <span>{expandedPhase === 'writing' ? 'Next Steps' : 'The Writing Revolution - Key Strategies'}</span>
                      </div>
                      <ul className="space-y-1">
                        {Array.isArray(nextSteps) ? nextSteps.map((item, i) => (
                          <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                            • {item}
                          </li>
                        )) : typeof nextSteps === 'object' ? Object.entries(nextSteps).map(([key, value], i) => (
                          <li key={i} className="text-white/90 text-sm leading-relaxed pl-4">
                            <strong>{key}:</strong> {value as string}
                          </li>
                        )) : null}
                      </ul>
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

        {/* LP Change Banner */}
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

        {/* Rewards */}
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

        {/* Rankings with Phase Breakdown */}
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

