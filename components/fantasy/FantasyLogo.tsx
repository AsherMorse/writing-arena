/**
 * @fileoverview Ornate logo component using the designed logo image.
 */

'use client';

import Image from 'next/image';

interface FantasyLogoProps {
  className?: string;
  width?: number;
}

/**
 * @description Renders the WritingArena logo image with optional sizing.
 */
export function FantasyLogo({ className = '', width = 400 }: FantasyLogoProps) {
  // Maintain aspect ratio based on the logo dimensions
  const aspectRatio = 968 / 122; // width / height from the original image
  const height = Math.round(width / aspectRatio);

  return (
    <div className={`relative inline-block ${className}`}>
      <Image
        src="/images/logos/logo-v3.webp"
        alt="Writing Arena"
        width={width}
        height={height}
        priority
        className="drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))',
        }}
      />
    </div>
  );
}

