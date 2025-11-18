'use client';

interface ResultsLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Reusable layout component for results pages
 * Provides consistent structure across practice, quick-match, and ranked results
 */
export function ResultsLayout({ children, actions }: ResultsLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        {actions && (
          <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            {actions}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}

