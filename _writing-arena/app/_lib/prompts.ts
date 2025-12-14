export interface Prompt {
  id: string;
  text: string;
}

export const PARAGRAPH_PROMPTS: Prompt[] = [
  {
    id: 'community-center',
    text: 'Your town is building a new community center. Write a paragraph explaining what features it should include and why those features would benefit the community.',
  },
  {
    id: 'school-rule',
    text: 'Think of a school rule you would like to change. Write a paragraph explaining why the rule should be changed and what the new rule should be.',
  },
  {
    id: 'favorite-season',
    text: 'What is your favorite season of the year? Write a paragraph explaining why it is your favorite and what activities you enjoy during that time.',
  },
  {
    id: 'helpful-invention',
    text: 'If you could invent something to help people, what would it be? Write a paragraph describing your invention and explaining how it would help others.',
  },
  {
    id: 'field-trip',
    text: 'Your class is planning a field trip. Write a paragraph persuading your teacher to choose a destination you think would be educational and fun.',
  },
];

export function getRandomPrompt(excludeId?: string): Prompt {
  const available = excludeId 
    ? PARAGRAPH_PROMPTS.filter(p => p.id !== excludeId)
    : PARAGRAPH_PROMPTS;
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}
