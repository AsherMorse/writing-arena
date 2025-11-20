'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { countCompletedRankedMatches } from '@/lib/services/firestore';

interface MatchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchSelectionModal({ isOpen, onClose }: MatchSelectionModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [completedMatches, setCompletedMatches] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      const fetchMatchCount = async () => {
        try {
          const count = await countCompletedRankedMatches(user.uid);
          setCompletedMatches(count);
        } catch (error) {
          console.error('Error fetching match count:', error);
          setCompletedMatches(0);
        } finally {
          setLoading(false);
        }
      };
      fetchMatchCount();
    } else if (!isOpen) {
      setLoading(true);
      setCompletedMatches(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const hasEnoughMatches = completedMatches !== null && completedMatches >= 5;
  const matchesRemaining = completedMatches !== null ? Math.max(0, 5 - completedMatches) : 0;

  const modes = [
    {
      label: 'Ranked',
      icon: '🏆',
      summary: 'Fight for leaderboard glory with three competitive phases.',
      route: '/ranked',
      disabled: false,
    },
    {
      label: 'Improve',
      icon: '📈',
      summary: hasEnoughMatches 
        ? 'Personalized writing exercises based on your last 5 ranked matches.'
        : `Complete ${matchesRemaining} more ranked match${matchesRemaining !== 1 ? 'es' : ''} to unlock personalized practice.`,
      route: '/improve',
      disabled: !hasEnoughMatches,
      matchesRemaining: matchesRemaining,
    },
    {
      label: 'AP Lang Grader',
      icon: '📚',
      summary: 'Grade your AP Language essays or practice with authentic AP prompts and a 40-minute timer.',
      route: '/ap-lang',
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-4xl rounded-3xl bg-[#141e27] p-10 shadow-xl border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl text-white transition hover:bg-white/10"
        >
          ×
        </button>
        <div className="mb-10 text-center space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
            Start a session
          </div>
          <h2 className="text-4xl font-semibold">Choose how you want to write today</h2>
          <p className="text-white/60 text-sm">
            Pick a mode to enter the arena. You can always change later.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {modes.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                if (!option.disabled) {
                  onClose();
                  router.push(option.route);
                }
              }}
              disabled={option.disabled}
              className={`group rounded-2xl p-7 border text-left transition relative ${
                option.disabled
                  ? 'bg-[#192430]/40 border-white/5 cursor-not-allowed opacity-60'
                  : 'bg-[#192430] border-white/10 hover:border-emerald-300/40'
              }`}
            >
              {option.disabled && option.label === 'Improve' && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                    {loading ? 'Loading...' : `${matchesRemaining} More`}
                  </span>
                </div>
              )}
              <div className="space-y-5">
                <div className={`flex items-center justify-between text-xs uppercase tracking-[0.3em] ${
                  option.disabled ? 'text-white/30' : 'text-emerald-200/70'
                }`}>
                  {option.label}
                  <span className={`text-base ${option.disabled ? 'text-white/30' : 'text-emerald-200'}`}>
                    {option.icon}
                  </span>
                </div>
                <p className={`text-base ${option.disabled ? 'text-white/40' : 'text-white/80'}`}>
                  {option.summary}
                </p>
                {option.label === 'Improve' && !hasEnoughMatches && completedMatches !== null && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                      <span>Progress</span>
                      <span>{completedMatches}/5 matches</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedMatches / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {!option.disabled && (
                  <div className="flex items-center justify-between pt-2 text-sm text-emerald-200">
                    Enter
                    <span className="transition group-hover:translate-x-1">→</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

