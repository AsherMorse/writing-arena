/**
 * @fileoverview Local font definitions for the fantasy theme.
 * Uses next/font/local for optimized font loading.
 */

import localFont from 'next/font/local';

/**
 * Dutch 809 Bold - Used for main headlines
 * "Learn to write, one quest at a time"
 */
export const dutch809 = localFont({
  src: '../public/fonts/Dutch 809 Bold.otf',
  variable: '--font-dutch809',
  display: 'swap',
  weight: '700',
});

/**
 * Avenir Next Medium - Used for body/subtext
 * "Embark on a captivating journey..."
 */
export const avenirNext = localFont({
  src: [
    {
      path: '../public/fonts/AvenirNextW1G-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/AvenirNextW1G-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-avenir',
  display: 'swap',
});

/**
 * Memento SemiBold - Used for buttons
 * "PLAY NOW" / "CONTINUE QUEST"
 */
export const memento = localFont({
  src: '../public/fonts/Memento SemiBold Regular.ttf',
  variable: '--font-memento',
  display: 'swap',
  weight: '600',
});

