export interface PracticeTopic {
  id: string;
  label: string;
  prompt: string;
}

export const PRACTICE_TOPICS: PracticeTopic[] = [
  { id: 'summer', label: 'Summer Vacation', prompt: 'Write a paragraph about your favorite summer vacation memory or what makes summer special to you.' },
  { id: 'best-friend', label: 'My Best Friend', prompt: 'Write a paragraph about your best friend and what makes your friendship special.' },
  { id: 'video-games', label: 'Video Games', prompt: 'Write a paragraph about your favorite video game and why you enjoy playing it.' },
  { id: 'school-lunch', label: 'School Lunch', prompt: 'Write a paragraph about what changes you would make to your school lunch menu and why.' },
  { id: 'superheroes', label: 'Superheroes', prompt: 'Write a paragraph about what superpower you would want and how you would use it.' },
  { id: 'space', label: 'Space Travel', prompt: 'Write a paragraph about where you would go if you could travel anywhere in space.' },
  { id: 'pets', label: 'My Pet', prompt: 'Write a paragraph about a pet you have or would like to have and why.' },
  { id: 'sports', label: 'Sports', prompt: 'Write a paragraph about your favorite sport and what you enjoy about it.' },
  { id: 'music', label: 'Music', prompt: 'Write a paragraph about your favorite type of music or musician and why you like them.' },
  { id: 'brave', label: 'A Time I Was Brave', prompt: 'Write a paragraph about a time when you had to be brave and what happened.' },
  { id: 'favorite-place', label: 'My Favorite Place', prompt: 'Write a paragraph about your favorite place to visit and what makes it special.' },
  { id: 'flying', label: 'If I Could Fly', prompt: 'Write a paragraph about what you would do if you could fly for one day.' },
  { id: 'rainy-days', label: 'Rainy Days', prompt: 'Write a paragraph about what you like to do on rainy days.' },
];

export function getRandomTopic(): PracticeTopic {
  const index = Math.floor(Math.random() * PRACTICE_TOPICS.length);
  return PRACTICE_TOPICS[index];
}
