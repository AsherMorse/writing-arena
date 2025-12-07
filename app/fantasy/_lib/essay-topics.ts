export interface EssayTopic {
  id: string;
  label: string;
  prompt: string;
}

export const ESSAY_TOPICS: EssayTopic[] = [
  {
    id: 'technology-education',
    label: 'Technology in Schools',
    prompt: 'How has technology changed the way students learn? Consider both the benefits and challenges of using technology in education.',
  },
  {
    id: 'importance-reading',
    label: 'Reading Benefits',
    prompt: 'Why is reading important for young people? Explain the different ways that reading can benefit students.',
  },
  {
    id: 'healthy-habits',
    label: 'Healthy Habits',
    prompt: 'What habits help people stay healthy? Explain several habits that contribute to good health and why they matter.',
  },
  {
    id: 'environmental-protection',
    label: 'Protecting Nature',
    prompt: 'Why is it important to protect the environment? Explain several reasons why we should take care of our planet.',
  },
  {
    id: 'teamwork-benefits',
    label: 'Working Together',
    prompt: 'Why is teamwork important? Explain how working with others can help people achieve more than working alone.',
  },
  {
    id: 'social-media-impact',
    label: 'Social Media',
    prompt: 'How does social media affect young people? Consider both positive and negative effects in your essay.',
  },
  {
    id: 'learning-from-mistakes',
    label: 'Learning from Mistakes',
    prompt: 'Why are mistakes an important part of learning? Explain how making mistakes can help people grow and improve.',
  },
  {
    id: 'community-service',
    label: 'Helping Others',
    prompt: 'Why should people volunteer or help others in their community? Explain the benefits of community service.',
  },
  {
    id: 'future-career',
    label: 'Career Planning',
    prompt: 'What should students consider when thinking about their future career? Explain important factors in choosing a career path.',
  },
  {
    id: 'physical-activity',
    label: 'Exercise Benefits',
    prompt: 'Why is physical activity important for students? Explain the different ways that exercise benefits young people.',
  },
  {
    id: 'kindness-matters',
    label: 'Kindness',
    prompt: 'How can small acts of kindness make a big difference? Explain why being kind to others matters.',
  },
  {
    id: 'goal-setting',
    label: 'Setting Goals',
    prompt: 'Why is it important to set goals? Explain how having goals helps people achieve success.',
  },
  {
    id: 'cultural-diversity',
    label: 'Cultural Diversity',
    prompt: 'Why is it important to learn about different cultures? Explain the benefits of understanding diverse backgrounds.',
  },
  {
    id: 'creative-expression',
    label: 'Creative Expression',
    prompt: 'Why is creative expression important? Explain how art, music, or writing benefits people.',
  },
  {
    id: 'time-management',
    label: 'Managing Time',
    prompt: 'Why is time management important for students? Explain strategies for using time wisely.',
  },
  {
    id: 'pets-companions',
    label: 'Pets as Companions',
    prompt: 'Why do pets make good companions? Explain the different ways that having a pet can benefit people.',
  },
  {
    id: 'sleep-importance',
    label: 'Sleep Importance',
    prompt: 'Why is getting enough sleep important for students? Explain how sleep affects learning and health.',
  },
  {
    id: 'outdoor-activities',
    label: 'Outdoor Activities',
    prompt: 'Why should people spend time outdoors? Explain the benefits of outdoor activities and nature.',
  },
  {
    id: 'friendship-qualities',
    label: 'Friendship',
    prompt: 'What makes a good friend? Explain the qualities that are important in friendship.',
  },
  {
    id: 'problem-solving',
    label: 'Problem Solving',
    prompt: 'Why is problem-solving an important skill? Explain how being a good problem solver helps in life.',
  },
];

export function getRandomEssayTopic(): EssayTopic {
  const index = Math.floor(Math.random() * ESSAY_TOPICS.length);
  return ESSAY_TOPICS[index];
}

export function getRandomEssayTopics(count: number): EssayTopic[] {
  const shuffled = [...ESSAY_TOPICS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
