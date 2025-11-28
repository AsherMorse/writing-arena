const features = [
  {
    title: 'Claude-powered critiques',
    detail: 'Phase-by-phase commentary that highlights strengths, gaps, and suggested drills.',
    color: 'cyan',
  },
  {
    title: 'Live trait analytics',
    detail: 'Momentum graphs track how your content, organization, grammar, vocabulary, and mechanics evolve.',
    color: 'pink',
  },
  {
    title: 'Seasonal ladders',
    detail: 'Ranked splits reset each term with new rewards and calibrated LP adjustments.',
    color: 'orange',
  },
  {
    title: 'Party backfill AI',
    detail: 'Queue at any hour—synthetic teammates keep matches flowing while humans join.',
    color: 'green',
  },
];

const colorMap: Record<string, string> = {
  cyan: '#00e5e5',
  pink: '#ff5f8f',
  orange: '#ff9030',
  green: '#00d492',
};

export function LandingFeatures() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold">Why Writing Arena</h2>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">
          Built for students who want to write better, faster
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6"
          >
            <div
              className="h-2 w-2 flex-shrink-0 rounded-full mt-2"
              style={{ background: colorMap[feature.color] }}
            />
            <div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-[rgba(255,255,255,0.4)]">{feature.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

