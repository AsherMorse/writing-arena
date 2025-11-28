import { useMemo } from 'react';
import { UserProfile } from '@/lib/types';

interface DashboardChecklistProps {
  userProfile: UserProfile;
}

export function DashboardChecklist({ userProfile }: DashboardChecklistProps) {
  const readinessChecklist = useMemo(
    () => [
      { label: 'Profile info current', ready: true },
      { label: 'Trait balance solid', ready: Object.values(userProfile.traits).every((level) => level >= 6) },
      { label: 'Focus trait chosen', ready: true },
      { label: 'Streak bonus active', ready: userProfile.stats.currentStreak > 0 },
    ],
    [userProfile.traits, userProfile.stats.currentStreak]
  );

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
        Pre-match Checklist
      </div>
      <div className="space-y-2">
        {readinessChecklist.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3"
          >
            <span className="text-sm text-[rgba(255,255,255,0.6)]">{item.label}</span>
            {item.ready ? (
              <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-0.5 text-[10px] font-medium uppercase text-[#00d492]">
                Ready
              </span>
            ) : (
              <span className="rounded-[20px] bg-[rgba(255,144,48,0.12)] px-2 py-0.5 text-[10px] font-medium uppercase text-[#ff9030]">
                Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

