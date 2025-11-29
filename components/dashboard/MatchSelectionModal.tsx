'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { countCompletedRankedMatches } from '@/lib/services/firestore';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

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
          logger.error(LOG_CONTEXTS.DASHBOARD, 'Error fetching match count', error);
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
      route: '/ranked/matchmaking',
      disabled: false,
      color: '#00e5e5',
      bgColor: 'rgba(0,229,229,0.12)',
    },
    {
      label: 'Improve',
      icon: '📈',
      summary: hasEnoughMatches 
        ? 'Personalized writing exercises based on your last 5 ranked matches.'
        : `Complete ${matchesRemaining} more ranked match${matchesRemaining !== 1 ? 'es' : ''} to unlock.`,
      route: '/improve',
      disabled: !hasEnoughMatches,
      matchesRemaining: matchesRemaining,
      color: '#ff5f8f',
      bgColor: 'rgba(255,95,143,0.12)',
    },
    {
      label: 'AP Lang',
      icon: '📚',
      summary: 'Grade essays or practice with authentic AP prompts and a 40-minute timer.',
      route: '/ap-lang',
      disabled: false,
      color: '#ff9030',
      bgColor: 'rgba(255,144,48,0.12)',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-8 shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Start a session
            </div>
            <h2 className="text-2xl font-semibold text-[rgba(255,255,255,0.8)]">Choose your mode</h2>
            <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">Pick how you want to write today</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
              className={`group relative rounded-[14px] border p-6 text-left transition-all ${
                option.disabled
                  ? 'cursor-not-allowed border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.015)] opacity-60'
                  : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] hover:bg-[rgba(255,255,255,0.04)]'
              }`}
              style={!option.disabled ? { ['--hover-border' as string]: option.color } : {}}
              onMouseEnter={(e) => !option.disabled && (e.currentTarget.style.borderColor = option.color + '40')}
              onMouseLeave={(e) => !option.disabled && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
            >
              {option.disabled && option.label === 'Improve' && (
                <div 
                  className="absolute right-3 top-3 rounded-[20px] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em]"
                  style={{ background: option.bgColor, color: option.color }}
                >
                  {loading ? 'Loading' : `${matchesRemaining} more`}
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-[10px] text-xl"
                  style={{ background: option.bgColor }}
                >
                  {option.icon}
                </div>
              </div>

              <div 
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: option.disabled ? 'rgba(255,255,255,0.22)' : option.color }}
              >
                {option.label}
              </div>

              <p className={`text-sm ${option.disabled ? 'text-[rgba(255,255,255,0.3)]' : 'text-[rgba(255,255,255,0.6)]'}`}>
                {option.summary}
              </p>

              {option.label === 'Improve' && !hasEnoughMatches && completedMatches !== null && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[rgba(255,255,255,0.4)]">Progress</span>
                    <span className="font-mono" style={{ color: option.color }}>{completedMatches}/5</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                    <div 
                      className="h-full rounded-[3px] transition-all"
                      style={{ width: `${(completedMatches / 5) * 100}%`, background: option.color }}
                    />
                  </div>
                </div>
              )}

              {!option.disabled && (
                <div 
                  className="mt-4 flex items-center gap-2 text-sm font-medium transition-all"
                  style={{ color: option.color }}
                >
                  Enter
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
