// Writing Arena - Prompt Library
// Prompts for competitive writing matches

import { getRandomPromptByRank } from './rank-prompt-filtering';

export interface WritingPrompt {
  id: string;
  type: 'narrative' | 'descriptive' | 'informational' | 'argumentative';
  image: string;
  title: string;
  description: string;
  gradeLevel?: string;
}

export const PROMPT_LIBRARY: WritingPrompt[] = [
  // ARGUMENTATIVE PROMPTS - Focus: Claim-counterclaim, evidence citation
  {
    id: 'argumentative-1',
    type: 'argumentative',
    image: '📱',
    title: 'Smartphones in Classrooms',
    description: 'Should schools ban smartphones in classrooms? State your position and support it with evidence.',
  },
  {
    id: 'argumentative-2',
    type: 'argumentative',
    image: '💬',
    title: 'Social Media Impact',
    description: 'Is social media more harmful than helpful for teenagers? Defend your claim with reasons.',
  },
  {
    id: 'argumentative-3',
    type: 'argumentative',
    image: '🤖',
    title: 'AI and Student Learning',
    description: 'Does AI like ChatGPT improve or hinder student learning? Argue for your position.',
  },
  {
    id: 'argumentative-4',
    type: 'argumentative',
    image: '🏠',
    title: 'Remote Learning Debate',
    description: 'Argue for or against remote learning based on your experience. Use specific evidence.',
  },
  {
    id: 'argumentative-5',
    type: 'argumentative',
    image: '🌾',
    title: 'Genetically Modified Foods',
    description: 'Discuss the pros and cons of genetically modified foods. Present a balanced argument.',
  },

  // EXPOSITORY PROMPTS - Focus: Organization, transitions
  {
    id: 'informational-1',
    type: 'informational',
    image: '🌊',
    title: 'Climate and Oceans',
    description: 'Explain how climate change affects ocean ecosystems. Use clear transitions.',
  },
  {
    id: 'informational-2',
    type: 'informational',
    image: '🇺🇸',
    title: 'American Revolution',
    description: 'Describe the causes and effects of the American Revolution with clear organization.',
  },
  {
    id: 'informational-3',
    type: 'informational',
    image: '💪',
    title: 'Exercise and Mental Health',
    description: 'How does exercise impact mental health? Explain the connection with supporting details.',
  },
  {
    id: 'informational-4',
    type: 'informational',
    image: '♻️',
    title: 'Energy Sources',
    description: 'Compare and contrast renewable and non-renewable energy sources with clear organization.',
  },
  {
    id: 'informational-5',
    type: 'informational',
    image: '🌱',
    title: 'Photosynthesis Process',
    description: 'Explain the process of photosynthesis in plants using sequential steps and transitions.',
  },

  // INFORMATIONAL PROMPTS - Focus: Sentence sophistication, vocabulary
  {
    id: 'informational-6',
    type: 'informational',
    image: '👩‍✈️',
    title: 'Women in World War II',
    description: 'What role did women play in World War II? Use varied sentence structures and vivid vocabulary.',
  },
  {
    id: 'informational-7',
    type: 'informational',
    image: '⚡',
    title: 'Technology and Daily Life',
    description: 'How has technology changed daily life in the last decade? Show cause and effect clearly.',
  },
  {
    id: 'informational-8',
    type: 'informational',
    image: '🌍',
    title: 'Biodiversity Importance',
    description: 'Explain why biodiversity is essential for human survival using sophisticated vocabulary.',
  },

  // NARRATIVE PROMPTS - Focus: Show-don't-tell, audience awareness
  {
    id: 'narrative-1',
    type: 'narrative',
    image: '🌙',
    title: 'Historical Event Experience',
    description: 'Describe a historical event as if you were there (e.g., the moon landing). Show, don\'t tell.',
  },
  {
    id: 'narrative-2',
    type: 'narrative',
    image: '🔬',
    title: 'Scientific Discovery',
    description: 'Recount a scientific discovery and its impact (e.g., penicillin) with vivid details.',
  },
  {
    id: 'narrative-3',
    type: 'narrative',
    image: '⏰',
    title: 'Time Traveler for a Day',
    description: 'You can travel to any time period for 24 hours. Tell the story of what happens.',
  },
  {
    id: 'narrative-4',
    type: 'narrative',
    image: '🚪',
    title: 'The Mysterious Door',
    description: 'You find a door that wasn\'t there yesterday. Where does it lead? Use sensory details.',
  },
  {
    id: 'narrative-5',
    type: 'narrative',
    image: '🌄',
    title: 'An Unexpected Adventure',
    description: 'Write a story about a character who discovers something surprising on an ordinary day.',
  },
];

// Get a random prompt of a specific type
export function getRandomPrompt(type?: 'narrative' | 'descriptive' | 'informational' | 'argumentative'): WritingPrompt {
  let availablePrompts: WritingPrompt[];
  
  if (type) {
    availablePrompts = PROMPT_LIBRARY.filter(p => p.type === type);
  } else {
    availablePrompts = PROMPT_LIBRARY;
  }
  
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
}

// Get a random prompt filtered by rank (uses rank-based complexity filtering)
export function getRandomPromptForRank(rank?: string): WritingPrompt {
  if (!rank) {
    return getRandomPrompt();
  }
  
  return getRandomPromptByRank(rank, PROMPT_LIBRARY);
}

// Get random prompt ensuring it's different from last used
export function getRandomPromptExcluding(excludeIds: string[]): WritingPrompt {
  const availablePrompts = PROMPT_LIBRARY.filter(p => !excludeIds.includes(p.id));
  
  if (availablePrompts.length === 0) {
    // If all excluded, just use any
    return getRandomPrompt();
  }
  
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
}

// Get prompt by ID
export function getPromptById(id: string): WritingPrompt | undefined {
  return PROMPT_LIBRARY.find(p => p.id === id);
}
