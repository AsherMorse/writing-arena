'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/WritingTipsModal';

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

function RankedRevisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
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
  
  // Parse peer feedback
  let peerFeedback;
  try {
    peerFeedback = JSON.parse(decodeURIComponent(peerFeedbackRaw));
  } catch {
    peerFeedback = {};
  }

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

  const handleSubmit = () => {
    // Mock revision score based on how much they changed and improved
    const changeAmount = Math.abs(wordCountRevised - parseInt(wordCount));
    const hasSignificantChanges = changeAmount > 10;
    const revisionScore = hasSignificantChanges 
      ? Math.min(85 + Math.random() * 10, 95)
      : 60 + Math.random() * 15;
    
    router.push(
      `/ranked/results?trait=${trait}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
    );
  };

  const hasRevised = revisedContent !== originalContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all"
              >
                Submit Revision
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
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 sticky top-24">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Feedback</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-emerald-400 text-sm font-semibold mb-2">✨ Strengths</div>
                    <ul className="space-y-1">
                      {MOCK_AI_FEEDBACK.strengths.map((strength, i) => (
                        <li key={i} className="text-white/80 text-sm leading-relaxed">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-yellow-400 text-sm font-semibold mb-2">💡 Suggestions</div>
                    <ul className="space-y-1">
                      {MOCK_AI_FEEDBACK.improvements.map((improvement, i) => (
                        <li key={i} className="text-white/80 text-sm leading-relaxed">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Peer Feedback - MOCK */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Peer Feedback</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-emerald-400 text-xs font-semibold mb-1">Strengths noted:</div>
                    <p className="text-white/80 text-sm leading-relaxed break-words">
                      Your story has a great sense of mystery and adventure. The lighthouse setting is really interesting and makes me want to know more. The golden light is a nice detail that adds magic to the scene.
                    </p>
                  </div>

                  <div>
                    <div className="text-yellow-400 text-xs font-semibold mb-1">Suggestions:</div>
                    <p className="text-white/80 text-sm leading-relaxed break-words">
                      Try adding more description about what Sarah is feeling - is she scared, excited, or curious? Also, what does the inside of the lighthouse look like? Adding more sensory details would help readers feel like they&apos;re there with Sarah.
                    </p>
                  </div>

                  <div>
                    <div className="text-blue-400 text-xs font-semibold mb-1">Organization:</div>
                    <p className="text-white/80 text-sm leading-relaxed break-words">
                      The story flows well from the ordinary to the mysterious. Good job building up to the discovery!
                    </p>
                  </div>
                </div>
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
                placeholder="Revise your writing based on the feedback..."
                className="w-full h-full min-h-[450px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RankedRevisionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading revision phase...</div>
      </div>
    }>
      <RankedRevisionContent />
    </Suspense>
  );
}

