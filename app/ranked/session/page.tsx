'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPromptById, getRandomPrompt } from '@/lib/prompts';
import WritingTipsModal from '@/components/WritingTipsModal';

function RankedSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const { userProfile } = useAuth();
  
  // Get prompt from library by ID, or random if not found (memoized to prevent re-shuffling)
  const [prompt] = useState(() => {
    const currentPrompt = promptId ? getPromptById(promptId) : undefined;
    const selectedPrompt = currentPrompt || getRandomPrompt();
    console.log('📝 SESSION - Using prompt:', { id: selectedPrompt.id, title: selectedPrompt.title, type: selectedPrompt.type });
    return selectedPrompt;
  });

  const [timeLeft, setTimeLeft] = useState(240);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  const userRank = userProfile?.currentRank || 'Silver III';
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';

  const [partyMembers] = useState([
    { name: 'You', avatar: userAvatar, rank: userRank, wordCount: 0, isYou: true },
    { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II', wordCount: 0, isYou: false },
    { name: 'WordMaster', avatar: '📖', rank: 'Silver III', wordCount: 0, isYou: false },
    { name: 'EliteScribe', avatar: '✨', rank: 'Silver II', wordCount: 0, isYou: false },
    { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV', wordCount: 0, isYou: false },
  ]);

  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);

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
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiWordCounts(prev => prev.map(count => {
        const increase = Math.floor(Math.random() * 5) + 2;
        return Math.min(count + increase, 250);
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    // Mock AI scoring for phase 1
    const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
    const encodedContent = encodeURIComponent(writingContent);
    console.log('📤 SESSION - Submitting, score:', Math.round(yourScore));
    // Route to peer feedback phase instead of results
    router.push(`/ranked/peer-feedback?trait=${trait}&promptId=${prompt.id}&promptType=${prompt.type}&content=${encodedContent}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}&yourScore=${Math.round(yourScore)}`);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Writing Tips Modal */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={prompt.type}
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Writing Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">💡</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Writing Tips
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
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full">
                <span className="text-purple-400 text-sm font-semibold">🏆 RANKED</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCount}</span> words
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
              >
                Finish Early
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
        <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 sticky top-24">
              <h3 className="text-white font-bold mb-4 flex items-center space-x-2">
                <span>🏆</span>
                <span>Ranked Party</span>
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <div className="text-white font-semibold text-sm">You</div>
                        <div className="text-purple-400 text-xs">Silver III</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{wordCount}</div>
                      <div className="text-white/60 text-xs">words</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {aiWordCounts.map((count, index) => {
                  const member = partyMembers[index + 1];
                  return (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{member.avatar}</span>
                          <div>
                            <div className="text-white text-sm">{member.name}</div>
                            <div className="text-white/60 text-xs">{member.rank}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{count}</div>
                          <div className="text-white/60 text-xs">words</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 transition-all duration-500"
                          style={{ width: `${Math.min((count / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-5xl">{prompt.image}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">{prompt.title}</h2>
                    <span className="text-white/40 text-xs uppercase tracking-wide">{prompt.type}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{prompt.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-2xl min-h-[500px] relative">
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCut={handleCut}
                placeholder="Start writing your response..."
                className="w-full h-full min-h-[450px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
                autoFocus
              />
              
              {showPasteWarning && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top duration-200 border-2 border-red-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚫</span>
                    <div>
                      <div className="font-bold">Paste Not Allowed</div>
                      <div className="text-sm text-white/90">Type your own work</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RankedSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    }>
      <RankedSessionContent />
    </Suspense>
  );
}

