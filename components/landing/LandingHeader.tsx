import Link from 'next/link';

interface LandingHeaderProps {
  headerCtaHref: string;
  headerCtaLabel: string;
}

export function LandingHeader({ headerCtaHref, headerCtaLabel }: LandingHeaderProps) {
  return (
    <header className="border-b border-[rgba(255,255,255,0.05)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
        <Link href="/" className="text-base font-semibold tracking-wide">
          Writing Arena
        </Link>
        <Link
          href={headerCtaHref}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
        >
          {headerCtaLabel}
        </Link>
      </div>
    </header>
  );
}

