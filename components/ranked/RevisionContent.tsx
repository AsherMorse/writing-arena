'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import { useAuth } from '@/contexts/AuthContext';
import { submitPhase, getPeerFeedbackResponses } from '@/lib/services/match-sync';

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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const matchId = searchParams.get('matchId') || '';
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const originalContent = decodeURIComponent(searchParams.get('content') || '');
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';
  const feedbackScore = searchParams.get('feedbackScore') || '80';
  const peerFeedbackRaw = searchParams.get('peerFeedback') || '{}';
  
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes for revision
  const [revisedContent, setRevisedContent] = useState(originalContent);
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [realPeerFeedback, setRealPeerFeedback] = useState<any>(null);
  const [loadingPeerFeedback, setLoadingPeerFeedback] = useState(true);
  const [aiRevisionsGenerated, setAiRevisionsGenerated] = useState(false);
  
  // Parse peer feedback
  let peerFeedback;
  try {
    peerFeedback = JSON.parse(decodeURIComponent(peerFeedbackRaw));
  } catch {
    peerFeedback = {};
  }

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

  // Fetch real AI feedback on component mount
  useEffect(() => {
    const fetchAIFeedback = async () => {
      console.log('🤖 REVISION - Fetching AI feedback...');
      try {
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: originalContent,
            promptType: promptType || 'narrative',
          }),
        });
        
        const data = await response.json();
        console.log('✅ REVISION - AI feedback received');
        setAiFeedback(data);
      } catch (error) {
        console.error('❌ REVISION - Failed to fetch AI feedback, using mock');
        setAiFeedback(MOCK_AI_FEEDBACK);
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchAIFeedback();
  }, [originalContent, promptType]);

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
        
        // Generate revisions for each AI player
        const aiRevisionPromises = aiPlayers.map(async (aiPlayer: any) => {
          // Get AI's original writing
          const aiWriting = phase1Writings.find((w: any) => w.playerId === aiPlayer.userId);
          if (!aiWriting) return null;
          
          // Generate AI feedback for this AI (they got feedback too)
          const feedbackResponse = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: aiWriting.content,
              promptType: promptType || 'narrative',
            }),
          });
          
          const feedbackData = await feedbackResponse.json();
          
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
  }, [matchId, user, aiRevisionsGenerated, promptType]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

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
    if (timeLeft > 120) return 'text-green-400';
    if (timeLeft > 60) return 'text-yellow-400';
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
      
      // Submit to match state WITH full AI feedback
      if (user) {
        await submitPhase(matchId, user.uid, 3, Math.round(revisionScore), {
          improvements: yourRanking.improvements || [],
          strengths: yourRanking.strengths || [],
          suggestions: yourRanking.suggestions || [],
        });
      }
      
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
        
        if (user) {
          await submitPhase(matchId, user.uid, 3, Math.round(revisionScore), {
            improvements: data.improvements || [],
            strengths: data.strengths || [],
            suggestions: data.suggestions || [],
          });
        }
        
        router.push(
          `/ranked/results?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
        );
      } catch (fallbackError) {
        console.error('❌ REVISION - Even fallback failed:', fallbackError);
        const changeAmount = Math.abs(wordCountRevised - parseInt(wordCount));
        const hasSignificantChanges = changeAmount > 10;
        const revisionScore = hasSignificantChanges 
          ? Math.min(85 + Math.random() * 10, 95)
          : 60 + Math.random() * 15;
        
        if (user) {
          await submitPhase(matchId, user.uid, 3, Math.round(revisionScore)).catch(console.error);
        }
        
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
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60">
                {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
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
                    ({wordCountRevised > parseInt(wordCount) ? '+' : ''}{wordCountRevised - parseInt(wordCount)})
                  </span>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                  isEvaluating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isEvaluating ? 'Evaluating...' : 'Submit Revision'}
              </button>
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft > 120 ? 'bg-green-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeLeft / 240) * 100}%` }}
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

