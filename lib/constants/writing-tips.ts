/**
 * Writing tips and concepts for student guidance
 * Used across multiple components for consistent tips display
 */

export interface WritingTip {
  name: string;
  tip: string;
  example: string;
  icon: string;
}

/**
 * Core writing tips/concepts used in writing sessions
 */
export const WRITING_TIPS: WritingTip[] = [
  { 
    name: 'Sentence Expansion', 
    tip: 'Use because, but, or so to show why things happen.', 
    example: 'She opened the door because she heard a strange noise.', 
    icon: '🔗' 
  },
  { 
    name: 'Appositives', 
    tip: 'Add description using commas to provide extra information.', 
    example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.', 
    icon: '✏️' 
  },
  { 
    name: 'Five Senses', 
    tip: 'Include what you see, hear, smell, taste, and feel.', 
    example: 'The salty air stung my eyes while waves crashed loudly below.', 
    icon: '👁️' 
  },
  { 
    name: 'Show, Don\'t Tell', 
    tip: 'Use specific details instead of general statements.', 
    example: 'Her hands trembled as she reached for the handle.', 
    icon: '🎭' 
  },
  { 
    name: 'Transition Words', 
    tip: 'Use signal words to connect ideas smoothly.', 
    example: 'First, Then, However, Therefore, For example', 
    icon: '➡️' 
  },
  { 
    name: 'Topic Sentences', 
    tip: 'Start paragraphs with a clear main idea.', 
    example: 'Photosynthesis is how plants make food.', 
    icon: '📝' 
  },
] as const;

/**
 * Extended writing tips including conclusion tips
 * Used in writing session content
 */
export const WRITING_TIPS_WITH_CONCLUSIONS: WritingTip[] = [
  ...WRITING_TIPS,
  { 
    name: 'Strong Conclusions', 
    tip: 'End with a final thought that ties everything together.', 
    example: 'For these reasons, it is clear that...', 
    icon: '🎯' 
  },
] as const;

