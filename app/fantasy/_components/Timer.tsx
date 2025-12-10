/**
 * @fileoverview Countdown timer component with parchment styling and paper texture.
 */
'use client';

import { useEffect, useState } from 'react';
import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture, ParchmentVariant } from './parchment-styles';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
  /** Whether to show timer in parchment card style */
  parchmentStyle?: boolean;
  /** Color variant */
  variant?: ParchmentVariant;
}

/**
 * @description A countdown timer that displays MM:SS format.
 * Can be styled as a parchment card or plain text.
 */
export function Timer({ 
  seconds, 
  onComplete, 
  className = '', 
  parchmentStyle = false,
  variant = 'default',
}: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    if (isDev) return; // Timer frozen in dev mode

    const timer = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete, isDev]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 60;

  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (parchmentStyle) {
    const needsHeightFill = className.includes('h-full');
    return (
      <div
        className={`relative rounded-xl overflow-hidden p-5 ${needsHeightFill ? 'flex items-center justify-center' : ''} ${className}`}
        style={getParchmentContainerStyle({ variant })}
      >
        <PaperTexture />
        <div
          className="relative z-10 font-memento text-3xl tracking-wider text-center"
          style={{
            ...getParchmentTextStyle(variant),
            color: isLow ? '#8b0000' : getParchmentTextStyle(variant).color,
          }}
        >
          {timeDisplay}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`font-memento text-2xl tracking-wider ${className}`}
      style={{
        color: isLow ? '#ff6b6b' : '#f5e6b8',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      {timeDisplay}
    </div>
  );
}
