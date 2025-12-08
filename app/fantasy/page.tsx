/**
 * @fileoverview Fantasy-themed landing page with medieval aesthetic.
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FantasyHero } from '@/components/fantasy/FantasyHero';

/**
 * @description Main fantasy landing page component.
 */
export default function FantasyLandingPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const heroCtaHref = isLoggedIn ? '/fantasy/home' : '/fantasy/auth';
  const heroCtaLabel = isLoggedIn ? 'Continue Quest' : 'Play Now';

  return (
    <div className="relative min-h-screen">
      <FantasyHero 
        heroCtaHref={heroCtaHref}
        heroCtaLabel={heroCtaLabel}
      />
    </div>
  );
}

