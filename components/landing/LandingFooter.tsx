import Link from 'next/link';

/**
 * Footer component for landing page
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-8 py-8 text-sm text-[rgba(255,255,255,0.22)] md:flex-row md:items-center md:justify-between">
        <span>© 2025 Writing Arena. Match, iterate, and grow.</span>
        <div className="flex items-center gap-6">
          <Link href="/ranked" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
            Ranked
          </Link>
          <Link href="/quick-match" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
            Quick Match
          </Link>
          <Link href="/practice" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
            Practice
          </Link>
        </div>
      </div>
    </footer>
  );
}

