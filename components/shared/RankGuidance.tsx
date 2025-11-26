'use client';

import { getRankTier, RankTier } from '@/lib/constants/rank-timing';

interface RankGuidanceProps {
  rank: string;
  phase: 1 | 2 | 3;
}

interface RankGuidanceConfig {
  focus: string;
  aimFor: string;
  task: string;
  strategies: string[];
}

const RANK_GUIDANCE: Record<RankTier, Record<1 | 2 | 3, RankGuidanceConfig>> = {
  bronze: {
    1: {
      focus: 'Clear sentences with because/but/so',
      aimFor: '50-100 words',
      task: 'Sentence-level writing',
      strategies: [
        'Use because/but/so to expand sentences',
        'Write complete, clear sentences',
        'Focus on one main idea',
      ],
    },
    2: {
      focus: 'Identify main idea clearly',
      aimFor: 'Specific feedback with quotes',
      task: 'Basic peer feedback',
      strategies: [
        'Quote exact sentences',
        'Name what works well',
        'Give one clear suggestion',
      ],
    },
    3: {
      focus: 'Apply one key improvement',
      aimFor: 'Add because/but/so or details',
      task: 'Targeted revision',
      strategies: [
        'Read feedback carefully',
        'Choose one main change',
        'Expand sentences with because/but/so',
      ],
    },
  },
  silver: {
    1: {
      focus: 'Well-organized paragraph',
      aimFor: '100-200 words',
      task: 'Paragraph writing',
      strategies: [
        'Start with a topic sentence',
        'Add supporting details',
        'Use transition words',
      ],
    },
    2: {
      focus: 'Specific feedback with TWR strategies',
      aimFor: 'Quote + strategy name + suggestion',
      task: 'Structured peer feedback',
      strategies: [
        'Quote specific text',
        'Name TWR strategies (appositives, transitions)',
        'Give actionable suggestions',
      ],
    },
    3: {
      focus: 'Apply multiple improvements',
      aimFor: 'Add appositives, expand sentences',
      task: 'Multi-strategy revision',
      strategies: [
        'Apply 2-3 feedback suggestions',
        'Add appositives where suggested',
        'Combine choppy sentences',
      ],
    },
  },
  gold: {
    1: {
      focus: 'Short essay with thesis',
      aimFor: '150-300 words',
      task: 'Micro-essay',
      strategies: [
        'State your main idea clearly',
        'Support with 2-3 details',
        'Use varied sentence structures',
      ],
    },
    2: {
      focus: 'High-quality feedback with examples',
      aimFor: 'Specific quotes + TWR analysis',
      task: 'Advanced peer feedback',
      strategies: [
        'Quote exact phrases',
        'Analyze TWR strategies used',
        'Provide concrete revision examples',
      ],
    },
    3: {
      focus: 'Comprehensive revision',
      aimFor: 'Apply all key feedback',
      task: 'Full revision process',
      strategies: [
        'Apply all feedback suggestions',
        'Add appositives and expand sentences',
        'Improve organization and transitions',
      ],
    },
  },
  platinum: {
    1: {
      focus: 'AP-level response',
      aimFor: '200-400 words',
      task: 'Compressed FRQ',
      strategies: [
        'Clear thesis statement',
        'Strong evidence and analysis',
        'Sophisticated sentence variety',
      ],
    },
    2: {
      focus: 'Expert-level feedback',
      aimFor: 'Detailed TWR analysis',
      task: 'Master-level peer feedback',
      strategies: [
        'Deep TWR strategy analysis',
        'Specific revision recommendations',
        'Focus on sophistication',
      ],
    },
    3: {
      focus: 'Polished revision',
      aimFor: 'Refined, sophisticated writing',
      task: 'Master-level revision',
      strategies: [
        'Apply all feedback strategically',
        'Enhance sophistication',
        'Refine sentence variety and structure',
      ],
    },
  },
  diamond: {
    1: {
      focus: 'AP-level response',
      aimFor: '200-400 words',
      task: 'Compressed FRQ',
      strategies: [
        'Clear thesis statement',
        'Strong evidence and analysis',
        'Sophisticated sentence variety',
      ],
    },
    2: {
      focus: 'Expert-level feedback',
      aimFor: 'Detailed TWR analysis',
      task: 'Master-level peer feedback',
      strategies: [
        'Deep TWR strategy analysis',
        'Specific revision recommendations',
        'Focus on sophistication',
      ],
    },
    3: {
      focus: 'Polished revision',
      aimFor: 'Refined, sophisticated writing',
      task: 'Master-level revision',
      strategies: [
        'Apply all feedback strategically',
        'Enhance sophistication',
        'Refine sentence variety and structure',
      ],
    },
  },
  master: {
    1: {
      focus: 'AP-level response',
      aimFor: '200-400 words',
      task: 'Compressed FRQ',
      strategies: [
        'Clear thesis statement',
        'Strong evidence and analysis',
        'Sophisticated sentence variety',
      ],
    },
    2: {
      focus: 'Expert-level feedback',
      aimFor: 'Detailed TWR analysis',
      task: 'Master-level peer feedback',
      strategies: [
        'Deep TWR strategy analysis',
        'Specific revision recommendations',
        'Focus on sophistication',
      ],
    },
    3: {
      focus: 'Polished revision',
      aimFor: 'Refined, sophisticated writing',
      task: 'Master-level revision',
      strategies: [
        'Apply all feedback strategically',
        'Enhance sophistication',
        'Refine sentence variety and structure',
      ],
    },
  },
};

export default function RankGuidance({ rank, phase }: RankGuidanceProps) {
  const tier = getRankTier(rank);
  const guidance = RANK_GUIDANCE[tier]?.[phase];

  if (!guidance) return null;

  const phaseColors = {
    1: '#00e5e5',
    2: '#ff5f8f',
    3: '#00d492',
  };

  const color = phaseColors[phase];

  return (
    <div 
      className="mb-4 rounded-[14px] border p-4"
      style={{ borderColor: `${color}30`, background: `${color}08` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🎯</span>
        <h3 className="text-sm font-semibold" style={{ color }}>
          Rank Expectations: {rank}
        </h3>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium text-[rgba(255,255,255,0.6)]">Focus:</span>{' '}
          <span className="text-[rgba(255,255,255,0.5)]">{guidance.focus}</span>
        </div>
        <div>
          <span className="font-medium text-[rgba(255,255,255,0.6)]">Aim for:</span>{' '}
          <span className="text-[rgba(255,255,255,0.5)]">{guidance.aimFor}</span>
        </div>
        <div>
          <span className="font-medium text-[rgba(255,255,255,0.6)]">Task:</span>{' '}
          <span className="text-[rgba(255,255,255,0.5)]">{guidance.task}</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
          <div className="mb-1 font-medium text-[rgba(255,255,255,0.6)]">Key Strategies:</div>
          <ul className="space-y-1 pl-4">
            {guidance.strategies.map((strategy, i) => (
              <li key={i} className="text-[rgba(255,255,255,0.5)] list-disc">
                {strategy}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


