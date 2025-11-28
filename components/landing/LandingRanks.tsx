const ranks = [
  { name: 'Seedling', emoji: '🌱', progress: 100 },
  { name: 'Sapling', emoji: '🌿', progress: 100 },
  { name: 'Young Oak', emoji: '🌳', progress: 65 },
  { name: 'Mature Oak', emoji: '🌲', progress: 0 },
  { name: 'Ancient Oak', emoji: '🌴', progress: 0 },
  { name: 'Redwood', emoji: '🏔️', progress: 0 },
];

export function LandingRanks() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold">Rank Progression</h2>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">
          Climb from Seedling to Redwood through consistent improvement
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {ranks.map((rank) => (
          <div
            key={rank.name}
            className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4 text-center"
          >
            <div className="mb-2 text-3xl">{rank.emoji}</div>
            <div className="mb-2 text-xs font-semibold">{rank.name}</div>
            <div className="h-1 w-full rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
              <div
                className="h-full bg-[#00e5e5] transition-all"
                style={{ width: `${rank.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

