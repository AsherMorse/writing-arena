interface SquadMember {
  userId: string;
  name: string;
  avatar: string;
  rank: string;
  wordCount?: number;
  isYou: boolean;
}

interface SquadSidebarProps {
  members: SquadMember[];
}

export function SquadSidebar({ members }: SquadSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Squad</div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.userId} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xl">{member.avatar}</div>
                  <div>
                    <div className="text-xs font-medium">{member.name}</div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.4)]">{member.rank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm" style={{ color: member.isYou ? '#00e5e5' : 'rgba(255,255,255,0.6)' }}>
                    {Math.floor(member.wordCount || 0)}
                  </div>
                  <div className="text-[10px] text-[rgba(255,255,255,0.22)]">words</div>
                </div>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(((member.wordCount || 0) / 100) * 100, 100)}%`, background: member.isYou ? '#00e5e5' : 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

