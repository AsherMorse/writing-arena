'use client';

import { useEffect, useState } from 'react';

interface PhaseTransitionProps {
  fromPhase: number;
  toPhase: number;
  onComplete: () => void;
}

export default function PhaseTransition({ fromPhase, toPhase, onComplete }: PhaseTransitionProps) {
  const [progress, setProgress] = useState(0);
  
  const phaseNames = {
    1: 'Writing',
    2: 'Peer Feedback',
    3: 'Revision',
    4: 'Results',
  };
  
  const phaseTips = {
    2: 'Read carefully and provide specific feedback using TWR strategies',
    3: 'Apply the feedback to improve your writing using sentence expansion, appositives, and combining',
    4: 'See how you ranked and what you learned!',
  };
  
  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return p + 5;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">🔄</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Phase {toPhase} Starting...
          </h2>
          <p className="text-xl text-white/70 mb-6">
            {phaseNames[toPhase as keyof typeof phaseNames]}
          </p>
          <p className="text-sm text-white/60 italic">
            {phaseTips[toPhase as keyof typeof phaseTips]}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-white/40 mt-2">Loading Phase {toPhase}...</div>
      </div>
    </div>
  );
}

