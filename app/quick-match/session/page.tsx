'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function QuickMatchSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');

  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // Simulated party members
  const [partyMembers] = useState([
    { name: 'You', avatar: '🌿', wordCount: 0, isYou: true },
    { name: 'WriteBot', avatar: '🤖', wordCount: 0, isYou: false },
    { name: 'PenPal AI', avatar: '✍️', wordCount: 0, isYou: false },
    { name: 'WordSmith', avatar: '📝', wordCount: 0, isYou: false },
    { name: 'QuillMaster', avatar: '🖋️', wordCount: 0, isYou: false },
  ]);

  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);

  // Sample prompts
  const prompts: Record<string, any> = {
    narrative: {
      image: '🌄',
      title: 'An Unexpected Adventure',
      description: 'Write a story about a character who discovers something surprising on an ordinary day.',
    },
    descriptive: {
      image: '🏰',
      title: 'A Mysterious Place',
      description: 'Describe a place that feels magical or mysterious.',
    },
    informational: {
      image: '🔬',
      title: 'How Things Work',
      description: 'Explain how something works or why something happens.',
    },
    argumentative: {
      image: '💭',
      title: 'Take a Stand',
      description: 'Should students have more choices in what they learn? State your opinion with reasons.',
    }
  };

  const currentPrompt = prompts[promptType as string] || prompts.narrative;

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  // Word count
  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  // Simulate AI writing
  useEffect(() => {
    const interval = setInterval(() => {
      setAiWordCounts(prev => prev.map(count => {
        // AI writes at varying speeds
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
    const encodedContent = encodeURIComponent(writingContent);
    router.push(`/quick-match/results?trait=${trait}&promptType=${promptType}&content=${encodedContent}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Header with Timer */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60">
                {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCount}</span> words
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all"
              >
                Finish Early
              </button>
            </div>
          </div>

          {/* Progress Bar */}
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {/* Party Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 sticky top-24">
              <h3 className="text-white font-bold mb-4 flex items-center space-x-2">
                <span>👥</span>
                <span>Your Party</span>
              </h3>
              
              <div className="space-y-3">
                {/* You */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <div className="text-white font-semibold text-sm">You</div>
                        <div className="text-green-400 text-xs">Writing...</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{wordCount}</div>
                      <div className="text-white/60 text-xs">words</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* AI Players */}
                {aiWordCounts.map((count, index) => {
                  const member = partyMembers[index + 1];
                  return (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{member.avatar}</span>
                          <div>
                            <div className="text-white text-sm">{member.name}</div>
                            <div className="text-orange-400 text-xs">AI</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{count}</div>
                          <div className="text-white/60 text-xs">words</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-orange-400 transition-all duration-500"
                          style={{ width: `${Math.min((count / 200) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Writing Area */}
          <div className="lg:col-span-3">
            {/* Prompt */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-5xl">{currentPrompt.image}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{currentPrompt.title}</h2>
                  <p className="text-white/80 leading-relaxed">{currentPrompt.description}</p>
                </div>
              </div>
            </div>

            {/* Writing Box */}
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
              
              {/* Paste Warning */}
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

export default function QuickMatchSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    }>
      <QuickMatchSessionContent />
    </Suspense>
  );
}

