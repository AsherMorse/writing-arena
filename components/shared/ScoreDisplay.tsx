'use client';

import { getScoreColor } from '@/lib/utils/score-utils';

interface ScoreDisplayProps {
  label: string;
  score: number;
  maxScore?: number;
  variant?: 'large' | 'medium' | 'small';
  showLabel?: boolean;
  showMaxScore?: boolean;
  className?: string;
}

/**
 * Reusable score display component
 * Provides consistent score rendering across the app
 */
export function ScoreDisplay({ 
  label, 
  score, 
  maxScore = 100, 
  variant = 'large',
  showLabel = true,
  showMaxScore = true,
  className = '',
}: ScoreDisplayProps) {
  const sizeClasses = {
    large: 'text-5xl',
    medium: 'text-3xl',
    small: 'text-xl',
  };
  
  const labelSizeClasses = {
    large: 'text-xs',
    medium: 'text-xs',
    small: 'text-[10px]',
  };
  
  const scoreColorClass = variant === 'large' && className.includes('text-emerald') 
    ? 'text-emerald-200' 
    : getScoreColor(score);
  
  return (
    <div className={className || ''}>
      {showLabel && (
        <div className={`uppercase tracking-[0.3em] text-white/50 ${labelSizeClasses[variant]}`}>
          {label}
        </div>
      )}
      <div className={`mt-3 font-semibold ${scoreColorClass} ${sizeClasses[variant]}`}>
        {score}
      </div>
      {showMaxScore && (
        <p className={`mt-1 text-white/50 ${labelSizeClasses[variant]}`}>
          out of {maxScore}
        </p>
      )}
    </div>
  );
}

