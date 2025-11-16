'use client';

import { useEffect, useState } from 'react';

interface AnimatedScoreProps {
  score: number;
  label: string;
  delay?: number;
  maxScore?: number;
}

export default function AnimatedScore({ score, label, delay = 0, maxScore = 100 }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  
  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIsRevealed(true);
      
      // Animate score counting up
      const duration = 1000; // 1 second
      const steps = 30;
      const increment = score / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(revealTimer);
  }, [score, delay]);
  
  const getColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getBackgroundColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-400/10';
    if (score >= 70) return 'bg-blue-400/10';
    if (score >= 60) return 'bg-yellow-400/10';
    return 'bg-red-400/10';
  };
  
  return (
    <div className={`rounded-xl border border-white/10 ${getBackgroundColor(score)} p-6 transition-all duration-500 ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="text-sm text-white/60 mb-2">{label}</div>
      <div className={`text-5xl font-bold ${getColor(score)} mb-2`}>
        {displayScore}
        <span className="text-2xl text-white/40">/{maxScore}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(score).replace('text-', 'bg-')} transition-all duration-1000`}
          style={{ width: `${(displayScore / maxScore) * 100}%` }}
        />
      </div>
    </div>
  );
}

