/**
 * Time formatting and color utilities for phase timers
 */

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTimeColor(seconds: number, thresholds?: { green: number; yellow: number }): string {
  const { green = 30, yellow = 15 } = thresholds || {};
  if (seconds > green) return 'text-green-400';
  if (seconds > yellow) return 'text-yellow-400';
  return 'text-red-400';
}

export function getTimeProgressColor(seconds: number, thresholds?: { green: number; yellow: number }): string {
  const { green = 30, yellow = 15 } = thresholds || {};
  if (seconds > green) return 'bg-green-400';
  if (seconds > yellow) return 'bg-yellow-400';
  return 'bg-red-400';
}

