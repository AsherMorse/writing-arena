export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-200';
  if (score >= 75) return 'text-blue-200';
  if (score >= 60) return 'text-yellow-200';
  return 'text-orange-200';
}

