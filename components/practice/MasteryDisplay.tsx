/**
 * @fileoverview Star-based mastery indicator component.
 * Displays mastered (★) or not mastered (☆) status.
 */

'use client';

interface MasteryDisplayProps {
  isMastered: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

/**
 * @description Displays mastery status with filled/empty star.
 */
export function MasteryDisplay({
  isMastered,
  showLabel = false,
  size = 'md',
  animate = false,
}: MasteryDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const labelSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${sizeClasses[size]} ${animate && isMastered ? 'animate-pulse' : ''}`}
        style={{ color: isMastered ? '#FFD700' : 'rgba(255, 255, 255, 0.3)' }}
      >
        {isMastered ? '★' : '☆'}
      </span>
      {showLabel && (
        <span
          className={`font-medium ${labelSizeClasses[size]} ${
            isMastered ? 'text-[#FFD700]' : 'text-[rgba(255,255,255,0.4)]'
          }`}
        >
          {isMastered ? 'Mastered' : 'Not mastered'}
        </span>
      )}
    </div>
  );
}

/**
 * @description Celebration display for first-time mastery.
 */
export function MasteryCelebration({ lessonName }: { lessonName: string }) {
  return (
    <div className="rounded-[14px] border border-[rgba(255,215,0,0.3)] bg-[rgba(255,215,0,0.1)] p-6 text-center">
      <div className="text-5xl">🎉</div>
      <h3 className="mt-4 text-xl font-semibold text-[#FFD700]">First Time Mastered!</h3>
      <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
        You&apos;ve mastered <span className="font-medium text-white">{lessonName}</span>
      </p>
      <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
        This lesson will no longer award LP, but you can still practice anytime.
      </p>
    </div>
  );
}

