interface ResultsRankChangeProps {
  lpChange: number;
}

export function ResultsRankChange({ lpChange }: ResultsRankChangeProps) {
  const isPositive = lpChange > 0;
  
  return (
    <div className={`mb-8 rounded-[14px] p-6 text-center ${isPositive ? 'bg-[rgba(0,212,146,0.15)] border border-[rgba(0,212,146,0.3)]' : 'bg-[rgba(255,95,143,0.15)] border border-[rgba(255,95,143,0.3)]'}`}>
      <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Rank Change</div>
      <div className="font-mono text-4xl font-medium" style={{ color: isPositive ? '#00d492' : '#ff5f8f' }}>
        {isPositive ? '+' : ''}{lpChange} LP
      </div>
      <div className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
        {isPositive ? '🎉 Climbing the ranks!' : '💪 Keep fighting!'}
      </div>
    </div>
  );
}

