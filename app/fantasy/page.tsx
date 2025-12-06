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

  const heroCtaHref = isLoggedIn ? '/dashboard' : '/auth';
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

      {/* Dev controls panel */}
      <div 
        className="fixed bottom-4 right-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-sm space-y-3"
        style={{ fontFamily: 'monospace' }}
      >
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Dev Controls</div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showOverlay}
            onChange={(e) => setShowOverlay(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span>Show UI Elements</span>
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs ml-auto">T</kbd>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showReference}
            onChange={(e) => setShowReference(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span>Show Reference</span>
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs ml-auto">R</kbd>
        </label>

        <div className="border-t border-gray-700 pt-2 mt-2 text-xs text-gray-500">
          Toggle overlays to compare
        </div>
      </div>

      {/* Main hero section */}
      <FantasyHero 
        showOverlay={showOverlay}
        heroCtaHref={heroCtaHref}
        heroCtaLabel={heroCtaLabel}
      />
    </div>
  );
}

