/**
 * @fileoverview Fantasy home content with tavern background, player panel, and action cards.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, SkillLevel, SkillTier } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { FantasyLogo } from './FantasyLogo';
import { DailyChampions } from './DailyChampions';
import { getGradingSummary } from '@/lib/services/grading-history';
import { getRankDisplayName } from '@/lib/utils/score-calculator';
import { TIER_LP_CAP } from '@/lib/utils/rank-constants';

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
    tooltip: 'Pick a prompt you love and sharpen your writing',
  },
  {
    id: 'battle',
    label: 'BATTLE',
    icon: '/icons/swords-icon.png',
    href: '/fantasy/ranked',
    tooltip: 'Face today\'s challenge and earn your place on the Scroll of Champions',
  },
  {
    id: 'study',
    label: 'STUDY',
    icon: '/icons/candle-icon.png',
    href: '/fantasy/study',
    tooltip: 'Close the gaps in your writing armor',
  },
] as const;

/**
 * @description Renders the fantasy home page content with tavern aesthetic.
 */
export function FantasyHomeContent({ userProfile }: FantasyHomeContentProps) {
  const { totalLP = 0, stats, uid } = userProfile;
  const { signOut } = useAuth();
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [dailyLP, setDailyLP] = useState<number>(0);
  
  // New skill-based rank system (defaults to Scribe III, 65 LP)
  const skillLevel = userProfile.skillLevel ?? 'scribe';
  const skillTier = userProfile.skillTier ?? 3;
  const tierLP = userProfile.tierLP ?? 65;
  const rankDisplay = getRankDisplayName(skillLevel, skillTier);
  
  // Calculate progress percentage (0-100 LP per tier)
  const progressPercent = Math.min(100, Math.max(0, tierLP));

  // Fetch average score from grading history
  useEffect(() => {
    getGradingSummary(uid).then((summary) => {
      setAverageScore(summary.averageScore);
    });
  }, [uid]);

  // Fetch daily LP earned
  useEffect(() => {
    async function fetchDailyLP() {
      try {
        const { collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startTimestamp = Timestamp.fromDate(startOfToday);
        
        const submissionsRef = collection(db, 'rankedSubmissions');
        const q = query(
          submissionsRef,
          where('userId', '==', uid),
          where('submittedAt', '>=', startTimestamp)
        );
        
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.lpEarned || 0);
        }, 0);
        
        setDailyLP(total);
      } catch (error) {
        console.error('Failed to fetch daily LP:', error);
      }
    }
    
    fetchDailyLP();
  }, [uid]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/backgrounds/home.webp"
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
        {/* Logout button - absolute positioned to not affect layout */}
        <button
          onClick={() => signOut()}
          className="absolute top-6 right-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#f5e6b8] opacity-50 hover:opacity-100 transition-opacity z-20"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          Log out
        </button>

        {/* Logo at top */}
        <FantasyLogo width={320} className="mt-2 md:mt-4" />

        {/* Main content - centered but shifted up */}
        <div className="flex-1 flex flex-col items-center justify-center w-full -mt-16">
          {/* Welcome message */}
          <p 
            className="font-memento text-2xl mb-4"
            style={{ 
              color: '#f5e6b8',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            Welcome back, {userProfile.displayName}
          </p>

          {/* Player panel with rank and stats */}
          <PlayerPanel 
            rankDisplay={rankDisplay}
            tierLP={tierLP}
            progress={progressPercent}
            totalLP={totalLP}
            dailyLP={dailyLP}
            currentStreak={stats.currentStreak}
            averageScore={averageScore}
          />

          {/* Action cards - smaller with more spacing to match panel width */}
          <div className="flex gap-8 mt-6">
            {ACTION_CARDS.map((card) => (
              <ActionCard
                key={card.id}
                label={card.label}
                icon={card.icon}
                href={card.href}
                tooltip={card.tooltip}
              />
            ))}
          </div>

          {/* Daily Champions - top 3 students for today */}
          <DailyChampions />
        </div>
      </div>
    </div>
  );
}

interface PlayerPanelProps {
  rankDisplay: string;
  tierLP: number;
  progress: number;
  totalLP: number;
  dailyLP: number;
  currentStreak: number;
  averageScore: number | null;
}

/**
 * @description Renders the player panel with rank progress and stats.
 */
function PlayerPanel({ rankDisplay, tierLP, progress, totalLP, dailyLP, currentStreak, averageScore }: PlayerPanelProps) {
  // Width matches 3 buttons (150px each) + 2 gaps (32px each) = 514px
  return (
    <div 
      className="relative rounded-lg"
      style={{
        width: '514px',
        background: 'linear-gradient(to bottom, #f5e6c8, #e8d4a8)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        border: '3px solid #3a2010',
      }}
    >
      {/* Paper texture overlay */}
      <PaperTexture className="rounded-lg" />
      
      {/* Rank row */}
      <div className="relative px-6 py-3 flex items-center gap-4">
        <span 
          className="relative font-memento font-semibold text-lg whitespace-nowrap"
          style={{ color: '#2a1a0f' }}
        >
          {rankDisplay}
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
          {/* LP label inside bar */}
          <span 
            className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
            style={{ color: '#2a1a0f', textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)' }}
          >
            {tierLP}/{TIER_LP_CAP} LP
          </span>
        </div>
      </div>

      {/* Divider */}
      <div 
        className="relative mx-4"
        style={{ 
          height: '1px', 
          background: 'linear-gradient(to right, transparent, rgba(58, 32, 16, 0.25), transparent)' 
        }}
      />

      {/* Stats row */}
      <div className="relative px-6 py-3 flex items-center justify-around">
        <StatItem label="Total LP" value={totalLP.toLocaleString()} />
        <StatItem label="Daily LP" value={dailyLP.toString()} />
        <StatItem label="Streak" value={`${currentStreak} day${currentStreak !== 1 ? 's' : ''}`} />
        <StatItem 
          label="Avg Score" 
          value={averageScore !== null ? `${averageScore}%` : '—'} 
          tooltip="Average of your original scores from battles and practice"
        />
      </div>
    </div>
  );
}

/**
 * @description Renders a single stat item with label and value.
 * Optionally displays a tooltip on hover.
 */
function StatItem({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => tooltip && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span 
        className="text-xs uppercase tracking-wide"
        style={{ color: 'rgba(42, 26, 15, 0.5)' }}
      >
        {label}
      </span>
      <span 
        className="font-memento font-semibold text-base"
        style={{ color: '#2a1a0f' }}
      >
        {value}
      </span>

      {/* Tooltip */}
      {tooltip && isHovered && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs text-center z-50 pointer-events-none"
          style={{
            background: '#000',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            width: '180px',
            whiteSpace: 'normal',
            outline: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Arrow pointing up */}
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #000',
            }}
          />
          {tooltip}
        </div>
      )}
    </div>
  );
}

interface ActionCardProps {
  label: string;
  icon: string;
  href: string;
  tooltip: string;
}

/**
 * @description Renders a clickable action card with icon and hover tooltip.
 * Enhanced with 3D mobile game button styling.
 */
function ActionCard({ label, icon, href, tooltip }: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={href}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className="group relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 overflow-hidden"
        style={{
          width: '150px',
          height: '170px',
          // Muted gradient - less bright at top
          background: isPressed 
            ? 'linear-gradient(to bottom, #d4c5a8 0%, #e0d0b5 30%, #ebe0c8 100%)'
            : 'linear-gradient(to bottom, #ebe0c8 0%, #ebe0c8 15%, #e0d0b5 85%, #e0d0b5 100%)',
          // Deep shadows with darker 3D base (#423820)
          boxShadow: isPressed
            ? '0 2px 4px rgba(0, 0, 0, 0.5), inset 0 3px 8px rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.2)'
            : '0 6px 0 #423820, 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.15)',
          // Dark outer border for definition
          border: '1px solidrgb(42, 38, 27)',
          transform: isPressed ? 'translateY(6px)' : isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Paper texture overlay */}
        <PaperTexture className="rounded-xl" />
        
        {/* Top highlight rim for extra bevel effect */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent)',
            borderRadius: '8px 8px 0 0',
          }}
        />
        
        {/* Bottom shadow rim */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent)',
            borderRadius: '0 0 8px 8px',
          }}
        />
        
        {/* Icon with inner shadow effect */}
        <div 
          className="relative w-20 h-20 transition-transform duration-150"
          style={{
            transform: isPressed ? 'scale(0.92)' : 'scale(1)',
          }}
        >
          {/* Base icon - slightly lighter, acts as highlight edge */}
          {/* <Image
            src={icon}
            alt=""
            fill
            sizes="80px"
            className="object-contain"
            style={{
              filter: 'brightness(1.3)',
              transform: 'translate(-1px, -1px)',
            }}
          /> */}
          {/* Main icon on top */}
          <Image
            src={icon}
            alt={label}
            fill
            sizes="80px"
            className="object-contain"
          />
        </div>
        
        {/* Label - memento font with text shadow for depth */}
        <span 
          className="relative font-memento font-black text-[22px] tracking-wide mt-3 transition-transform duration-150"
          style={{ 
            color: '#2a1a0f',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.5)',
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          {label}
        </span>
      </Link>

      {/* Tooltip - outside Link to avoid overflow:hidden clipping */}
      {isHovered && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-5 px-4 py-2 rounded-lg text-sm text-center z-50 pointer-events-none"
          style={{
            background: '#000',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            width: '240px',
            whiteSpace: 'normal',
            outline: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Arrow pointing up - outline layer */}
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid rgba(255, 255, 255, 0.3)',
              marginBottom: '1px',
            }}
          />
          {/* Arrow pointing up - fill layer */}
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #000',
            }}
          />
          <span className="font-medium">{tooltip}</span>
        </div>
      )}
    </div>
  );
}
