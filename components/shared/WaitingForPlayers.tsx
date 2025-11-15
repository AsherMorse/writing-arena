'use client';

import { useState, useEffect } from 'react';

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
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayMembers, setDisplayMembers] = useState(partyMembers);
  const submittedSet = new Set(submittedPlayerIds);
  
  // Writing Revolution tips for educational moments
  const writingTips = [
    {
      title: 'Sentence Expansion',
      tip: 'Expand simple sentences with because, but, or so to show deeper thinking.',
      example: '"She opened the door" → "She opened the door because the golden light intrigued her"',
      icon: '🔗',
    },
    {
      title: 'Appositives',
      tip: 'Add description using commas without new sentences.',
      example: '"The lighthouse" → "The lighthouse, a weathered stone tower, stood tall"',
      icon: '✏️',
    },
    {
      title: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements.',
      example: 'Instead of "She was scared" → "Her hands trembled as she reached for the handle"',
      icon: '🎭',
    },
    {
      title: 'Transition Words',
      tip: 'Connect ideas with signal words to improve flow.',
      example: 'First, Then, However, Therefore, For example, In contrast',
      icon: '➡️',
    },
    {
      title: 'Sentence Combining',
      tip: 'Join short choppy sentences for better flow.',
      example: '"The door was rusty. It creaked." → "The rusty door creaked open"',
      icon: '🔀',
    },
    {
      title: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel.',
      example: '"It smelled bad" → "The musty odor of mildew filled the air"',
      icon: '👁️',
    },
    {
      title: 'Subordinating Conjunctions',
      tip: 'Add complexity with although, since, while, when.',
      example: '"I was tired. I kept going." → "Although I was tired, I kept going"',
      icon: '🔄',
    },
    {
      title: 'Specific Details',
      tip: 'Replace vague words with precise descriptions.',
      example: 'Instead of "pretty flower" → "crimson rose with velvet petals"',
      icon: '🎨',
    },
  ];

  // Rotate writing tips every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % writingTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [writingTips.length]);

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
  
  const phaseNames = {
    1: 'Writing',
    2: 'Peer Feedback',
    3: 'Revision',
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Writing Revolution concepts carousel
  const writingConcepts = [
    {
      name: 'Sentence Expansion',
      tip: 'Use because, but, or so to show why things happen.',
      example: 'She opened the door because she heard a strange noise.',
      icon: '🔗',
    },
    {
      name: 'Appositives',
      tip: 'Add description using commas to provide extra information.',
      example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
      icon: '✏️',
    },
    {
      name: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel.',
      example: 'The salty air stung my eyes while waves crashed loudly below.',
      icon: '👁️',
    },
    {
      name: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements.',
      example: 'Her hands trembled as she reached for the handle.',
      icon: '🎭',
    },
    {
      name: 'Transition Words',
      tip: 'Use signal words to connect ideas smoothly.',
      example: 'First, Then, However, Therefore, For example',
      icon: '➡️',
    },
    {
      name: 'Topic Sentences',
      tip: 'Start paragraphs with a clear main idea.',
      example: 'Photosynthesis is how plants make food.',
      icon: '📝',
    },
  ];

  // Rotate concepts every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % writingConcepts.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [writingConcepts.length]);
  
  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#0f1822] p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">
            Phase {phase} • {phaseNames[phase]}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {playersReady === totalPlayers 
              ? 'All players finished! Evaluating submissions...'
              : 'Waiting for AI opponents to submit'}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {playersReady === totalPlayers
              ? 'Ranking all submissions and preparing results...'
              : `You're done! AI players will submit within 5-15 seconds.`}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Submissions received
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {playersReady} <span className="text-white/40 text-xl">/</span>{' '}
                  <span className="text-white/60 text-2xl">{totalPlayers}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                Phase ends in <span className="font-semibold text-white">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-400 to-blue-500 transition-all duration-500"
                style={{ width: `${(playersReady / totalPlayers) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {membersToDisplay.map((member, index) => {
                const isSubmitted = member.userId ? submittedSet.has(member.userId) : index < playersReady;
                return (
                  <div
                    key={`${member.userId || member.name || 'slot'}-${index}`}
                    className={`rounded-2xl border px-3 py-4 text-center text-xs font-semibold transition ${
                      isSubmitted
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 bg-white/5 text-white/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {isSubmitted ? '✅' : member.avatar || '⌛'}
                    </div>
                    <div className="truncate text-sm text-white/80">
                      {member.name || `Slot ${index + 1}`}
                    </div>
                    <div className="text-[11px] text-white/40">{'rank' in member ? member.rank : 'Silver III'}</div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 space-y-2">
              <div>When a player submits, we’ll move straight into rankings.</div>
              {partyMembers.length > 0 && (
                <div className="space-y-2 text-xs text-white/70">
                  {partyMembers.map((member, index) => {
                    const isDone = member.userId ? submittedSet.has(member.userId) : index < playersReady;
                    return (
                      <div
                    key={`${member.userId || member.name || 'member'}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/0 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c141d] text-base">
                            {member.avatar || '👤'}
                          </div>
                          <div className="text-white/80">{member.name || `Player ${index + 1}`}</div>
                        </div>
                        <div className={`text-xs font-semibold ${isDone ? 'text-emerald-300' : 'text-white/40'}`}>
                          {isDone ? 'Submitted' : 'Waiting'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                Writing revolution tip
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{writingConcepts[currentTipIndex].icon}</div>
                <h3 className="text-xl font-semibold">{writingConcepts[currentTipIndex].name}</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {writingConcepts[currentTipIndex].tip}
              </p>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70">
                <div className="text-emerald-300 text-xs uppercase tracking-[0.2em] mb-1">
                  Example
                </div>
                <p className="text-white/90 italic text-sm">
                  {writingConcepts[currentTipIndex].example}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {writingConcepts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentTipIndex
                        ? 'w-8 bg-emerald-400'
                        : 'w-3 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to tip ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-xs text-white/50">
                Tip {currentTipIndex + 1} of {writingConcepts.length} • The Writing Revolution
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-white/40">
          ✨ Take a breath, review your draft, or get inspired for the next phase.
        </div>
      </div>
    </div>
  );
}

