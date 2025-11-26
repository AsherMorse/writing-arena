'use client';

import { useState, useEffect } from 'react';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { formatTime } from '@/lib/utils/time-utils';
import { TIMING } from '@/lib/constants/scoring';
import { WRITING_TIPS } from '@/lib/constants/writing-tips';

interface WaitingForPlayersProps {
  phase: 1 | 2 | 3;
  playersReady: number;
  totalPlayers: number;
  timeRemaining: number;
  partyMembers?: Array<{
    name: string;
    userId?: string;
    avatar?: string;
    isAI?: boolean;
    isYou?: boolean;
    rank?: string;
  }>;
  submittedPlayerIds?: string[];
  matchId?: string;
}

export default function WaitingForPlayers({
  phase,
  playersReady,
  totalPlayers,
  timeRemaining,
  partyMembers = [],
  submittedPlayerIds = [],
  matchId,
}: WaitingForPlayersProps) {
  const [displayMembers, setDisplayMembers] = useState(partyMembers);
  const submittedSet = new Set(submittedPlayerIds);

  useEffect(() => {
    if (partyMembers.length > 0) {
      setDisplayMembers(partyMembers);
      return;
    }

    if (!matchId) return;

    try {
      const stored = sessionStorage.getItem(`${matchId}-players`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = Array.isArray(parsed)
          ? parsed.map((member: any) => ({
              name: member.name,
              userId: member.userId,
              avatar: member.avatar,
              rank: member.rank,
              isAI: member.isAI,
              isYou: member.name === 'You',
            }))
          : [];
        if (normalized.length > 0) {
          setDisplayMembers(normalized);
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ WAITING - Failed to load party members from storage', error);
    }

    setDisplayMembers(
      [...Array(totalPlayers)].map((_, index) => ({
        name: `Slot ${index + 1}`,
        avatar: '⌛',
        userId: `slot-${index}`,
      }))
    );
  }, [partyMembers, matchId, totalPlayers]);

  const membersToDisplay =
    displayMembers.length > 0
      ? displayMembers
      : [...Array(totalPlayers)].map((_, index) => ({
          name: `Slot ${index + 1}`,
          avatar: '⌛',
          userId: `slot-${index}`,
        }));
  
  const phaseNames = { 1: 'Writing', 2: 'Peer Feedback', 3: 'Revision' };
  const phaseColors = { 1: '#00e5e5', 2: '#ff5f8f', 3: '#00d492' };

  const { currentIndex: currentConceptIndex, goTo: goToConcept } = useCarousel({
    items: WRITING_TIPS,
    interval: TIMING.CAROUSEL_INTERVAL,
    autoPlay: true,
  });
  
  const phaseColor = phaseColors[phase];
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101012] px-6 py-10 text-[rgba(255,255,255,0.8)]">
      <div className="w-full max-w-[1000px] space-y-6">
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Phase {phase} · {phaseNames[phase]}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">
            {playersReady === totalPlayers 
              ? 'All players finished! Evaluating...'
              : 'Waiting for AI opponents'}
          </h1>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            {playersReady === totalPlayers
              ? 'Ranking submissions and preparing results...'
              : `You're done! AI players submit within 5-15s.`}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                  Submissions
                </div>
                <div className="mt-1 font-mono text-2xl font-medium" style={{ color: phaseColor }}>
                  {playersReady} <span className="text-[rgba(255,255,255,0.22)]">/</span> {totalPlayers}
                </div>
              </div>
              <div className="rounded-[20px] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs">
                Ends in <span className="font-mono" style={{ color: phaseColor }}>{formatTime(timeRemaining)}</span>
              </div>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(playersReady / totalPlayers) * 100}%`, background: phaseColor }}
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {membersToDisplay.map((member, index) => {
                const isSubmitted = member.userId ? submittedSet.has(member.userId) : index < playersReady;
                return (
                  <div
                    key={`${member.userId || member.name || 'slot'}-${index}`}
                    className={`rounded-[10px] border p-3 text-center transition ${
                      isSubmitted
                        ? 'border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)]'
                        : 'border-[rgba(255,255,255,0.05)] bg-[#101012]'
                    }`}
                  >
                    <div className="mb-1 text-xl">
                      {isSubmitted ? '✅' : member.avatar || '⌛'}
                    </div>
                    <div className="truncate text-xs">{member.name || `Slot ${index + 1}`}</div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.22)]">{'rank' in member ? member.rank : 'Silver III'}</div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-xs text-[rgba(255,255,255,0.4)]">
              When all submit, we&apos;ll proceed to rankings.
            </div>

            {partyMembers.length > 0 && (
              <div className="space-y-2">
                {partyMembers.map((member, index) => {
                  const isDone = member.userId ? submittedSet.has(member.userId) : index < playersReady;
                  return (
                    <div
                      key={`${member.userId || member.name || 'member'}-${index}`}
                      className="flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{member.avatar || '👤'}</div>
                        <div className="text-sm">{member.name || `Player ${index + 1}`}</div>
                      </div>
                      <div className={`text-[10px] font-medium ${isDone ? 'text-[#00d492]' : 'text-[rgba(255,255,255,0.22)]'}`}>
                        {isDone ? 'Submitted' : 'Waiting'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 100%, ${phaseColor}10, transparent 50%)` }} />
            <div className="relative z-10 space-y-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Writing tip
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{WRITING_TIPS[currentConceptIndex].icon}</div>
                <h3 className="text-lg font-semibold">{WRITING_TIPS[currentConceptIndex].name}</h3>
              </div>
              <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                {WRITING_TIPS[currentConceptIndex].tip}
              </p>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
                <div className="mb-1 text-[10px] uppercase" style={{ color: phaseColor }}>Example</div>
                <p className="text-sm italic text-[rgba(255,255,255,0.6)]">
                  {WRITING_TIPS[currentConceptIndex].example}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 pt-2">
                {WRITING_TIPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToConcept(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentConceptIndex
                        ? 'w-6'
                        : 'w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
                    }`}
                    style={index === currentConceptIndex ? { background: phaseColor } : {}}
                    aria-label={`Go to tip ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-[10px] text-[rgba(255,255,255,0.22)]">
                Tip {currentConceptIndex + 1} of {WRITING_TIPS.length}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[rgba(255,255,255,0.22)]">
          ✨ Take a breath, or get inspired for the next phase.
        </div>
      </div>
    </div>
  );
}
