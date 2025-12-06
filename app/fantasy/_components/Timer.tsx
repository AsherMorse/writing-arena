'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
  className?: string;
}

export function Timer({ seconds, onComplete, className = '' }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 60;

  return (
    <div
      className={`font-memento text-2xl tracking-wider ${className}`}
      style={{
        color: isLow ? '#ff6b6b' : '#f5e6b8',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      {minutes}:{secs.toString().padStart(2, '0')}
    </div>
  );
}
