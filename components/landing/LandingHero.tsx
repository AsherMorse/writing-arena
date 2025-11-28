import Link from 'next/link';

interface LandingHeroProps {
  heroCtaHref: string;
  heroCtaLabel: string;
}

export function LandingHero({ heroCtaHref, heroCtaLabel }: LandingHeroProps) {
  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20 text-center">
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        Write. Compete. Improve.
      </h1>
      <p className="mb-10 text-lg text-[rgba(255,255,255,0.6)]">
        Join the arena where students sharpen their writing through real-time matches, AI-powered feedback, and ranked competition.
      </p>
      <Link
        href={heroCtaHref}
        className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb]"
      >
        {heroCtaLabel}
      </Link>
    </section>
  );
}

