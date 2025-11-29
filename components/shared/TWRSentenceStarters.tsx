'use client';

import { getRankTier, RankTier } from '@/lib/constants/rank-timing';

interface TWRSentenceStartersProps {
  userRank?: string;
  promptType?: string;
  onClose?: () => void;
}

const SENTENCE_STARTERS: Record<RankTier, {
  because: string[];
  but: string[];
  so: string[];
  transitions: string[];
}> = {
  bronze: {
    because: [
      'I think... because...',
      'This happened... because...',
      'The character... because...',
    ],
    but: [
      'It was... but...',
      'She wanted... but...',
      'They tried... but...',
    ],
    so: [
      'The result was... so...',
      'This happened... so...',
      'Because of this... so...',
    ],
    transitions: ['First', 'Then', 'Next', 'Finally'],
  },
  silver: {
    because: [
      'The main idea is... because...',
      'This occurred... because...',
      'The character decided... because...',
    ],
    but: [
      'However, ... but...',
      'Although... but...',
      'Despite... but...',
    ],
    so: [
      'Therefore, ... so...',
      'As a result, ... so...',
      'Consequently, ... so...',
    ],
    transitions: ['First', 'Then', 'However', 'Therefore', 'Finally'],
  },
  gold: {
    because: [
      'The central theme emerges... because...',
      'This phenomenon occurs... because...',
      'The protagonist chooses... because...',
    ],
    but: [
      'Nevertheless, ... but...',
      'In contrast, ... but...',
      'On the other hand, ... but...',
    ],
    so: [
      'Thus, ... so...',
      'Hence, ... so...',
      'Accordingly, ... so...',
    ],
    transitions: ['Initially', 'Subsequently', 'However', 'Moreover', 'Consequently', 'Ultimately'],
  },
  platinum: {
    because: [
      'The thesis is supported... because...',
      'This evidence demonstrates... because...',
      'The analysis reveals... because...',
    ],
    but: [
      'Notwithstanding, ... but...',
      'Conversely, ... but...',
      'In opposition, ... but...',
    ],
    so: [
      'Ergo, ... so...',
      'Henceforth, ... so...',
      'Thereby, ... so...',
    ],
    transitions: ['Primarily', 'Furthermore', 'Nevertheless', 'Consequently', 'Ultimately'],
  },
  diamond: {
    because: [
      'The thesis is supported... because...',
      'This evidence demonstrates... because...',
      'The analysis reveals... because...',
    ],
    but: [
      'Notwithstanding, ... but...',
      'Conversely, ... but...',
      'In opposition, ... but...',
    ],
    so: [
      'Ergo, ... so...',
      'Henceforth, ... so...',
      'Thereby, ... so...',
    ],
    transitions: ['Primarily', 'Furthermore', 'Nevertheless', 'Consequently', 'Ultimately'],
  },
  master: {
    because: [
      'The thesis is supported... because...',
      'This evidence demonstrates... because...',
      'The analysis reveals... because...',
    ],
    but: [
      'Notwithstanding, ... but...',
      'Conversely, ... but...',
      'In opposition, ... but...',
    ],
    so: [
      'Ergo, ... so...',
      'Henceforth, ... so...',
      'Thereby, ... so...',
    ],
    transitions: ['Primarily', 'Furthermore', 'Nevertheless', 'Consequently', 'Ultimately'],
  },
};

const PROMPT_SPECIFIC_GUIDANCE: Record<string, {
  title: string;
  strategies: string[];
}> = {
  narrative: {
    title: 'Narrative Writing',
    strategies: [
      'Use because/but/so to show character motivation',
      'Add appositives for character description',
      'Use transition words for plot flow',
      'Include sensory details (five senses)',
    ],
  },
  descriptive: {
    title: 'Descriptive Writing',
    strategies: [
      'Use appositives to add vivid details',
      'Expand sentences with sensory language',
      'Use transition words to move through space/time',
      'Show, don&apos;t tell with specific details',
    ],
  },
  informational: {
    title: 'Informational Writing',
    strategies: [
      'Use because to show cause and effect',
      'Use transition words for organization',
      'Add appositives for definitions',
      'Combine related ideas with so/therefore',
    ],
  },
  argumentative: {
    title: 'Argumentative Writing',
    strategies: [
      'Use because to show reasoning',
      'Use however/but for counterarguments',
      'Use therefore/so for conclusions',
      'Add appositives for evidence explanation',
    ],
  },
};

export default function TWRSentenceStarters({ userRank, promptType, onClose }: TWRSentenceStartersProps) {
  const tier = userRank ? getRankTier(userRank) : 'silver';
  const starters = SENTENCE_STARTERS[tier];
  const promptGuidance = promptType ? PROMPT_SPECIFIC_GUIDANCE[promptType] : null;

  return (
    <div className="mb-4 rounded-[14px] border border-[#00e5e530] bg-[#00e5e508] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <h3 className="text-sm font-semibold" style={{ color: '#00e5e5' }}>
            TWR Sentence Starters
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {promptGuidance && (
          <div className="rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3">
            <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">
              {promptGuidance.title} Strategies:
            </div>
            <ul className="space-y-1 pl-4 text-[rgba(255,255,255,0.6)]">
              {promptGuidance.strategies.map((strategy, i) => (
                <li key={i} className="list-disc">{strategy}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3">
            <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">Because (Why)</div>
            <ul className="space-y-1 text-[rgba(255,255,255,0.6)]">
              {starters.because.map((starter, i) => (
                <li key={i} className="text-[10px]">• {starter}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3">
            <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">But (Contrast)</div>
            <ul className="space-y-1 text-[rgba(255,255,255,0.6)]">
              {starters.but.map((starter, i) => (
                <li key={i} className="text-[10px]">• {starter}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3">
            <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">So (Result)</div>
            <ul className="space-y-1 text-[rgba(255,255,255,0.6)]">
              {starters.so.map((starter, i) => (
                <li key={i} className="text-[10px]">• {starter}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3">
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">Transition Words:</div>
          <div className="flex flex-wrap gap-2 text-[rgba(255,255,255,0.6)]">
            {starters.transitions.map((transition, i) => (
              <span key={i} className="rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[10px]">
                {transition}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




