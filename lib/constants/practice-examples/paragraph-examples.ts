/**
 * @fileoverview Review examples for paragraph-level lessons (Tier 2).
 * Extracted from AlphaWrite test data.
 */

import { ReviewExample } from './types';

/**
 * @description Review examples for Make Topic Sentences activity.
 * Students review topic sentences and identify effective ones.
 */
export const MAKE_TOPIC_SENTENCES_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write a topic sentence about dolphins for a paragraph about their intelligence.',
    answer: 'Dolphins, intelligent marine mammals, communicate through clicks and whistles.',
    isCorrect: true,
    explanation: 'Uses an appositive to add detail and clearly introduces the paragraph topic.',
    topic: 'animals',
  },
  {
    question: 'Write a topic sentence about rainforests using a subordinating conjunction.',
    answer: "Because rainforests produce oxygen and absorb carbon dioxide, they help regulate Earth's climate.",
    isCorrect: true,
    explanation: 'Uses "because" to show cause-effect and introduces the main idea about rainforests.',
    topic: 'nature',
  },
  {
    question: 'Write a topic sentence about solar energy.',
    answer: 'Solar energy provides a clean and renewable alternative to fossil fuels.',
    isCorrect: true,
    explanation: 'Clear declarative statement that introduces the main idea about solar energy.',
    topic: 'technology',
  },
  {
    question: 'Write an imperative topic sentence to encourage recycling.',
    answer: "Start recycling today to help protect our planet's natural resources.",
    isCorrect: true,
    explanation: 'Uses imperative form to encourage action while introducing the topic.',
    topic: 'environment',
  },
  // Incorrect examples
  {
    question: 'Write a topic sentence about volcanoes using a subordinating conjunction.',
    answer: 'Because earthquakes happen near fault lines, scientists can predict where they might occur.',
    isCorrect: false,
    explanation: 'Off-topic: discusses earthquakes instead of volcanoes.',
    topic: 'science',
  },
  {
    question: 'Write a topic sentence about butterflies.',
    answer: 'Butterflies are pretty insects.',
    isCorrect: false,
    explanation: 'Too short and vague - lacks specific detail to introduce a paragraph.',
    topic: 'animals',
  },
  {
    question: 'Write a topic sentence about pizza.',
    answer: 'Pepperoni is the most popular pizza topping in America!',
    isCorrect: false,
    explanation: 'Too specific - this is a detail, not a topic sentence that introduces the main idea.',
    topic: 'food',
  },
];

/**
 * @description Review examples for Identify Topic Sentence activity.
 * Students identify which sentence is the topic sentence in a paragraph.
 */
export const IDENTIFY_TOPIC_SENTENCE_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Which is the topic sentence? A) "The water cycle shows how water moves around Earth." B) "Evaporation turns liquid water into vapor."',
    answer: 'A) "The water cycle shows how water moves around Earth."',
    isCorrect: true,
    explanation: 'This sentence introduces the main idea, while B is a supporting detail.',
    topic: 'science',
  },
  {
    question: 'Which is the topic sentence? A) "They pollinate one-third of our crops." B) "Honeybees play a vital role in food production."',
    answer: 'B) "Honeybees play a vital role in food production."',
    isCorrect: true,
    explanation: 'B introduces the main idea about honeybees, while A provides a specific detail.',
    topic: 'animals',
  },
  {
    question: 'Which is the topic sentence? A) "Video games can teach problem-solving skills." B) "Players must analyze situations and develop strategies."',
    answer: 'A) "Video games can teach problem-solving skills."',
    isCorrect: true,
    explanation: 'A introduces the main idea, while B explains how video games teach skills.',
    topic: 'technology',
  },
  // Incorrect examples
  {
    question: 'Which is the topic sentence? A) "Recycling helps protect the environment." B) "Every recycled item reduces pollution."',
    answer: 'B) "Every recycled item reduces pollution."',
    isCorrect: false,
    explanation: 'Incorrect - B is a supporting detail. A is the topic sentence that introduces the main idea.',
    topic: 'environment',
  },
  {
    question: 'Which is the topic sentence? A) "Reading regularly improves vocabulary." B) "Students encounter new words in context."',
    answer: 'B) "Students encounter new words in context."',
    isCorrect: false,
    explanation: 'Incorrect - B is a detail about how reading helps. A is the topic sentence.',
    topic: 'education',
  },
];

/**
 * @description Review examples for Writing SPOs (Single Paragraph Outlines) activity.
 * Students review outlines with topic sentences and supporting details.
 */
export const WRITING_SPOS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write an SPO about how dolphins communicate underwater.',
    answer: 'TS: Dolphins have special ways to communicate underwater.\nSD1: They make clicks and whistles to talk to other dolphins.\nSD2: They use sounds to tell about food and danger.\nCS: Dolphins use many different sounds to communicate in the ocean.',
    isCorrect: true,
    explanation: 'Clear topic sentence, relevant supporting details, and a conclusion that ties it together.',
    topic: 'animals',
  },
  {
    question: 'Write an SPO about the importance of exercise.',
    answer: 'TS: Exercise is very important for our health.\nSD1: It makes our heart and muscles strong.\nSD2: It also helps our brain work better.\nCS: We should exercise every day to stay healthy.',
    isCorrect: true,
    explanation: 'Organized outline with on-topic details that support the main idea.',
    topic: 'health',
  },
  {
    question: 'Write an SPO about why recycling is important.',
    answer: 'TS: Recycling is a key way we can protect our environment.\nSD1: It turns old materials into new products instead of waste.\nSD2: Recycling saves natural resources like trees and minerals.\nSD3: It helps protect animal homes from being destroyed.\nCS: Everyone can help the Earth by recycling every day.',
    isCorrect: true,
    explanation: 'Well-organized SPO with three relevant supporting details.',
    topic: 'environment',
  },
  // Incorrect examples
  {
    question: 'Write an SPO about how plants make food.',
    answer: 'TS: I like plants.\nSD1: Plants are green.\nSD2: Some plants have flowers.\nCS: The end.',
    isCorrect: false,
    explanation: 'Topic sentence is not clear, details are off-topic, and conclusion is incomplete.',
    topic: 'science',
  },
  {
    question: 'Write an SPO about oceans.',
    answer: 'TS: The ocean has water.\nSD1: Fish swim.\nSD2: Fish swim.\nSD3: Fish swim.\nCS: I went to the beach last summer with my family.',
    isCorrect: false,
    explanation: 'Weak topic sentence, repetitive details, and off-topic personal conclusion.',
    topic: 'nature',
  },
];

/**
 * @description Review examples for Eliminate Irrelevant Sentences activity.
 * Students identify which sentence does not belong in a paragraph.
 */
export const ELIMINATE_IRRELEVANT_SENTENCES_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Which sentence is irrelevant? Topic: Dolphins communicate. Sentences: A) They use echolocation. B) They live in pods. C) Some sharks detect electrical fields.',
    answer: 'C) "Some sharks detect electrical fields."',
    isCorrect: true,
    explanation: 'Correct - sentence C is about sharks, not dolphins, so it is irrelevant.',
    topic: 'animals',
  },
  {
    question: 'Which sentence is irrelevant? Topic: Basketball requires skills. Sentences: A) Players practice dribbling. B) Teams plan strategies. C) Baseball games last over three hours.',
    answer: 'C) "Baseball games last over three hours."',
    isCorrect: true,
    explanation: 'Correct - sentence C is about baseball, not basketball.',
    topic: 'sports',
  },
  {
    question: 'Which sentence is irrelevant? Topic: Video games teach problem-solving. Sentences: A) Puzzle games make you think. B) Strategy games teach planning. C) Television shows are filmed in studios.',
    answer: 'C) "Television shows are filmed in studios."',
    isCorrect: true,
    explanation: 'Correct - sentence C is about TV production, not video games.',
    topic: 'technology',
  },
  // Incorrect examples
  {
    question: 'Which sentence is irrelevant? Topic: Solar panels convert sunlight to electricity. Sentences: A) They use photovoltaic cells. B) Many homes have solar panels. C) Wind turbines are renewable energy.',
    answer: 'B) "Many homes have solar panels."',
    isCorrect: false,
    explanation: 'Incorrect - B is relevant to solar panels. C about wind turbines is the irrelevant sentence.',
    topic: 'technology',
  },
  {
    question: 'Which sentence is irrelevant? Topic: Recycling helps reduce waste. Sentences: A) Paper and glass can be recycled. B) Communities have recycling programs. C) Composting creates rich soil.',
    answer: 'B) "Communities have recycling programs."',
    isCorrect: false,
    explanation: 'Incorrect - B is about recycling. C about composting is a different topic.',
    topic: 'environment',
  },
];

/**
 * @description Review examples for Elaborate Paragraphs activity.
 * Students review elaborated vs simple paragraphs.
 */
export const ELABORATE_PARAGRAPHS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Elaborate: "Mountains are very big. Rivers flow fast."',
    answer: 'Mountains are very big landforms found on every continent, from the Himalayas to the Rockies. Rivers flow fast down mountain slopes because gravity pulls the water from high elevations to sea level.',
    isCorrect: true,
    explanation: 'Adds specific details (where mountains are found, why rivers flow fast).',
    topic: 'geography',
  },
  {
    question: 'Elaborate: "I built a tower. I used blocks."',
    answer: 'Yesterday afternoon, I built a tower and I used colorful wooden blocks. The tower was tall, reaching almost to my shoulder because I carefully balanced each block.',
    isCorrect: true,
    explanation: 'Adds time detail, combines sentences, and explains why the tower was tall.',
    topic: 'activities',
  },
  {
    question: 'Elaborate: "Table tennis is a fun game. It uses a ball and paddle."',
    answer: 'Table tennis is an exciting game that requires lightning-fast reflexes and precise hand-eye coordination. It uses a small, lightweight ball and a rubber-coated paddle that provides excellent grip and spin control.',
    isCorrect: true,
    explanation: 'Adds descriptive details about why it is fun and describes equipment precisely.',
    topic: 'sports',
  },
  // Incorrect examples
  {
    question: 'Elaborate: "Eyes are important. They let us see colors and shapes."',
    answer: 'Eyes are important. They let us see beautiful colors and shapes. Eyes help us learn many things every day.',
    isCorrect: false,
    explanation: 'Did not follow instructions - did not add "because" or combine sentences as requested.',
    topic: 'science',
  },
  {
    question: 'Elaborate: "Matter is everything around us. Matter takes up space."',
    answer: 'Matter is everything around us. Matter takes up space. Matter has mass. Matter can be solid, liquid, or gas.',
    isCorrect: false,
    explanation: 'No elaboration - just copied the original sentences without adding details.',
    topic: 'science',
  },
];

/**
 * @description Review examples for Using Transition Words activity.
 * Students review correct use of transition words.
 */
export const USING_TRANSITION_WORDS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Fill in the blank: "The students finished their math test. ______, they started working on their science project."',
    answer: 'Next',
    isCorrect: true,
    explanation: '"Next" shows time sequence - one thing happens after another.',
    topic: 'education',
  },
  {
    question: 'Fill in the blank: "Animals have different ways to protect themselves. ______, porcupines use their sharp quills."',
    answer: 'For example',
    isCorrect: true,
    explanation: '"For example" introduces a specific illustration of the main point.',
    topic: 'animals',
  },
  {
    question: 'Fill in the blank: "The weather forecast predicted sunshine. ______, it rained all day."',
    answer: 'However',
    isCorrect: true,
    explanation: '"However" shows contrast between the prediction and what actually happened.',
    topic: 'science',
  },
  {
    question: 'Fill in the blank: "The team practiced every day for months. ______, they won the championship."',
    answer: 'As a result',
    isCorrect: true,
    explanation: '"As a result" shows that winning was a consequence of practicing.',
    topic: 'sports',
  },
  // Incorrect examples
  {
    question: 'Fill in the blank: "The chef prepared all ingredients. ______, she began cooking."',
    answer: 'For example',
    isCorrect: false,
    explanation: 'Incorrect - "For example" is for illustrations. Need a time sequence word like "Then".',
    topic: 'food',
  },
  {
    question: 'Fill in the blank: "The storm knocked down power lines. ______, thousands lost electricity."',
    answer: 'In addition',
    isCorrect: false,
    explanation: 'Incorrect - "In addition" adds more info. Need a cause-effect word like "As a result".',
    topic: 'science',
  },
];

/**
 * @description Review examples for Finishing Transition Words activity.
 * Students complete sentences using specific transition words.
 */
export const FINISHING_TRANSITION_WORDS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Complete the sentence starting with "therefore": "The lights on the carousel are very bright. Therefore, ______"',
    answer: 'Therefore, they give off a lot of light and heat energy.',
    isCorrect: true,
    explanation: 'Correctly uses "therefore" to show a logical conclusion about the lights.',
    topic: 'science',
  },
  {
    question: 'Complete with "for example": "He made changes to courts. For example, ______"',
    answer: 'For example, he created the jury system where citizens help decide court cases.',
    isCorrect: true,
    explanation: 'Correctly uses "for example" to give a specific illustration.',
    topic: 'history',
  },
  {
    question: 'Complete with "then": "The parents bring food to the nest. Then, ______"',
    answer: 'Then, they feed the hungry chicks until they can fly and hunt on their own.',
    isCorrect: true,
    explanation: 'Shows proper time sequence - feeding follows bringing food.',
    topic: 'animals',
  },
  // Incorrect examples
  {
    question: 'Complete with "specifically": "We move in lots of different ways. Specifically, ______"',
    answer: 'specifically we use muscles to control these many kinds of movements',
    isCorrect: false,
    explanation: 'Missing capitalization and proper punctuation. Sentence is also vague.',
    topic: 'science',
  },
  {
    question: 'Complete with "notably": "Our heart beats quickly after a race. Notably, ______"',
    answer: 'Notably, after running hard.',
    isCorrect: false,
    explanation: 'Incomplete sentence - does not form a complete thought.',
    topic: 'science',
  },
];

/**
 * @description Review examples for Write CS from Details activity.
 * Students write concluding sentences based on paragraph details.
 */
export const WRITE_CS_FROM_DETAILS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write a concluding sentence. Topic: How bees help plants. Details: Bees collect nectar. They carry pollen between flowers.',
    answer: 'Without bees, many plants could not make fruit or seeds.',
    isCorrect: true,
    explanation: 'Summarizes the importance of bees without repeating the details.',
    topic: 'nature',
  },
  {
    question: 'Write a concluding sentence. Topic: Water cycle. Details: Water evaporates. It falls as rain.',
    answer: 'This cycle keeps happening over and over again.',
    isCorrect: true,
    explanation: 'Wraps up the paragraph by emphasizing the continuous nature of the cycle.',
    topic: 'science',
  },
  {
    question: 'Write a concluding sentence. Topic: Bird migration. Details: Birds use sun and stars. They fly thousands of miles.',
    answer: 'This incredible journey happens year after year.',
    isCorrect: true,
    explanation: 'Creates closure by emphasizing the amazing nature of migration.',
    topic: 'animals',
  },
  // Incorrect examples
  {
    question: 'Write a concluding sentence. Topic: Thunderstorms. Details: Lightning forms in clouds. Thunder is the sound of heated air.',
    answer: 'Stay inside during storms.',
    isCorrect: false,
    explanation: 'This is advice, not a conclusion that summarizes the main ideas.',
    topic: 'weather',
  },
  {
    question: 'Write a concluding sentence. Topic: Stars forming. Details: Stars form in nebulae. Gravity pulls gas together.',
    answer: 'Stars are amazing!',
    isCorrect: false,
    explanation: 'Too vague - does not summarize the information about how stars form.',
    topic: 'space',
  },
];

/**
 * @description Review examples for Write TS from Details activity.
 * Students infer topic sentences from supporting details.
 */
export const WRITE_TS_FROM_DETAILS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write a topic sentence. Details: Trees clean air. They provide shade. They house wildlife.',
    answer: 'Trees in cities provide many important benefits to people and animals.',
    isCorrect: true,
    explanation: 'Captures the main idea that trees offer multiple benefits.',
    topic: 'environment',
  },
  {
    question: 'Write a topic sentence. Details: It strengthens muscles. It releases happy chemicals. It helps focus.',
    answer: 'Exercise improves both physical and mental health.',
    isCorrect: true,
    explanation: 'Summarizes that exercise has benefits for body and mind.',
    topic: 'health',
  },
  {
    question: 'Write a topic sentence. Details: The pyramids took decades to build. Thousands of workers were needed.',
    answer: 'Ancient Egypt built impressive monuments that required enormous effort.',
    isCorrect: true,
    explanation: 'Captures the scale and effort behind Egyptian construction.',
    topic: 'history',
  },
  // Incorrect examples
  {
    question: 'Write a topic sentence. Details: Butterflies start as eggs. They become caterpillars. They form chrysalises.',
    answer: 'butterflies are insects that can fly',
    isCorrect: false,
    explanation: 'Missing capitalization, and does not address the metamorphosis stages described.',
    topic: 'animals',
  },
  {
    question: 'Write a topic sentence. Details: Your body repairs itself. Your brain organizes memories. Immune system strengthens.',
    answer: 'Sleep is when you close your eyes at night.',
    isCorrect: false,
    explanation: 'Does not capture the importance of sleep - just describes the action.',
    topic: 'health',
  },
];

/**
 * @description Map of paragraph lesson IDs to their review examples.
 */
export const PARAGRAPH_EXAMPLES: Record<string, ReviewExample[]> = {
  'make-topic-sentences': MAKE_TOPIC_SENTENCES_EXAMPLES,
  'identify-topic-sentence': IDENTIFY_TOPIC_SENTENCE_EXAMPLES,
  'writing-spos': WRITING_SPOS_EXAMPLES,
  'eliminate-irrelevant-sentences': ELIMINATE_IRRELEVANT_SENTENCES_EXAMPLES,
  'elaborate-paragraphs': ELABORATE_PARAGRAPHS_EXAMPLES,
  'using-transition-words': USING_TRANSITION_WORDS_EXAMPLES,
  'finishing-transition-words': FINISHING_TRANSITION_WORDS_EXAMPLES,
  'write-cs-from-details': WRITE_CS_FROM_DETAILS_EXAMPLES,
  'write-ts-from-details': WRITE_TS_FROM_DETAILS_EXAMPLES,
};
