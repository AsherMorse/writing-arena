import { PlanningData } from '@/components/shared/TWRPlanningPhase';

interface PlanningDataBannerProps {
  planningData: PlanningData | null;
}

export function PlanningDataBanner({ planningData }: PlanningDataBannerProps) {
  if (!planningData) return null;

  return (
    <div className="mb-4 rounded-[10px] border border-[#00e5e530] bg-[#00e5e508] p-3 text-xs text-[rgba(255,255,255,0.6)]">
      <strong className="text-[#00e5e5]">📋 Your Plan:</strong>{' '}
      {planningData.mainIdea && <span>{planningData.mainIdea}</span>}
      {planningData.becauseButSo && <span className="ml-2">• {planningData.becauseButSo.substring(0, 50)}...</span>}
    </div>
  );
}

