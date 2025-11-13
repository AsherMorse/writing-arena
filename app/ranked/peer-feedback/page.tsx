'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/WritingTipsModal';

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

function RankedPeerFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';

  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for peer feedback
  const [currentPeer] = useState(MOCK_PEER_WRITINGS[0]); // In reality, match them with actual peer
  const [showTipsModal, setShowTipsModal] = useState(false);
  
  // Feedback questions and responses
  const [responses, setResponses] = useState({
    clarity: '',
    strengths: '',
    improvements: '',
    organization: '',
    engagement: ''
  });

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

  const handleSubmit = () => {
    // Mock peer feedback score (how well they gave feedback)
    const feedbackQuality = isFormComplete() ? Math.random() * 20 + 75 : Math.random() * 30 + 50;
    
    router.push(
      `/ranked/revision?trait=${trait}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${Math.round(feedbackQuality)}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
              disabled={!isFormComplete()}
              className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                isFormComplete()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isFormComplete() ? 'Submit Feedback' : 'Complete All Questions'}
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
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{currentPeer.avatar}</span>
                <div>
                  <div className="text-white font-bold">{currentPeer.author}</div>
                  <div className="text-white/60 text-sm">{currentPeer.rank} • {currentPeer.wordCount} words</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 max-h-[600px] overflow-y-auto">
                <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                  {currentPeer.content}
                </p>
              </div>
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

export default function RankedPeerFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading peer feedback phase...</div>
      </div>
    }>
      <RankedPeerFeedbackContent />
    </Suspense>
  );
}

