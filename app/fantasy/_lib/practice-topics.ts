export interface PracticeTopic {
  id: string;
  label: string;
  prompt: string;
}

export const PRACTICE_TOPICS: PracticeTopic[] = [
  { id: 'summer', label: 'Summer', prompt: 'What makes summer a special time of year? You might consider the weather, activities, and feelings it brings.' },
  { id: 'best-friend', label: 'Friendship', prompt: 'What makes a good friend? You might think about qualities like loyalty, kindness, and shared interests.' },
  { id: 'video-games', label: 'Video Games', prompt: 'Why do people enjoy playing video games? You might consider the challenge, creativity, and social aspects.' },
  { id: 'school-lunch', label: 'School Lunch', prompt: 'What would make school lunches better? You might think about healthier options, variety, and student preferences.' },
  { id: 'superheroes', label: 'Superheroes', prompt: 'What makes superheroes so popular in movies and comics? You might consider their powers, personalities, and the stories they appear in.' },
  { id: 'space', label: 'Space', prompt: 'What is fascinating about outer space? You might consider the planets, stars, and possibilities of exploration.' },
  { id: 'pets', label: 'Pets', prompt: 'Why do people keep pets? You might think about companionship, responsibility, and the joy animals bring.' },
  { id: 'sports', label: 'Sports', prompt: 'What makes playing sports enjoyable? You might consider teamwork, exercise, and competition.' },
  { id: 'music', label: 'Music', prompt: 'How does music affect people? You might think about emotions, memories, and how different genres appeal to different listeners.' },
  { id: 'brave', label: 'Bravery', prompt: 'What does it mean to be brave? You might consider different types of courage and when people need to be brave.' },
  { id: 'favorite-place', label: 'Special Places', prompt: 'What makes a place feel special to someone? You might think about memories, atmosphere, and personal connections.' },
  { id: 'flying', label: 'Flying', prompt: 'What would be amazing about being able to fly? You might consider the freedom, views, and possibilities.' },
  { id: 'rainy-days', label: 'Rainy Days', prompt: 'What is good about rainy days? You might consider indoor activities, the sounds, and how rain helps nature.' },
  { id: 'dinosaurs', label: 'Dinosaurs', prompt: 'What makes dinosaurs so interesting to learn about? You might consider their size, variety, and mysterious extinction.' },
  { id: 'ocean', label: 'The Ocean', prompt: 'What is fascinating about the ocean? You might think about marine life, exploration, and its importance to Earth.' },
  { id: 'robots', label: 'Robots', prompt: 'How are robots changing the world? You might consider their uses in homes, factories, and medicine.' },
  { id: 'pizza', label: 'Pizza', prompt: 'Why is pizza such a popular food? You might consider its variety, taste, and how people enjoy sharing it.' },
  { id: 'dreams', label: 'Dreams', prompt: 'What is interesting about dreams? You might think about why we dream, strange dreams, and what they might mean.' },
  { id: 'holidays', label: 'Holidays', prompt: 'What makes holidays special? You might consider traditions, family time, and celebrations.' },
  { id: 'animals', label: 'Wild Animals', prompt: 'What is amazing about wild animals? You might think about their habitats, behaviors, and survival skills.' },
  { id: 'books', label: 'Books', prompt: 'Why is reading books valuable? You might consider imagination, learning, and the different types of stories.' },
  { id: 'inventions', label: 'Inventions', prompt: 'What inventions have changed how people live? You might think about technology, transportation, and communication.' },
  { id: 'weather', label: 'Weather', prompt: 'How does weather affect daily life? You might consider different seasons, activities, and preparations.' },
  { id: 'cooking', label: 'Cooking', prompt: 'What is enjoyable about cooking? You might think about creativity, sharing meals, and learning new recipes.' },
  { id: 'movies', label: 'Movies', prompt: 'What makes a movie enjoyable to watch? You might consider storytelling, characters, and special effects.' },
  { id: 'nature', label: 'Nature', prompt: 'Why is spending time in nature good for people? You might think about fresh air, exercise, and peace.' },
  { id: 'birthdays', label: 'Birthdays', prompt: 'What makes birthdays fun to celebrate? You might consider gifts, parties, and traditions.' },
  { id: 'homework', label: 'Homework', prompt: 'What is the purpose of homework? You might think about practice, learning habits, and time management.' },
  { id: 'travel', label: 'Travel', prompt: 'What is exciting about traveling to new places? You might consider new experiences, cultures, and memories.' },
  { id: 'art', label: 'Art', prompt: 'Why is art important? You might think about expression, creativity, and how it makes people feel.' },
  { id: 'winter', label: 'Winter', prompt: 'What makes winter unique? You might consider snow, holidays, and winter activities.' },
  { id: 'teamwork', label: 'Teamwork', prompt: 'Why is teamwork important? You might think about shared goals, different strengths, and better results.' },
  { id: 'technology', label: 'Technology', prompt: 'How has technology changed schools? You might consider computers, online learning, and new tools.' },
  { id: 'forests', label: 'Forests', prompt: 'Why are forests important? You might think about wildlife, oxygen, and natural beauty.' },
  { id: 'exercise', label: 'Exercise', prompt: 'Why is exercise good for you? You might consider health, energy, and feeling good.' },
  { id: 'kindness', label: 'Kindness', prompt: 'How can small acts of kindness make a difference? You might think about helping others and building community.' },
  { id: 'chocolate', label: 'Chocolate', prompt: 'Why do so many people love chocolate? You might consider its taste, history, and different forms.' },
  { id: 'mountains', label: 'Mountains', prompt: 'What is impressive about mountains? You might think about their size, hiking, and the views.' },
  { id: 'learning', label: 'Learning', prompt: 'What makes learning new things rewarding? You might consider curiosity, growth, and new abilities.' },
  { id: 'cats', label: 'Cats', prompt: 'What makes cats interesting pets? You might think about their personalities, independence, and behavior.' },
  { id: 'dogs', label: 'Dogs', prompt: 'Why are dogs called "man\'s best friend"? You might consider loyalty, playfulness, and companionship.' },
  { id: 'sleep', label: 'Sleep', prompt: 'Why is getting enough sleep important? You might think about energy, health, and concentration.' },
  { id: 'colors', label: 'Colors', prompt: 'How do colors affect how we feel? You might consider favorite colors, moods, and how they are used.' },
  { id: 'games', label: 'Board Games', prompt: 'What makes board games fun to play? You might think about strategy, competition, and spending time with others.' },
  { id: 'magic', label: 'Magic', prompt: 'What is fascinating about magic tricks? You might consider mystery, skill, and the wonder they create.' },
];

export function getRandomTopic(): PracticeTopic {
  const index = Math.floor(Math.random() * PRACTICE_TOPICS.length);
  return PRACTICE_TOPICS[index];
}

export function getRandomTopics(count: number): PracticeTopic[] {
  const shuffled = [...PRACTICE_TOPICS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
