'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import { useAuth } from '@/contexts/AuthContext';
import { submitPhase, getAssignedPeer } from '@/lib/services/match-sync';

// Mock peer writings - in reality, these would come from other players
const MOCK_PEER_WRITINGS = [
  {
    id: 'peer1',
    author: 'ProWriter99',
    avatar: '🎯',
    rank: 'Silver II',
    content: `The old lighthouse stood sentinel on the rocky cliff, its weathered stones telling stories of countless storms. Sarah had passed it every day on her way to school, never giving it much thought. But today was different. Today, the rusty door that had always been locked stood slightly ajar, and a mysterious golden light spilled from within.

Her curiosity got the better of her. She pushed the door open and stepped inside. The circular room was dusty and filled with old equipment, but in the center sat an ornate wooden chest she'd never seen before. As she approached, the chest began to glow...`,
    wordCount: 112
  },
  {
    id: 'peer2',
    author: 'WordMaster',
    avatar: '📖',
    rank: 'Silver III',
    content: `It was a normal Tuesday morning. I woke up, got dressed, and went to school like always. Nothing interesting ever happens in my small town. But then something weird happened.

At lunch, I found a strange coin in my sandwich. It was old and had weird symbols on it. When I touched it, everything around me started to shimmer and change. Suddenly I wasn't in the cafeteria anymore.

I was standing in a forest I'd never seen before. There were trees everywhere and strange birds singing. I had no idea how I got there or how to get back home.`,
    wordCount: 104
  }
];

export default function PeerFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const matchId = searchParams.get('matchId') || '';
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';

  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for peer feedback
  const [currentPeer, setCurrentPeer] = useState<any>(null);
  const [loadingPeer, setLoadingPeer] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);
  
  // Feedback questions and responses
  const [responses, setResponses] = useState({
    clarity: '',
    strengths: '',
    improvements: '',
    organization: '',
    engagement: ''
  });

  // Generate AI peer feedback when phase starts
  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!matchId || !user || aiFeedbackGenerated) return;
      
      console.log('🤖 PEER FEEDBACK - Generating AI peer feedback...');
      setAiFeedbackGenerated(true);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        // Get match state to find AI players and their assigned peers
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const writings = matchState.aiWritings?.phase1 || [];
        
        // Generate feedback for each AI player
        const aiFeedbackPromises = aiPlayers.map(async (aiPlayer: any, idx: number) => {
          // Get AI's assigned peer (round-robin)
          const aiIndex = players.findIndex((p: any) => p.userId === aiPlayer.userId);
          const peerIndex = (aiIndex + 1) % players.length;
          const peer = players[peerIndex];
          
          // Get peer's writing
          let peerWriting = '';
          if (peer.isAI) {
            const aiWriting = writings.find((w: any) => w.playerId === peer.userId);
            peerWriting = aiWriting?.content || '';
          } else {
            const rankings = matchState.rankings?.phase1 || [];
            const peerRanking = rankings.find((r: any) => r.playerId === peer.userId);
            peerWriting = peerRanking?.content || '';
          }
          
          if (!peerWriting) return null;
          
          // Generate AI feedback
          const response = await fetch('/api/generate-ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peerWriting,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const data = await response.json();
          console.log(`✅ Generated feedback from ${aiPlayer.displayName}`);
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            responses: data.responses,
            peerWriting,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        
        // Store AI feedback in Firestore
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiFeedbacks.phase2': aiFeedbacks,
        });
        
        console.log('✅ PEER FEEDBACK - All AI feedback generated and stored');
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Failed to generate AI feedback:', error);
      }
    };
    
    generateAIFeedback();
  }, [matchId, user, aiFeedbackGenerated]);

  // Load assigned peer's writing
  useEffect(() => {
    const loadPeerWriting = async () => {
      if (!user || !matchId) {
        setLoadingPeer(false);
        return;
      }
      
      console.log('👥 PEER FEEDBACK - Loading assigned peer writing...');
      try {
        const assignedPeer = await getAssignedPeer(matchId, user.uid);
        
        if (assignedPeer) {
          console.log('✅ PEER FEEDBACK - Loaded peer:', assignedPeer.displayName);
          setCurrentPeer({
            id: assignedPeer.userId,
            author: assignedPeer.displayName,
            avatar: '📝',
            rank: 'Silver III',
            content: assignedPeer.writing,
            wordCount: assignedPeer.wordCount,
          });
        } else {
          console.warn('⚠️ PEER FEEDBACK - No assigned peer found, using fallback');
          setCurrentPeer(MOCK_PEER_WRITINGS[0]);
        }
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Error loading peer:', error);
        setCurrentPeer(MOCK_PEER_WRITINGS[0]);
      } finally {
        setLoadingPeer(false);
      }
    };
    
    loadPeerWriting();
  }, [user, matchId]);

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

  const isFormComplete = () => {
    return Object.values(responses).every(response => response.trim().length > 10);
  };

  const handleSubmit = async () => {
    console.log('📤 PEER FEEDBACK - Submitting for batch ranking...');
    setIsEvaluating(true);
    
    try {
      // Get AI feedback submissions from Firestore
      const { getDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
      if (!matchDoc.exists()) throw new Error('Match state not found');
      
      const matchState = matchDoc.data();
      const aiFeedbacks = matchState?.aiFeedbacks?.phase2 || [];
      
      if (aiFeedbacks.length === 0) {
        console.warn('⚠️ PEER FEEDBACK - No AI feedback found, falling back to individual evaluation');
        throw new Error('AI feedback not available');
      }
      
      // Prepare all feedback submissions for batch ranking
      const allFeedbackSubmissions = [
        {
          playerId: user?.uid || '',
          playerName: 'You',
          responses,
          peerWriting: currentPeer?.content || '',
          isAI: false,
        },
        ...aiFeedbacks
      ];
      
      console.log(`📊 PEER FEEDBACK - Batch ranking ${allFeedbackSubmissions.length} feedback submissions...`);
      
      // Call batch ranking API
      const response = await fetch('/api/batch-rank-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackSubmissions: allFeedbackSubmissions,
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      console.log('✅ PEER FEEDBACK - Batch ranking complete:', rankings.length, 'feedback ranked');
      
      // Find your ranking
      const yourRanking = rankings.find((r: any) => r.playerId === user?.uid);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const feedbackScore = yourRanking.score;
      
      console.log(`🎯 PEER FEEDBACK - You ranked #${yourRanking.rank} with score ${feedbackScore}`);
      
      // Store ALL feedback rankings in Firestore
      const matchRef = doc(db, 'matchStates', matchId);
      await updateDoc(matchRef, {
        'rankings.phase2': rankings,
      });
      
      // Save feedback to session storage
      sessionStorage.setItem(`${matchId}-phase2-feedback`, JSON.stringify(yourRanking));
      
      // Submit to match state WITH full AI feedback
      if (user) {
        await submitPhase(matchId, user.uid, 2, Math.round(feedbackScore), {
          strengths: yourRanking.strengths || [],
          improvements: yourRanking.improvements || [],
        });
      }
      
      // Route to phase 2 rankings screen, then to revision
      router.push(
        `/ranked/phase-rankings?phase=2&matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackScore)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
      );
      
    } catch (error) {
      console.error('❌ PEER FEEDBACK - Batch ranking failed, using fallback:', error);
      
      // Fallback to individual evaluation
      try {
        const response = await fetch('/api/evaluate-peer-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses,
            peerWriting: currentPeer?.content || '',
          }),
        });
        
        const data = await response.json();
        const feedbackScore = data.score || 75;
        console.log('✅ PEER FEEDBACK - Fallback evaluation complete, score:', feedbackScore);
        
        sessionStorage.setItem(`${matchId}-phase2-feedback`, JSON.stringify(data));
        
        if (user) {
          await submitPhase(matchId, user.uid, 2, Math.round(feedbackScore), {
            strengths: data.strengths || [],
            improvements: data.improvements || [],
          });
        }
        
        router.push(
          `/ranked/phase-rankings?phase=2&matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackScore)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
        );
      } catch (fallbackError) {
        console.error('❌ PEER FEEDBACK - Even fallback failed:', fallbackError);
        const feedbackQuality = isFormComplete() ? Math.random() * 20 + 75 : Math.random() * 30 + 50;
        
        if (user) {
          await submitPhase(matchId, user.uid, 2, Math.round(feedbackQuality)).catch(console.error);
        }
        
        router.push(
          `/ranked/phase-rankings?phase=2&matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackQuality)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
        );
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Peer Feedback Tips Modal - using 'informational' type for evaluation guidance */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType="informational"
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Feedback Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Feedback Tips
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
                {timeLeft > 0 ? 'Time remaining' : 'Time&apos;s up!'}
              </div>
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <span className="text-blue-400 text-sm font-semibold">📝 PHASE 2: PEER FEEDBACK</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormComplete() || isEvaluating}
              className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                isFormComplete() && !isEvaluating
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isEvaluating ? 'Evaluating...' : isFormComplete() ? 'Submit Feedback' : 'Complete All Questions'}
            </button>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft > 120 ? 'bg-green-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(timeLeft / 180) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Evaluate Your Peer&apos;s Writing</h1>
          <p className="text-white/80">
            Your feedback will be scored on helpfulness and specificity. Be constructive and detailed!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left side - Peer's writing */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {loadingPeer || !currentPeer ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 animate-spin">📖</div>
                  <div className="text-white/60">Loading peer&apos;s writing...</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{currentPeer.avatar}</span>
                    <div>
                      <div className="text-white font-bold">{currentPeer.author}</div>
                      <div className="text-white/60 text-sm">{currentPeer.rank} &bull; {currentPeer.wordCount} words</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 max-h-[600px] overflow-y-auto">
                    <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                      {currentPeer.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side - Feedback questions */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">Provide Detailed Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    1. What is the main idea or message? Is it clear?
                  </label>
                  <textarea
                    value={responses.clarity}
                    onChange={(e) => setResponses({...responses, clarity: e.target.value})}
                    placeholder="Explain what the writing is about and whether it's easy to understand..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.clarity.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    2. What are the strongest parts of this writing?
                  </label>
                  <textarea
                    value={responses.strengths}
                    onChange={(e) => setResponses({...responses, strengths: e.target.value})}
                    placeholder="Point out specific examples of what works well..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.strengths.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    3. What could be improved? Be specific.
                  </label>
                  <textarea
                    value={responses.improvements}
                    onChange={(e) => setResponses({...responses, improvements: e.target.value})}
                    placeholder="Give constructive suggestions for improvement..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.improvements.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    4. How well is the writing organized?
                  </label>
                  <textarea
                    value={responses.organization}
                    onChange={(e) => setResponses({...responses, organization: e.target.value})}
                    placeholder="Comment on the structure, flow, and logical order..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.organization.length}/50 characters minimum
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    5. How engaging is this piece? Does it hold your attention?
                  </label>
                  <textarea
                    value={responses.engagement}
                    onChange={(e) => setResponses({...responses, engagement: e.target.value})}
                    placeholder="Describe how the writing makes you feel and why..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px]"
                  />
                  <div className="text-white/40 text-xs mt-1">
                    {responses.engagement.length}/50 characters minimum
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

