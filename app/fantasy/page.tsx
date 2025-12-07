/**
 * @fileoverview Fantasy-themed landing page with medieval aesthetic.
 * Features a toggle to show/hide UI elements for comparing against reference image.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FantasyHero } from '@/components/fantasy/FantasyHero';

/**
 * @description Main fantasy landing page component.
 * Includes a dev toggle (keyboard shortcut: T) to hide overlay elements
 * for easy comparison with reference image.
 */
export default function FantasyLandingPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showOverlay, setShowOverlay] = useState(true);
  const [showReference, setShowReference] = useState(false);

  const heroCtaHref = isLoggedIn ? '/fantasy/home' : '/auth';
  const heroCtaLabel = isLoggedIn ? 'Continue Quest' : 'Play Now';

  // Keyboard shortcuts for dev comparison
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Press 'T' to toggle overlay
      if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setShowOverlay(prev => !prev);
        }
      }
      // Press 'R' to toggle reference image
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setShowReference(prev => !prev);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Reference image overlay for comparison */}
      {showReference && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Image
            src="/images/backgrounds/Medieval Valley of Discovery.png"
            alt="Reference"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm font-mono">
            Reference Image (50% opacity)
          </div>
        </div>
      )}

      {/* Main hero section */}
      <FantasyHero 
        showOverlay={showOverlay}
        heroCtaHref={heroCtaHref}
        heroCtaLabel={heroCtaLabel}
      />
    </div>
  );
}

