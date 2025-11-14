// Writing Arena - Prompt Library
// Prompts for competitive writing matches

export interface WritingPrompt {
  id: string;
  type: 'narrative' | 'descriptive' | 'informational' | 'argumentative';
  image: string;
  title: string;
  description: string;
  gradeLevel?: string;
}

export const PROMPT_LIBRARY: WritingPrompt[] = [
  // NARRATIVE PROMPTS
  {
    id: 'narrative-1',
    type: 'narrative',
    image: '🌄',
    title: 'An Unexpected Adventure',
    description: 'Write a story about a character who discovers something surprising on an ordinary day.',
  },
  {
    id: 'narrative-2',
    type: 'narrative',
    image: '🚪',
    title: 'The Mysterious Door',
    description: 'You find a door that wasn\'t there yesterday. Where does it lead?',
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
    image: '🎒',
    title: 'The Found Object',
    description: 'A character finds an object that changes everything. Write their story.',
  },
  {
    id: 'narrative-5',
    type: 'narrative',
    image: '🌙',
    title: 'When Everything Changed',
    description: 'Write about a moment when a character\'s life took an unexpected turn.',
  },

  // DESCRIPTIVE PROMPTS
  {
    id: 'descriptive-1',
    type: 'descriptive',
    image: '🏰',
    title: 'A Mysterious Place',
    description: 'Describe a place that feels magical or mysterious.',
  },
  {
    id: 'descriptive-2',
    type: 'descriptive',
    image: '🌊',
    title: 'Sensory Experience',
    description: 'Describe a place using all five senses - what you see, hear, smell, taste, and feel.',
  },
  {
    id: 'descriptive-3',
    type: 'descriptive',
    image: '🎨',
    title: 'Before and After',
    description: 'Describe the same location during two different times or seasons. Show how it transforms.',
  },
  {
    id: 'descriptive-4',
    type: 'descriptive',
    image: '🏔️',
    title: 'A Place of Peace',
    description: 'Describe a location where you feel completely at peace. Make readers feel they are there.',
  },
  {
    id: 'descriptive-5',
    type: 'descriptive',
    image: '🌃',
    title: 'City at Night',
    description: 'Describe a city or town after dark. What makes it different from daytime?',
  },

  // INFORMATIONAL PROMPTS
  {
    id: 'informational-1',
    type: 'informational',
    image: '🔬',
    title: 'How Things Work',
    description: 'Explain how something works or why something happens.',
  },
  {
    id: 'informational-2',
    type: 'informational',
    image: '🌱',
    title: 'Growth and Change',
    description: 'Explain how something grows, develops, or changes over time.',
  },
  {
    id: 'informational-3',
    type: 'informational',
    image: '⚙️',
    title: 'Step by Step',
    description: 'Teach someone how to do something you know well. Make each step clear.',
  },
  {
    id: 'informational-4',
    type: 'informational',
    image: '🎯',
    title: 'Why It Matters',
    description: 'Explain why something you care about is important. Help readers understand.',
  },
  {
    id: 'informational-5',
    type: 'informational',
    image: '🔍',
    title: 'Compare and Contrast',
    description: 'Explain how two similar things are different, or how two different things are similar.',
  },

  // ARGUMENTATIVE PROMPTS
  {
    id: 'argumentative-1',
    type: 'argumentative',
    image: '💭',
    title: 'Take a Stand',
    description: 'Should students have more choices in what they learn? State your opinion with reasons.',
  },
  {
    id: 'argumentative-2',
    type: 'argumentative',
    image: '📱',
    title: 'Technology in Schools',
    description: 'Should schools allow students to use cell phones during class? Defend your position.',
  },
  {
    id: 'argumentative-3',
    type: 'argumentative',
    image: '🏠',
    title: 'Homework Debate',
    description: 'Is homework helpful or harmful? Take a position and support it with reasons.',
  },
  {
    id: 'argumentative-4',
    type: 'argumentative',
    image: '🌍',
    title: 'Make a Change',
    description: 'What is one thing you would change in your school or community? Convince others it\'s important.',
  },
  {
    id: 'argumentative-5',
    type: 'argumentative',
    image: '⏱️',
    title: 'Time Management',
    description: 'Should the school day be longer or shorter? Present your argument with evidence.',
  },
];

// Get a random prompt of a specific type
export function getRandomPrompt(type?: 'narrative' | 'descriptive' | 'informational' | 'argumentative'): WritingPrompt {
  let availablePrompts = PROMPT_LIBRARY;
  
  if (type) {
    availablePrompts = PROMPT_LIBRARY.filter(p => p.type === type);
  }
  
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
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

