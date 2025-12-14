/**
 * @fileoverview Celebratory modal shown when placing in top 3 of a ranked challenge.
 * Features animated confetti-like effects and medal display.
 */
'use client';

import { useEffect, useState } from 'react';
import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture } from './parchment-styles';
import { ParchmentButton } from './ParchmentButton';

interface Top3CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  placement: number;
  score: number;
}

const PLACEMENT_DATA: Record<number, { emoji: string; label: string; color: string; message: string }> = {
  1: {
    emoji: '🥇',
    label: '1st Place',
    color: '#b8860b',
    message: 'Champion of the Challenge!',
  },
  2: {
    emoji: '🥈',
    label: '2nd Place',
    color: '#71717a',
    message: 'Outstanding Performance!',
  },
  3: {
    emoji: '🥉',
    label: '3rd Place',
    color: '#92400e',
    message: 'Well Earned Bronze!',
  },
};

/**
 * @description Animated sparkle/star component for celebration effect.
 */
function Sparkle({ delay, left, top }: { delay: number; left: string; top: string }) {
  return (
    <div
      className="absolute text-2xl animate-pulse pointer-events-none"
      style={{
        left,
        top,
        animationDelay: `${delay}ms`,
        animationDuration: '1.5s',
      }}
    >
      ✨
    </div>
  );
}

/**
 * @description Celebratory modal for top 3 placements with animated effects.
 */
export function Top3CelebrationModal({
  isOpen,
  onClose,
  placement,
  score,
}: Top3CelebrationModalProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay sparkles for dramatic effect
      const timer = setTimeout(() => setShowSparkles(true), 300);
      return () => clearTimeout(timer);
    }
    setShowSparkles(false);
  }, [isOpen]);

  if (!isOpen || placement < 1 || placement > 3) return null;

  const data = PLACEMENT_DATA[placement];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Radial gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${data.color}30 0%, rgba(0,0,0,0.85) 70%)`,
        }}
      />

      {/* Sparkles */}
      {showSparkles && (
        <>
          <Sparkle delay={0} left="15%" top="20%" />
          <Sparkle delay={200} left="80%" top="15%" />
          <Sparkle delay={400} left="10%" top="60%" />
          <Sparkle delay={600} left="85%" top="55%" />
          <Sparkle delay={300} left="25%" top="75%" />
          <Sparkle delay={500} left="70%" top="70%" />
          <Sparkle delay={100} left="50%" top="10%" />
          <Sparkle delay={700} left="40%" top="80%" />
        </>
      )}

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-500"
        style={{
          ...getParchmentContainerStyle(),
          boxShadow: `
            0 0 60px ${data.color}60,
            inset 0 3px 0 rgba(255, 255, 255, 0.4),
            inset 0 -3px 0 rgba(0, 0, 0, 0.4)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <PaperTexture borderRadius="xl" />

        <div className="relative z-10 text-center space-y-5">
          {/* Medal - Large & Animated */}
          <div
            className="text-8xl animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            {data.emoji}
          </div>

          {/* Placement Label */}
          <div>
            <h2
              className="font-dutch809 text-4xl"
              style={{ color: data.color, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              {data.label}
            </h2>
            <p
              className="font-avenir text-lg mt-2"
              style={getParchmentTextStyle()}
            >
              {data.message}
            </p>
          </div>

          {/* Score Display */}
          <div
            className="inline-block rounded-xl px-6 py-3"
            style={{
              background: `${data.color}20`,
              border: `2px solid ${data.color}50`,
            }}
          >
            <div className="font-memento text-xs uppercase tracking-wider mb-1" style={{ ...getParchmentTextStyle(), opacity: 0.6 }}>
              Your Score
            </div>
            <div
              className="font-dutch809 text-3xl"
              style={getParchmentTextStyle()}
            >
              {score}%
            </div>
          </div>

          {/* CTA Button */}
          <ParchmentButton onClick={onClose} variant="golden" className="w-full">
            Amazing!
          </ParchmentButton>
        </div>
      </div>
    </div>
  );
}
