'use client';

interface ScoreDisplayProps {
  percentage: number;
  total: number;
  max: number;
}

export function ScoreDisplay({ percentage, total, max }: ScoreDisplayProps) {
  const color = percentage >= 80 ? '#4ade80' : percentage >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="text-center">
      <div
        className="font-dutch809 text-6xl mb-2"
        style={{
          color,
          textShadow: `0 0 20px ${color}40`,
        }}
      >
        {percentage}%
      </div>
      <div className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
        {total}/{max} points
      </div>
    </div>
  );
}
