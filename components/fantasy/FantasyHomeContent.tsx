/**
 * @fileoverview Fantasy home content with tavern background, rank bar, and action cards.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { FantasyLogo } from './FantasyLogo';

interface FantasyHomeContentProps {
  userProfile: UserProfile;
}

/** 
 * @description Paper texture overlay using a tileable paper grain image.
 */
function PaperTexture({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: 'url(/textures/paper-1.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.6,
      }}
    />
  );
}

/** Action card configuration */
const ACTION_CARDS = [
  {
    id: 'practice',
    label: 'PRACTICE',
    icon: '/icons/target-icon.png',
    href: '/fantasy/practice',
  },
  {
    id: 'battle',
    label: 'BATTLE',
    icon: '/icons/swords-icon.png',
    href: '/ranked',
  },
  {
    id: 'study',
    label: 'STUDY',
    icon: '/icons/candle-icon.png',
    href: '/improve/activities',
  },
] as const;

/**
 * @description Renders the fantasy home page content with tavern aesthetic.
 */
export function FantasyHomeContent({ userProfile }: FantasyHomeContentProps) {
  const { currentRank, rankLP } = userProfile;
  
  // Calculate progress percentage (assuming 100 LP per rank tier)
  const progressPercent = Math.min(100, Math.max(0, rankLP));

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/backgrounds/home.png"
        alt=""
        fill
        className="object-cover"
        priority
      />

      {/* Subtle vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6">
        {/* Logo at top */}
        <FantasyLogo width={320} className="mt-2 md:mt-4" />

        {/* Main content - centered but shifted up */}
        <div className="flex-1 flex flex-col items-center justify-center w-full -mt-16">
          {/* Rank progress bar - matches button row width */}
          <RankBar rank={currentRank} progress={progressPercent} />

          {/* Action cards - smaller with more spacing to match panel width */}
          <div className="flex gap-8 mt-6">
            {ACTION_CARDS.map((card) => (
              <ActionCard
                key={card.id}
                label={card.label}
                icon={card.icon}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RankBarProps {
  rank: string;
  progress: number;
}

/**
 * @description Renders the rank display bar with progress indicator.
 */
function RankBar({ rank, progress }: RankBarProps) {
  // Width matches 3 buttons (150px each) + 2 gaps (32px each) = 514px
  return (
    <div 
      className="relative rounded-lg px-6 py-3 flex items-center gap-4 overflow-hidden"
      style={{
        width: '514px',
        background: 'linear-gradient(to bottom, #f5e6c8, #e8d4a8)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Paper texture overlay */}
      <PaperTexture className="rounded-lg" />
      
      <span 
        className="relative font-memento font-semibold text-lg whitespace-nowrap"
        style={{ color: '#2a1a0f' }}
      >
        Rank: {rank}
      </span>
      
      {/* Progress bar container */}
      <div 
        className="relative flex-1 h-5 rounded overflow-hidden"
        style={{
          background: '#e0d0b0',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Progress fill */}
        <div 
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to bottom, #d4a84b, #c49a3c)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>
    </div>
  );
}

interface ActionCardProps {
  label: string;
  icon: string;
  href: string;
}

/**
 * @description Renders a clickable action card with icon.
 */
function ActionCard({ label, icon, href }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden"
      style={{
        width: '150px',
        height: '170px',
        background: 'linear-gradient(to bottom, #f5e6c8, #e8d4a8)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Paper texture overlay */}
      <PaperTexture className="rounded-xl" />
      
      {/* Icon */}
      <div className="relative w-20 h-20 transition-transform duration-200">
        <Image
          src={icon}
          alt={label}
          fill
          sizes="80px"
          className="object-contain"
        />
      </div>
      
      {/* Label - memento font */}
      <span 
        className="relative font-memento font-black text-[22px] tracking-wide mt-3"
        style={{ color: '#2a1a0f' }}
      >
        {label}
      </span>
    </Link>
  );
}
