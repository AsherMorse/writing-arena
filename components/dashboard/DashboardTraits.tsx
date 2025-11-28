import { useMemo } from 'react';
import { UserProfile } from '@/lib/types';

interface DashboardTraitsProps {
  userProfile: UserProfile;
}

export function DashboardTraits({ userProfile }: DashboardTraitsProps) {
  const traitCards = useMemo(
    () => [
      { name: 'Content', level: userProfile.traits.content, color: '#00e5e5' },
      { name: 'Organization', level: userProfile.traits.organization, color: '#ff5f8f' },
      { name: 'Grammar', level: userProfile.traits.grammar, color: '#ff9030' },
      { name: 'Vocabulary', level: userProfile.traits.vocabulary, color: '#00d492' },
      { name: 'Mechanics', level: userProfile.traits.mechanics, color: '#00e5e5' },
    ],
    [userProfile.traits]
  );

  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Trait Levels
        </div>
        <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#00d492]">
          {Object.values(userProfile.traits).filter(l => l >= 8).length}/5 ready
        </span>
      </div>
      <div className="space-y-3">
        {traitCards.map((trait) => (
          <div
            key={trait.name}
            className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: trait.color }}
              />
              <span className="text-sm text-[rgba(255,255,255,0.8)]">{trait.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-[6px] w-24 overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-[3px]"
                  style={{ width: `${(trait.level / 10) * 100}%`, background: trait.color }}
                />
              </div>
              <span className="w-8 text-right font-mono text-sm" style={{ color: trait.color }}>
                {trait.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

