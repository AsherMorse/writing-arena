import { COLOR_CLASSES } from '@/lib/constants/colors';

/**
 * Introduction section component for landing page
 * Displays the main headline and description
 */
export function LandingIntro() {
  return (
    <section className="mb-12">
      <div className={`inline-flex items-center rounded-[20px] ${COLOR_CLASSES.phase1.bgOpacity(0.12)} px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] ${COLOR_CLASSES.phase1.text}`}>
        Competitive writing platform
      </div>
      <h1 className="mt-4 text-[28px] font-semibold leading-tight">
        Build writing instincts under pressure
      </h1>
      <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
        Sprint through four-minute drafts, provide peer feedback, and evolve your writer tree from Seedling to Redwood.
      </p>
    </section>
  );
}

