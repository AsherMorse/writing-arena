/**
 * @fileoverview Paragraph-level practice lessons (Tier 2).
 * Covers topic sentences, paragraph structure, and transitions.
 */

import { PracticeLesson } from './types';

/**
 * @description Paragraph-level practice lessons.
 */
export const PARAGRAPH_LESSONS: Record<string, PracticeLesson> = {
  'make-topic-sentences': {
    id: 'make-topic-sentences',
    name: 'Make Topic Sentences',
    description: 'Create clear topic sentences that introduce paragraph main ideas.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Write a topic sentence that introduces the main idea for a paragraph about this topic.',
    prompts: [
      {
        id: 'mts-1',
        prompt: 'Write a topic sentence about dolphins for a paragraph explaining how they communicate.',
        hint: 'Your topic sentence should introduce the idea that dolphins have special ways to communicate.',
      },
      {
        id: 'mts-2',
        prompt: 'Write a topic sentence about the importance of rainforests.',
        hint: 'Think about why rainforests matter to Earth and introduce that main idea.',
      },
      {
        id: 'mts-3',
        prompt: 'Write a topic sentence about how volcanoes erupt.',
        hint: 'Introduce what happens when volcanoes erupt without giving all the details.',
      },
      {
        id: 'mts-4',
        prompt: 'Write a topic sentence about the benefits of exercise.',
        hint: 'State the main idea that exercise is good for us.',
      },
      {
        id: 'mts-5',
        prompt: 'Write a topic sentence about how bees help plants grow.',
        hint: 'Introduce the role bees play in helping plants.',
      },
      {
        id: 'mts-6',
        prompt: 'Write a topic sentence about the water cycle.',
        hint: 'State the main idea about how water moves around Earth.',
      },
    ],
    exampleResponse: {
      prompt: 'Write a topic sentence about solar energy.',
      response: 'Solar energy provides a clean and renewable alternative to fossil fuels.',
      explanation: 'This sentence clearly introduces the main idea (solar energy as an alternative) without giving all the details.',
    },
  },

  'identify-topic-sentence': {
    id: 'identify-topic-sentence',
    name: 'Identify Topic Sentences',
    description: 'Find the topic sentence in a paragraph.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Read the paragraph and explain which sentence is the topic sentence and why.',
    prompts: [
      {
        id: 'its-1',
        prompt: 'Which is the topic sentence and why? "Soccer is the world\'s most popular sport. Players use their feet to control and pass a ball. Billions of fans watch matches on TV."',
        hint: 'The topic sentence introduces the main idea. Which sentence tells us what the whole paragraph is about?',
      },
      {
        id: 'its-2',
        prompt: 'Which is the topic sentence? "Dolphins communicate through clicks and whistles. Each dolphin has its own unique whistle. Pod members use sounds to hunt together."',
        hint: 'Look for the sentence that introduces the topic of dolphin communication.',
      },
      {
        id: 'its-3',
        prompt: 'Which is the topic sentence? "The Great Wall stretches over 13,000 miles. It was built over many centuries. The Great Wall of China is an ancient defensive structure."',
        hint: 'Which sentence gives the main idea that the others support?',
      },
      {
        id: 'its-4',
        prompt: 'Which is the topic sentence? "Video games can teach problem-solving skills. Players analyze situations and develop strategies. Educational games target math and reading."',
        hint: 'Find the sentence that introduces what video games can do.',
      },
      {
        id: 'its-5',
        prompt: 'Which is the topic sentence? "Rainforests contain incredible biodiversity. A single tree can host hundreds of species. Scientists discover new species every year."',
        hint: 'Look for the sentence that makes the main claim about rainforests.',
      },
    ],
    exampleResponse: {
      prompt: 'Which is the topic sentence? "Honeybees play a vital role in food production. They pollinate one-third of our crops. Without bees, we would have less food."',
      response: '"Honeybees play a vital role in food production" is the topic sentence because it introduces the main idea that the other sentences support with details.',
      explanation: 'The topic sentence states the main claim; the other sentences provide evidence for it.',
    },
  },

  'writing-spos': {
    id: 'writing-spos',
    name: 'Writing Single Paragraph Outlines',
    description: 'Create organized outlines with topic sentence and supporting details.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 5, revisePhase: 2 },
    instruction: 'Write an outline with: TS (topic sentence), 2-3 SD (supporting details), and CS (concluding sentence).',
    prompts: [
      {
        id: 'spo-1',
        prompt: 'Write an SPO about how dolphins communicate underwater.',
        hint: 'TS: Main idea about dolphin communication. SD: Specific ways they communicate. CS: Wrap up the idea.',
      },
      {
        id: 'spo-2',
        prompt: 'Write an SPO about why exercise is important for health.',
        hint: 'TS: Exercise is important. SD: Benefits for body and mind. CS: Summary statement.',
      },
      {
        id: 'spo-3',
        prompt: 'Write an SPO about how the water cycle works.',
        hint: 'TS: Introduce the water cycle. SD: Steps in the process. CS: Conclude about why it matters.',
      },
      {
        id: 'spo-4',
        prompt: 'Write an SPO about why recycling is important.',
        hint: 'TS: State that recycling helps. SD: Give reasons why. CS: Call to action or summary.',
      },
      {
        id: 'spo-5',
        prompt: 'Write an SPO about how bees help plants grow.',
        hint: 'TS: Bees help plants. SD: Explain pollination process. CS: State the importance.',
      },
    ],
    exampleResponse: {
      prompt: 'Write an SPO about seasons.',
      response: 'TS: The changing seasons happen because of Earth\'s movement.\nSD1: Earth tilts as it goes around the sun each year.\nSD2: We have summer when we tilt toward the sun and winter when we tilt away.\nCS: This pattern gives us four different seasons every year.',
      explanation: 'The outline has a clear structure: topic sentence introduces the idea, supporting details explain it, and concluding sentence wraps it up.',
    },
  },

  'eliminate-irrelevant-sentences': {
    id: 'eliminate-irrelevant-sentences',
    name: 'Eliminate Irrelevant Sentences',
    description: 'Identify and remove sentences that do not support the topic.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Find the sentence that does not belong and explain why it is off-topic.',
    prompts: [
      {
        id: 'eis-1',
        prompt: 'Which sentence is irrelevant? Topic: Dolphins communicate. "They use echolocation. They live in pods. Some sharks detect electrical fields."',
        hint: 'Which sentence is about a different animal?',
      },
      {
        id: 'eis-2',
        prompt: 'Which sentence is irrelevant? Topic: Basketball skills. "Players practice dribbling. Teams plan strategies. Baseball games last three hours."',
        hint: 'Which sentence is about a different sport?',
      },
      {
        id: 'eis-3',
        prompt: 'Which sentence is irrelevant? Topic: Solar panels. "They convert sunlight to electricity. Many homes have them. Wind turbines generate power."',
        hint: 'Which sentence is about a different energy source?',
      },
      {
        id: 'eis-4',
        prompt: 'Which sentence is irrelevant? Topic: Rainforest biodiversity. "Scientists find new species. The canopy houses many animals. Pine trees grow in cold climates."',
        hint: 'Which sentence is about a different type of ecosystem?',
      },
      {
        id: 'eis-5',
        prompt: 'Which sentence is irrelevant? Topic: Music education benefits. "It improves coordination. Reading music teaches patterns. Art classes meet twice a week."',
        hint: 'Which sentence is about a different subject?',
      },
    ],
    exampleResponse: {
      prompt: 'Topic: Exercise benefits. "It strengthens muscles. It boosts mood. Some people prefer reading books."',
      response: '"Some people prefer reading books" is irrelevant because the paragraph is about exercise benefits, not reading preferences.',
      explanation: 'A relevant sentence supports the main topic. This sentence introduces an unrelated activity.',
    },
  },

  'elaborate-paragraphs': {
    id: 'elaborate-paragraphs',
    name: 'Elaborate on Paragraphs',
    description: 'Add details and explanations to develop paragraph ideas.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Expand the simple paragraph by adding specific details, examples, and explanations.',
    prompts: [
      {
        id: 'ep-1',
        prompt: 'Elaborate: "Mountains are big. Rivers flow fast. Lakes are still."',
        hint: 'Add where mountains are found, why rivers flow, and how lakes form.',
      },
      {
        id: 'ep-2',
        prompt: 'Elaborate: "I built a tower. I used blocks. It was tall."',
        hint: 'Add when you built it, what kind of blocks, and why it was tall.',
      },
      {
        id: 'ep-3',
        prompt: 'Elaborate: "Eyes are important. They let us see colors and shapes."',
        hint: 'Explain WHY eyes are important and give examples of what we see.',
      },
      {
        id: 'ep-4',
        prompt: 'Elaborate: "Table tennis is fun. It uses a ball and paddle."',
        hint: 'Add WHY it is fun and describe the equipment in more detail.',
      },
      {
        id: 'ep-5',
        prompt: 'Elaborate: "Hearing is important. We hear sounds. It keeps us safe."',
        hint: 'Give examples of what we hear and how hearing protects us.',
      },
    ],
    exampleResponse: {
      prompt: 'Elaborate: "Matter takes up space. Matter has mass."',
      response: 'Matter is everything around us and it takes up space. For example, a book on your desk is matter that occupies physical space. Matter has mass because it contains atoms and molecules that have weight.',
      explanation: 'Added an example (book), combined sentences, and explained WHY matter has mass.',
    },
  },

  'using-transition-words': {
    id: 'using-transition-words',
    name: 'Using Transition Words',
    description: 'Connect ideas smoothly using appropriate transitions.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Choose the best transition word to connect the sentences.',
    prompts: [
      {
        id: 'utw-1',
        prompt: 'Fill in: "The students finished their test. ______, they started the science project."',
        hint: 'What transition shows TIME ORDER (one thing after another)?',
      },
      {
        id: 'utw-2',
        prompt: 'Fill in: "Animals protect themselves in different ways. ______, porcupines use sharp quills."',
        hint: 'What transition introduces an EXAMPLE?',
      },
      {
        id: 'utw-3',
        prompt: 'Fill in: "The forecast predicted sunshine. ______, it rained all day."',
        hint: 'What transition shows CONTRAST (opposite of what was expected)?',
      },
      {
        id: 'utw-4',
        prompt: 'Fill in: "The team practiced every day. ______, they won the championship."',
        hint: 'What transition shows RESULT (what happened because of practice)?',
      },
      {
        id: 'utw-5',
        prompt: 'Fill in: "Solar panels reduce bills. ______, they help the environment."',
        hint: 'What transition ADDS another benefit?',
      },
    ],
    exampleResponse: {
      prompt: 'Fill in: "The volcano erupted. ______, villages were evacuated."',
      response: 'The volcano erupted. Therefore, villages were evacuated.',
      explanation: '"Therefore" shows cause and effect - the eruption caused the evacuation.',
    },
  },

  'finishing-transition-words': {
    id: 'finishing-transition-words',
    name: 'Finishing Transition Words',
    description: 'Complete sentences using appropriate transition words.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Complete the sentence using the given transition word.',
    prompts: [
      {
        id: 'ftw-1',
        prompt: 'Complete using "therefore": "The carousel lights are very bright. Therefore, ______"',
        hint: 'What is a RESULT of the lights being bright?',
      },
      {
        id: 'ftw-2',
        prompt: 'Complete using "for example": "He made changes to the courts. For example, ______"',
        hint: 'Give a SPECIFIC example of a change he made.',
      },
      {
        id: 'ftw-3',
        prompt: 'Complete using "however": "I wanted to go outside. However, ______"',
        hint: 'What CONTRASTS with wanting to go outside?',
      },
      {
        id: 'ftw-4',
        prompt: 'Complete using "in addition": "Dogs are loyal pets. In addition, ______"',
        hint: 'What is ANOTHER quality of dogs?',
      },
      {
        id: 'ftw-5',
        prompt: 'Complete using "then": "The parents bring food to the nest. Then, ______"',
        hint: 'What happens NEXT after bringing food?',
      },
    ],
    exampleResponse: {
      prompt: 'Complete using "specifically": "We move in many ways. Specifically, ______"',
      response: 'We move in many ways. Specifically, our muscles contract and relax to help us walk, run, jump, and play sports.',
      explanation: '"Specifically" introduces detailed examples of the general statement.',
    },
  },

  'write-cs-from-details': {
    id: 'write-cs-from-details',
    name: 'Write Concluding Sentences',
    description: 'Create concluding sentences that wrap up paragraph ideas.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Write a concluding sentence that summarizes or wraps up the paragraph.',
    prompts: [
      {
        id: 'wcs-1',
        prompt: 'Write a concluding sentence. Topic: How bees help plants. Details: Bees collect nectar. They carry pollen between flowers.',
        hint: 'Summarize why bees are important based on these details.',
      },
      {
        id: 'wcs-2',
        prompt: 'Write a concluding sentence. Topic: Water cycle. Details: Water evaporates. Clouds form. Rain falls.',
        hint: 'Wrap up by emphasizing the cycle continues.',
      },
      {
        id: 'wcs-3',
        prompt: 'Write a concluding sentence. Topic: Exercise benefits. Details: Strengthens heart. Boosts mood. Helps focus.',
        hint: 'Summarize the overall benefit of exercise.',
      },
      {
        id: 'wcs-4',
        prompt: 'Write a concluding sentence. Topic: Bird migration. Details: Birds use sun and stars. They fly thousands of miles.',
        hint: 'Wrap up by emphasizing the amazing nature of migration.',
      },
      {
        id: 'wcs-5',
        prompt: 'Write a concluding sentence. Topic: Rainforest importance. Details: Home to millions of species. Produces oxygen.',
        hint: 'Summarize why we should care about rainforests.',
      },
    ],
    exampleResponse: {
      prompt: 'Topic: Recycling. Details: Saves resources. Reduces waste. Protects habitats.',
      response: 'Everyone can help protect our planet by recycling every day.',
      explanation: 'The concluding sentence summarizes the importance and includes a call to action.',
    },
  },

  'write-ts-from-details': {
    id: 'write-ts-from-details',
    name: 'Write Topic Sentences from Details',
    description: 'Infer and write topic sentences from supporting details.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Read the details and write a topic sentence that captures the main idea.',
    prompts: [
      {
        id: 'wts-1',
        prompt: 'Write a topic sentence. Details: Trees clean air. They provide shade. They house wildlife.',
        hint: 'What is the main idea these details support about trees?',
      },
      {
        id: 'wts-2',
        prompt: 'Write a topic sentence. Details: Exercise strengthens muscles. It releases happy chemicals. It helps focus.',
        hint: 'What main idea connects all these exercise benefits?',
      },
      {
        id: 'wts-3',
        prompt: 'Write a topic sentence. Details: The pyramids took decades. Thousands of workers were needed. They still stand today.',
        hint: 'What main idea about the pyramids do these details support?',
      },
      {
        id: 'wts-4',
        prompt: 'Write a topic sentence. Details: Dolphins use clicks. They use whistles. They use body language.',
        hint: 'What is the main idea about how dolphins communicate?',
      },
      {
        id: 'wts-5',
        prompt: 'Write a topic sentence. Details: Video games require strategy. They teach problem-solving. They improve reaction time.',
        hint: 'What main claim can you make about video games?',
      },
    ],
    exampleResponse: {
      prompt: 'Details: Sleep helps body repair. Brain organizes memories. Immune system strengthens.',
      response: 'Sleep is essential for both physical health and mental well-being.',
      explanation: 'The topic sentence captures the main idea that sleep benefits both body and mind.',
    },
  },

  'write-freeform-paragraph': {
    id: 'write-freeform-paragraph',
    name: 'Write a Free-Form Paragraph',
    description: 'Write a complete paragraph with topic sentence, supporting details, and conclusion.',
    category: 'paragraph',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 6, revisePhase: 3 },
    instruction: 'Write a complete paragraph with a topic sentence, supporting details, and a concluding sentence.',
    prompts: [
      {
        id: 'wfp-1',
        prompt: 'Write a paragraph about how dolphins communicate underwater. Consider their use of clicks, whistles, and body language.',
        hint: 'Start with a topic sentence about dolphin communication, give specific examples, and end with a conclusion.',
      },
      {
        id: 'wfp-2',
        prompt: 'Write a paragraph about what makes Tokyo a unique city. Consider its mix of modern features and traditional history.',
        hint: 'Begin with what makes Tokyo special, support with specific details, and wrap up the main idea.',
      },
      {
        id: 'wfp-3',
        prompt: 'Write a paragraph about the importance of recycling. Explain how it helps the environment.',
        hint: 'State why recycling matters, give reasons and examples, and conclude with its overall impact.',
      },
      {
        id: 'wfp-4',
        prompt: 'Write a paragraph about how bees help plants grow. Discuss the pollination process.',
        hint: 'Introduce the topic, explain the process with details, and summarize the importance.',
      },
      {
        id: 'wfp-5',
        prompt: 'Write a paragraph about the benefits of exercise for both body and mind.',
        hint: 'Make a claim about exercise, support it with specific benefits, and conclude effectively.',
      },
      {
        id: 'wfp-6',
        prompt: 'Write a paragraph about what makes rainforests important to our planet.',
        hint: 'State the importance, explain with examples, and wrap up why we should care.',
      },
    ],
    exampleResponse: {
      prompt: 'Write a paragraph about the water cycle.',
      response: 'The water cycle is a continuous process that keeps water moving around our planet. First, the sun heats water in oceans and lakes, causing it to evaporate into the air as water vapor. This vapor rises and cools, forming clouds through condensation. When the clouds become heavy with water droplets, precipitation falls as rain or snow. The water then flows into streams and rivers, eventually returning to the ocean to start the cycle again. This never-ending cycle is essential for providing fresh water to all living things on Earth.',
      explanation: 'The paragraph has a clear topic sentence, detailed supporting points that follow a logical order, and a strong concluding sentence.',
    },
  },
};
