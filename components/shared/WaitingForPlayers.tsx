'use client';

import { useState, useEffect } from 'react';

interface WaitingForPlayersProps {
  phase: 1 | 2 | 3;
  playersReady: number;
  totalPlayers: number;
  timeRemaining: number;
}

export default function WaitingForPlayers({ 
  phase, 
  playersReady, 
  totalPlayers,
  timeRemaining
}: WaitingForPlayersProps) {
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  const phaseNames = {
    1: 'Writing',
    2: 'Peer Feedback',
    3: 'Revision',
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Writing Revolution concepts carousel
  const writingConcepts = [
    {
      name: 'Sentence Expansion',
      tip: 'Use because, but, or so to show why things happen.',
      example: 'She opened the door because she heard a strange noise.',
      icon: '🔗',
    },
    {
      name: 'Appositives',
      tip: 'Add description using commas to provide extra information.',
      example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
      icon: '✏️',
    },
    {
      name: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel.',
      example: 'The salty air stung my eyes while waves crashed loudly below.',
      icon: '👁️',
    },
    {
      name: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements.',
      example: 'Her hands trembled as she reached for the handle.',
      icon: '🎭',
    },
    {
      name: 'Transition Words',
      tip: 'Use signal words to connect ideas smoothly.',
      example: 'First, Then, However, Therefore, For example',
      icon: '➡️',
    },
    {
      name: 'Topic Sentences',
      tip: 'Start paragraphs with a clear main idea.',
      example: 'Photosynthesis is how plants make food.',
      icon: '📝',
    },
  ];

  // Rotate concepts every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % writingConcepts.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [writingConcepts.length]);
  
  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center py-6 px-4">
      <div className="max-w-4xl w-full">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2 animate-bounce">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Waiting for Other Players
          </h1>
          <p className="text-white/60 text-sm">
            You've completed {phaseNames[phase]}!
          </p>
        </div>

        {/* Main Content Grid - Side by Side */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Left: Progress Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="text-4xl font-bold text-white">{playersReady}</div>
              <div className="text-2xl text-white/40">/</div>
              <div className="text-4xl font-bold text-white/60">{totalPlayers}</div>
            </div>
            <div className="text-white/70 text-sm mb-3">Players Ready</div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${(playersReady / totalPlayers) * 100}%` }}
              />
            </div>
            
            {/* Player Status */}
            <div className="grid grid-cols-5 gap-1.5">
              {[...Array(totalPlayers)].map((_, index) => (
                <div
                  key={index}
                  className={`p-1.5 rounded-lg transition-all ${
                    index < playersReady
                      ? 'bg-green-500/20 border-2 border-green-400'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="text-xl">
                    {index < playersReady ? '✓' : '⏳'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Time Remaining */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3 text-center">
              <div className="text-white/70 text-xs mb-1">Time Left</div>
              <div className="text-2xl font-bold text-white">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Right: Writing Revolution Carousel */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-400/30 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-center mb-2">
                <div className="text-2xl mr-2">{writingConcepts[currentTipIndex].icon}</div>
                <h3 className="text-lg font-bold text-white">
                  {writingConcepts[currentTipIndex].name}
                </h3>
              </div>
              
              <p className="text-white/90 text-sm text-center mb-3 leading-relaxed flex-grow">
                {writingConcepts[currentTipIndex].tip}
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-emerald-300 text-xs font-semibold mb-1 text-center">Example:</div>
                <p className="text-white text-xs italic text-center leading-relaxed">
                  {writingConcepts[currentTipIndex].example}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center space-x-1.5 mt-3">
                {writingConcepts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTipIndex 
                        ? 'bg-emerald-400 w-6' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to tip ${index + 1}`}
                  />
                ))}
              </div>

              <div className="text-center mt-2">
                <p className="text-white/40 text-xs">
                  💡 The Writing Revolution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center">
          <p className="text-white/50 text-xs">
            ✨ Great job! Use this time to learn while others finish...
          </p>
        </div>
      </div>
    </div>
  );
}

