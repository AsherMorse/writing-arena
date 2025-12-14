/**
 * @fileoverview Main hero section for the fantasy landing page.
 * Features full-bleed background image with layered text content.
 */

'use client';

import Image from 'next/image';
import { FantasyLogo } from './FantasyLogo';
import { FantasyButton } from './FantasyButton';

interface FantasyHeroProps {
  heroCtaHref: string;
  heroCtaLabel: string;
}

/**
 * @description Renders the hero section with medieval valley background,
 * ornate logo, headline text, and call-to-action button.
 */
export function FantasyHero({ heroCtaHref, heroCtaLabel }: FantasyHeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/backgrounds/bg.webp"
        alt=""
        fill
        className="object-cover"
        priority
        quality={90}
      />

      {/* Subtle vignette overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center px-4">
          {/* Logo at top */}
          <FantasyLogo className="mt-4 md:mt-6" />

          {/* Main content - centered on screen */}
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-6">
            <h2 className="font-dutch809 text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] mb-5 md:mb-6 flex flex-col items-center">
              <span
                style={{
                  background: 'linear-gradient(to bottom, #f8e8b0 0%, #f6d493 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: `
                    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))
                    drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))
                  `,
                }}
              >
                Learn to write,
              </span>
              <span
                style={{
                  background: 'linear-gradient(to bottom, #f8e8b0 0%, #f6d493 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: `
                    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))
                    drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))
                  `,
                }}
              >
                one quest at a time
              </span>
            </h2>

            {/* Subheadline - Avenir Next Medium */}
            <p 
              className="font-avenir text-lg sm:text-xl md:text-2xl lg:text-[1.5rem] max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed"
              style={{
                color: '#f5e6b8',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
              }}
            >
              Embark on a captivating journey through sentence,
              <br />
              paragraph, and multi-paragraph writing.
            </p>

            {/* CTA Button */}
            <FantasyButton href={heroCtaHref} size="large">
              {heroCtaLabel}
            </FantasyButton>
          </div>
        </div>
    </section>
  );
}

