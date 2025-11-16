'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { getPeerFeedbackResponses } from '@/lib/services/match-sync';

// Mock AI feedback - will be replaced with real AI later
const MOCK_AI_FEEDBACK = {
  strengths: [
    "Strong opening hook that draws the reader in",
    "Good use of descriptive language and sensory details",
    "Clear narrative structure with a beginning, middle, and setup for continuation"
  ],
  improvements: [
    "Consider adding more character development - what does Sarah look like? What are her motivations?",
    "The pacing could be slower to build more tension before discovering the chest",
    "Add more specific details about the lighthouse's interior to create atmosphere"
  ],
  score: 78
};

export default function RevisionContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { user } = useAuth();
  
  // NEW: Use session hook
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
  } = useSession(sessionId);
  
  const matchId = session?.matchId || '';
  const trait = session?.config.trait || 'all';
  const promptId = session?.config.promptId || '';
  const promptType = session?.config.promptType || 'narrative';
  
  // Get original content from session player data
  const originalContent = user && session ? (session.players[user.uid]?.phases.phase1?.content || '') : '';
  const yourScore = user && session ? (session.players[user.uid]?.phases.phase1?.score || 75) : 75;
  const feedbackScore = user && session ? (session.players[user.uid]?.phases.phase2?.score || 80) : 80;
  const wordCount = user && session ? (session.players[user.uid]?.phases.phase1?.wordCount || 0) : 0;
  const aiScores = ''; // TODO: Extract from session data
  
  const [revisedContent, setRevisedContent] = useState(originalContent);
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [realPeerFeedback, setRealPeerFeedback] = useState<any>(null);
  const [loadingPeerFeedback, setLoadingPeerFeedback] = useState(true);
  const [aiRevisionsGenerated, setAiRevisionsGenerated] = useState(false);
  

  // Fetch real peer feedback from Phase 2
  useEffect(() => {
    const fetchPeerFeedback = async () => {
      if (!user || !matchId) {
        setLoadingPeerFeedback(false);
        return;
      }
      
      console.log('👥 REVISION - Fetching peer feedback from Phase 2...');
      try {
        const peerFeedbackData = await getPeerFeedbackResponses(matchId, user.uid);
        
        if (peerFeedbackData) {
          console.log('✅ REVISION - Loaded peer feedback from:', peerFeedbackData.reviewerName);
          setRealPeerFeedback(peerFeedbackData);
        } else {
          console.warn('⚠️ REVISION - No peer feedback found, will show placeholder');
        }
      } catch (error) {
        console.error('❌ REVISION - Error loading peer feedback:', error);
      } finally {
        setLoadingPeerFeedback(false);
      }
    };
    
    fetchPeerFeedback();
  }, [user, matchId]);

  // Generate REAL AI feedback for user's writing
  useEffect(() => {
    if (!originalContent || !session || loadingFeedback === false) return;
    
    const generateRealFeedback = async () => {
      console.log('🤖 REVISION - Generating REAL AI feedback for your writing...');
      
      try {
        // Call the generate-feedback API with YOUR actual writing
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: originalContent,
            promptType: session.config.promptType,
          }),
        });
        
        const feedback = await response.json();
        console.log('✅ REVISION - Real AI feedback generated:', feedback);
        
        setAiFeedback({
          strengths: feedback.strengths || [],
          improvements: feedback.improvements || [],
          score: feedback.score || 75,
        });
      } catch (error) {
        console.error('❌ REVISION - Failed to generate feedback:', error);
        setAiFeedback(MOCK_AI_FEEDBACK);
      } finally {
        setLoadingFeedback(false);
      }
    };
    
    generateRealFeedback();
  }, [originalContent, session, loadingFeedback]);

  // Generate AI revisions when phase starts
  useEffect(() => {
    const generateAIRevisions = async () => {
      if (!matchId || !user || aiRevisionsGenerated) return;
      
      console.log('🤖 REVISION - Generating AI revisions...');
      setAiRevisionsGenerated(true);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        // Get match state to find AI players and their writings/feedback
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const phase1Writings = matchState.aiWritings?.phase1 || [];
        
        // Get Phase 1 rankings to use the feedback that was already generated
        const phase1Rankings = matchState.rankings?.phase1 || [];
        
        // Generate revisions for each AI player
        const aiRevisionPromises = aiPlayers.map(async (aiPlayer: any) => {
          // Get AI's original writing
          const aiWriting = phase1Writings.find((w: any) => w.playerId === aiPlayer.userId);
          if (!aiWriting) return null;
          
          // Get AI's feedback from Phase 1 rankings (already generated)
          const aiRanking = phase1Rankings.find((r: any) => r.playerId === aiPlayer.userId);
          const feedbackData = {
            strengths: aiRanking?.strengths || ['Good attempt at addressing the prompt'],
            improvements: aiRanking?.improvements || ['Could add more detail'],
            score: aiRanking?.score || 70,
          };
          
          console.log(`🤖 Using Phase 1 feedback for ${aiPlayer.displayName}:`, feedbackData);
          
          // Generate revision
          const revisionResponse = await fetch('/api/generate-ai-revision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              originalContent: aiWriting.content,
              feedback: feedbackData,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const revisionData = await revisionResponse.json();
          console.log(`✅ Generated revision for ${aiPlayer.displayName}:`, revisionData.wordCount, 'words');
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            originalContent: aiWriting.content,
            revisedContent: revisionData.content,
            wordCount: revisionData.wordCount,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiRevisions = (await Promise.all(aiRevisionPromises)).filter(r => r !== null);
        
        // Store AI revisions in Firestore
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiRevisions.phase3': aiRevisions,
        });
        
        console.log('✅ REVISION - All AI revisions generated and stored');
      } catch (error) {
        console.error('❌ REVISION - Failed to generate AI revisions:', error);
      }
    };
    
    generateAIRevisions();
  }, [matchId, user, aiRevisionsGenerated]);

  // Auto-submit when time runs out
  // Track when phase started to prevent immediate submission on phase load
  const [phaseLoadTime] = useState(Date.now());
  
  useEffect(() => {
    const phaseAge = Date.now() - phaseLoadTime;
    
    // Only log significant events
    if (timeRemaining === 0 || (timeRemaining % 10 === 0 && timeRemaining <= 30)) {
      console.log('🔍 PHASE 3 AUTO-SUBMIT CHECK:', {
        timeRemaining,
        willSubmit: timeRemaining === 0 && !hasSubmitted() && phaseAge > 3000,
      });
    }
    
    // Only auto-submit if:
    // 1. Time is 0
    // 2. Haven't submitted
    // 3. Phase has been loaded for at least 3 seconds (prevent immediate submit on transition)
    if (timeRemaining === 0 && !hasSubmitted() && phaseAge > 3000) {
      console.log('⏰ PHASE 3 - Timer expired, auto-submitting...');
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, hasSubmitted]);
  
  // PHASE COMPLETION MONITOR (Cloud Function primary, client fallback)
  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    
    // IMPORTANT: Only check if we're still in Phase 3 and not completed
    if (session.config.phase !== 3) return;
    if (session.state === 'completed' as any) return;
    
    const allPlayers = Object.values(session.players);
    const realPlayers = allPlayers.filter((p: any) => !p.isAI);
    const submittedRealPlayers = realPlayers.filter((p: any) => p.phases.phase3?.submitted);
    
    console.log('🔍 PHASE MONITOR - Phase 3 submissions:', {
      currentPhase: session.config.phase,
      state: session.state,
      real: realPlayers.length,
      submitted: submittedRealPlayers.length,
    });
    
    if (submittedRealPlayers.length === realPlayers.length && session.state !== 'completed') {
      console.log('⏱️ PHASE MONITOR - All submitted, waiting for Cloud Function...');
      
      // Fallback after 10 seconds
      const fallbackTimer = setTimeout(async () => {
        console.warn('⚠️ FALLBACK - Cloud Function timeout, marking completed client-side...');
        
        try {
          const { updateDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/config/firebase');
          const sessionRef = doc(db, 'sessions', session.sessionId);
          
          await updateDoc(sessionRef, {
            'coordination.allPlayersReady': true,
            'state': 'completed',
            updatedAt: Date.now(),
          });
          
          console.log('✅ FALLBACK - Session marked completed');
        } catch (error) {
          console.error('❌ FALLBACK - Completion failed:', error);
        }
      }, 10000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [session, hasSubmitted]);

  useEffect(() => {
    const words = revisedContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCountRevised(words.length);
  }, [revisedContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 30) return 'text-green-400';
    if (timeRemaining > 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleSubmit = async () => {
    console.log('📤 REVISION - Submitting for batch ranking...');
    setIsEvaluating(true);
    
    try {
      // Get AI revisions from Firestore
      const { getDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (!matchDoc.exists()) throw new Error('Match state not found');
      
      const matchState = matchDoc.data();
      const aiRevisions = matchState?.aiRevisions?.phase3 || [];
      
      if (aiRevisions.length === 0) {
        console.warn('⚠️ REVISION - No AI revisions found, falling back to individual evaluation');
        throw new Error('AI revisions not available');
      }
      
      // Prepare all revision submissions for batch ranking
      const allRevisionSubmissions = [
        {
          playerId: user?.uid || '',
          playerName: 'You',
          originalContent,
          revisedContent,
          feedback: aiFeedback,
          wordCount: wordCountRevised,
          isAI: false,
        },
        ...aiRevisions
      ];
      
      console.log(`📊 REVISION - Batch ranking ${allRevisionSubmissions.length} revisions...`);
      
      // Call batch ranking API
      const response = await fetch('/api/batch-rank-revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionSubmissions: allRevisionSubmissions,
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      console.log('✅ REVISION - Batch ranking complete:', rankings.length, 'revisions ranked');
      
      // Find your ranking
      const yourRanking = rankings.find((r: any) => r.playerId === user?.uid);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const revisionScore = yourRanking.score;
      
      console.log(`🎯 REVISION - You ranked #${yourRanking.rank} with score ${revisionScore}`);
      
      // Store ALL revision rankings in Firestore
      const matchRef = doc(db, 'matchStates', matchId);
      await updateDoc(matchRef, {
        'rankings.phase3': rankings,
      });
      
      // Save feedback to session storage
      sessionStorage.setItem(`${matchId}-phase3-feedback`, JSON.stringify(yourRanking));
      
      // NEW: Submit using session architecture
      await submitPhase(3, {
        revisedContent,
        wordCount: wordCountRevised,
        score: Math.round(revisionScore),
        });
      
      router.push(
        `/ranked/results?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
      );
      
    } catch (error) {
      console.error('❌ REVISION - Batch ranking failed, using fallback:', error);
      
      // Fallback to individual evaluation
      try {
        const response = await fetch('/api/evaluate-revision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalContent,
            revisedContent,
            feedback: aiFeedback,
          }),
        });
        
        const data = await response.json();
        const revisionScore = data.score || 75;
        console.log('✅ REVISION - Fallback evaluation complete, score:', revisionScore);
        
        sessionStorage.setItem(`${matchId}-phase3-feedback`, JSON.stringify(data));
        
        await submitPhase(3, {
          revisedContent,
          wordCount: wordCountRevised,
          score: Math.round(revisionScore),
          });
        
        router.push(
          `/ranked/results?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
        );
      } catch (fallbackError) {
        console.error('❌ REVISION - Even fallback failed:', fallbackError);
        const changeAmount = Math.abs(wordCountRevised - wordCount);
        const hasSignificantChanges = changeAmount > 10;
        const revisionScore = hasSignificantChanges 
          ? Math.min(85 + Math.random() * 10, 95)
          : 60 + Math.random() * 15;
        
        await submitPhase(3, {
          revisedContent,
          wordCount: wordCountRevised,
          score: Math.round(revisionScore),
        }).catch(console.error);
        
        router.push(
          `/ranked/results?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
        );
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const hasRevised = revisedContent !== originalContent;

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Ranking Modal */}
      {showRankingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-emerald-400/30 bg-[#141e27] p-12 shadow-2xl text-center max-w-md mx-4">
            <div className="text-6xl mb-6 animate-bounce">✨</div>
            <h2 className="text-3xl font-bold text-white mb-3">Time&apos;s Up!</h2>
            <p className="text-white/70 text-lg mb-6">
              Evaluating revisions and calculating final scores...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Tips Modal */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={promptType || 'narrative'}
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Revision Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">✏️</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Revision Tips
          </div>
        </div>
      </button>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-white/60">
                {timeRemaining > 0 ? 'Time remaining' : 'Time\'s up!'}
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold">✏️ PHASE 3: REVISION</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCountRevised}</span> words
                {hasRevised && (
                  <span className="ml-2 text-emerald-400">
                    ({wordCountRevised > wordCount ? '+' : ''}{wordCountRevised - wordCount})
                  </span>
                )}
              </div>
              <div className="px-6 py-2 text-white/60 text-sm">
                ⏱️ Submit automatically at 0:00
              </div>
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeRemaining > 30 ? 'bg-green-400' : timeRemaining > 15 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeRemaining / 60) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="mb-6 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Revise Your Writing</h1>
          <p className="text-white/80">
            Use the feedback from your peer and AI to improve your writing. Make meaningful changes!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* Left sidebar - Feedback */}
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="w-full lg:hidden px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {showFeedback ? 'Hide' : 'Show'} Feedback
            </button>

            <div className={`space-y-4 ${showFeedback ? 'block' : 'hidden lg:block'}`}>
              {/* AI Feedback */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Feedback</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-emerald-400 text-sm font-semibold mb-2">✨ Strengths</div>
                    {loadingFeedback ? (
                    <div className="text-white/60 text-sm">Loading AI feedback...</div>
                  ) : (
                    <ul className="space-y-1">
                      {aiFeedback.strengths.map((strength, i) => (
                        <li key={i} className="text-white/80 text-sm leading-relaxed">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>

                  <div>
                    <div className="text-yellow-400 text-sm font-semibold mb-2">💡 Suggestions</div>
                    {loadingFeedback ? (
                      <div className="text-white/60 text-sm">Loading AI feedback...</div>
                    ) : (
                      <ul className="space-y-1">
                        {aiFeedback.improvements.map((improvement, i) => (
                          <li key={i} className="text-white/80 text-sm leading-relaxed">
                            • {improvement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Peer Feedback - REAL */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Peer Feedback</span>
                  {realPeerFeedback && (
                    <span className="text-xs text-emerald-400 ml-auto">from {realPeerFeedback.reviewerName}</span>
                  )}
                </h3>
                
                {loadingPeerFeedback ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2 animate-spin">📝</div>
                    <div className="text-white/60 text-sm">Loading peer feedback...</div>
                  </div>
                ) : realPeerFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-blue-400 text-xs font-semibold mb-1">Main Idea Clarity:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.clarity}
                      </p>
                    </div>

                    <div>
                      <div className="text-emerald-400 text-xs font-semibold mb-1">Strengths noted:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.strengths}
                      </p>
                    </div>

                    <div>
                      <div className="text-yellow-400 text-xs font-semibold mb-1">Suggestions:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.improvements}
                      </p>
                    </div>

                    <div>
                      <div className="text-purple-400 text-xs font-semibold mb-1">Organization:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.organization}
                      </p>
                    </div>

                    <div>
                      <div className="text-cyan-400 text-xs font-semibold mb-1">Engagement:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.engagement}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-white/40 text-sm">No peer feedback available</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Original Writing */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-bold mb-3 flex items-center justify-between">
                <span>📄 Your Original Writing</span>
                <span className="text-white/60 text-sm">{wordCount} words</span>
              </h3>
              <div className="bg-white/10 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <p className="text-white/80 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                  {originalContent}
                </p>
              </div>
            </div>

            {/* Revision Editor */}
            <div className="bg-white rounded-xl p-6 shadow-2xl min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 font-bold text-lg">✏️ Your Revision</h3>
                {hasRevised && (
                  <span className="text-emerald-600 text-sm font-semibold animate-pulse">
                    Changes detected!
                  </span>
                )}
              </div>
              <textarea
                value={revisedContent}
                onChange={(e) => setRevisedContent(e.target.value)}
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
                placeholder="Revise your writing based on the feedback..."
                className="w-full h-full min-h-[450px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                spellCheck="true"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

