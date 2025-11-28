'use client';

import { useEffect, useState } from 'react';
import { getScoreColorHex } from '@/lib/utils/score-utils';
import { TIMING } from '@/lib/constants/scoring';

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
      
      const duration = TIMING.ANIMATION_DURATION;
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
  
  // Use centralized score color utility for consistency
  const color = getScoreColorHex(score);
  
  return (
    <div 
      className={`rounded-[14px] border p-6 transition-all duration-500 ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ borderColor: `${color}30`, background: `${color}10` }}
    >
      <div className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">{label}</div>
      <div className="mb-2 font-mono text-4xl font-medium" style={{ color }}>
        {displayScore}
        <span className="text-xl text-[rgba(255,255,255,0.3)]">/{maxScore}</span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
        <div 
          className="h-full rounded-[3px] transition-all duration-1000"
          style={{ width: `${(displayScore / maxScore) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
