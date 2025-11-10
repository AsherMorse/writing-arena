'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function PracticeSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');

  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
  const [isWriting, setIsWriting] = useState(false);
  const [writingContent, setWritingContent] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // Sample prompts - in production, these would come from a database
  const prompts = {
    narrative: {
      image: '🌄',
      title: 'An Unexpected Adventure',
      description: 'Write a story about a character who discovers something surprising on an ordinary day.',
      guideQuestions: [
        'Who is your main character?',
        'What surprising thing do they discover?',
        'How does this change their day?',
        'How does the story end?'
      ]
    },
    descriptive: {
      image: '🏰',
      title: 'A Mysterious Place',
      description: 'Describe a place that feels magical or mysterious. Use sensory details to bring it to life.',
      guideQuestions: [
        'What does this place look like?',
        'What sounds can you hear there?',
        'What might you smell or feel?',
        'What makes it special?'
      ]
    },
    informational: {
      image: '🔬',
      title: 'How Things Work',
      description: 'Explain how something works or why something happens. Make it clear and interesting.',
      guideQuestions: [
        'What are you explaining?',
        'What are the main steps or parts?',
        'Why is this important?',
        'What should readers remember?'
      ]
    },
    argumentative: {
      image: '💭',
      title: 'Take a Stand',
      description: 'Should students have more choices in what they learn? State your opinion with reasons.',
      guideQuestions: [
        'What is your position?',
        'What are your strongest reasons?',
        'What examples support your view?',
        'What would you say to someone who disagrees?'
      ]
    }
  };

  const currentPrompt = prompts[promptType as keyof typeof prompts] || prompts.narrative;

  useEffect(() => {
    if (isWriting && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isWriting) {
      handleSubmit();
    }
  }, [isWriting, timeLeft]);

  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsWriting(true);
    setShowPrompt(false);
  };

  const handleSubmit = () => {
    // Navigate to results page with the writing content
    const encodedContent = encodeURIComponent(writingContent);
    router.push(`/practice/results?trait=${trait}&promptType=${promptType}&content=${encodedContent}&wordCount=${wordCount}`);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const getTimeColor = () => {
    if (timeLeft > 120) return 'text-green-400';
    if (timeLeft > 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (showPrompt && !isWriting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center">
            {/* Prompt Display */}
            <div className="text-8xl mb-6">{currentPrompt.image}</div>
            <h1 className="text-4xl font-bold text-white mb-4">{currentPrompt.title}</h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              {currentPrompt.description}
            </p>

            {/* Guide Questions */}
            <div className="bg-white/5 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-white font-semibold mb-4 text-left">Think about:</h3>
              <div className="space-y-2 text-left">
                {currentPrompt.guideQuestions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-3 text-white/70">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div className="flex items-center justify-center space-x-8 mb-8 text-white/60">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⏱️</span>
                <span>4 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span>Solo practice</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <span>AI feedback</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xl rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
            >
              Start Writing! 🚀
            </button>

            <p className="text-white/40 text-sm mt-6">The timer will start when you click the button</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Timer Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/60">
                {timeLeft > 0 ? 'Keep writing!' : 'Time\'s up!'}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCount}</span> words
              </div>
              <div className="text-white/60">
                Focus: <span className="font-semibold text-white capitalize">{trait}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
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

      {/* Writing Area */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Prompt Reference (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-24">
              <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <span className="text-2xl">{currentPrompt.image}</span>
                <span>Your Prompt</span>
              </h3>
              <div className="text-white/80 mb-4 text-sm leading-relaxed">
                {currentPrompt.description}
              </div>
              
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="text-white/60 text-xs mb-2">Remember to think about:</div>
                <div className="space-y-2">
                  {currentPrompt.guideQuestions.map((question, index) => (
                    <div key={index} className="text-white/50 text-xs flex items-start space-x-2">
                      <span className="text-green-400">•</span>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Writing Box */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-2xl min-h-[600px] relative">
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCut={handleCut}
                placeholder="Start writing here... Let your ideas flow!"
                className="w-full h-full min-h-[550px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
                autoFocus
              />
              
              {/* Paste Warning */}
              {showPasteWarning && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top duration-200 border-2 border-red-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚫</span>
                    <div>
                      <div className="font-bold">Paste Not Allowed</div>
                      <div className="text-sm text-white/90">Please type your own original work</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="text-white/60 text-sm">
                <span className="font-semibold text-white">💡 Tip:</span> Don't worry about perfection! 
                Focus on getting your ideas down. You'll get feedback after the session.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading session...</div>
      </div>
    }>
      <PracticeSessionContent />
    </Suspense>
  );
}

