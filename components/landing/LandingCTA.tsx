import Link from 'next/link';
import { COLOR_CLASSES } from '@/lib/constants/colors';

interface LandingCTAProps {
  heroCtaHref: string;
  heroCtaLabel: string;
}

/**
 * Call-to-action section component for landing page
 */
export function LandingCTA({ heroCtaHref, heroCtaLabel }: LandingCTAProps) {
  return (
    <section className="mb-12">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.025)] text-2xl text-[rgba(255,255,255,0.22)]">
          ✶
        </div>
        <h2 className="text-xl font-semibold">Ready to start writing?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[rgba(255,255,255,0.4)]">
          Join the arena and transform your writing through competitive matches and AI-powered feedback.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={heroCtaHref}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] border ${COLOR_CLASSES.phase1.border} ${COLOR_CLASSES.phase1.bg} px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb]`}
          >
            {heroCtaLabel}
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            Try demo account
          </Link>
        </div>
      </div>
    </section>
  );
}

