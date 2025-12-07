/**
 * @fileoverview Essay-level practice lessons (Tier 3).
 * Covers introductions, conclusions, thesis statements, and essay structure.
 */

import { PracticeLesson } from './types';

/**
 * @description Essay-level practice lessons.
 */
export const ESSAY_LESSONS: Record<string, PracticeLesson> = {
  'distinguish-g-s-t': {
    id: 'distinguish-g-s-t',
    name: 'Distinguish GST Statements',
    description: 'Identify General, Specific, and Thesis statements in introductions.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Label each sentence as General, Specific, or Thesis.',
    prompts: [
      {
        id: 'gst-1',
        prompt:
          'Label these sentences about Ancient Rome:\n• "Ancient Rome was one of the most powerful civilizations in history."\n• "The Romans built roads, aqueducts, and massive buildings that lasted for thousands of years."\n• "Roman engineering skills changed how cities were built and many of their ideas are still used today."',
        hint: 'General = broadest statement. Specific = narrowing details. Thesis = main argument.',
      },
      {
        id: 'gst-2',
        prompt:
          'Label these sentences about Climate Change:\n• "Our planet\'s climate is changing rapidly."\n• "Rising temperatures are melting ice caps and causing more extreme weather events."\n• "Everyone must take action now to reduce their carbon footprint and protect Earth for future generations."',
        hint: 'Which sentence makes an argument? That\'s usually the thesis.',
      },
      {
        id: 'gst-3',
        prompt:
          'Label these sentences about The Grand Canyon:\n• "Natural wonders can be found all around the world."\n• "The Grand Canyon, located in Arizona, stretches for 277 miles and is over a mile deep in some places."\n• "The Grand Canyon\'s amazing size and colorful rock layers make it the most impressive natural landmark in the United States."',
        hint: 'Look for the sentence with specific facts and numbers - that\'s the Specific.',
      },
      {
        id: 'gst-4',
        prompt:
          'Label these sentences about Video Games:\n• "Entertainment can sometimes serve educational purposes."\n• "Games like Minecraft Education and Math Blaster combine learning objectives with engaging gameplay."\n• "Educational video games can help students learn math and reading skills while having fun."',
        hint: 'The thesis often includes words like "should," "must," or "can help."',
      },
      {
        id: 'gst-5',
        prompt:
          'Label these sentences about Animal Habitats:\n• "Animals live in many different environments around the world."\n• "Rainforests provide homes for thousands of unique animal species like colorful parrots and playful monkeys."\n• "We must protect rainforests from destruction to save the amazing animals that cannot survive anywhere else."',
        hint: 'General is about all animals. Specific is about rainforest animals. Thesis is the argument.',
      },
    ],
    exampleResponse: {
      prompt:
        'Label these sentences about Healthy Eating:\n• "What we eat affects how our bodies work."\n• "Fruits and vegetables contain vitamins that help us grow and stay healthy."\n• "Children should eat five servings of fruits and vegetables each day to maintain good health."',
      response:
        'General: "What we eat affects how our bodies work." (broadest, about food and health in general)\n\nSpecific: "Fruits and vegetables contain vitamins that help us grow and stay healthy." (narrows to specific foods and their benefits)\n\nThesis: "Children should eat five servings of fruits and vegetables each day to maintain good health." (makes a specific argument about what children should do)',
      explanation:
        'The sentences move from broad (General) to narrow (Specific) to argumentative (Thesis). The thesis includes "should" and makes a specific claim.',
    },
  },

  'write-g-s-from-t': {
    id: 'write-g-s-from-t',
    name: 'Write G & S from Thesis',
    description: 'Create General and Specific statements to build an introduction.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 5, revisePhase: 2 },
    instruction: 'Write General and Specific statements to introduce this thesis.',
    prompts: [
      {
        id: 'gst-write-1',
        prompt:
          'Write a General and Specific statement to introduce this thesis:\n\nThesis: "Frederick Douglass\'s powerful writings and speeches helped many people understand why slavery was wrong and needed to end."',
        hint: 'General could be about leaders who fought injustice. Specific could introduce who Douglass was.',
      },
      {
        id: 'gst-write-2',
        prompt:
          'Write a General and Specific statement to introduce this thesis:\n\nThesis: "The Byzantine Empire\'s long survival was due to its strong military, rich culture, and strategic location."',
        hint: 'General could be about powerful ancient empires. Specific could introduce the Byzantine Empire.',
      },
      {
        id: 'gst-write-3',
        prompt:
          'Write a General and Specific statement to introduce this thesis:\n\nThesis: "Solar energy offers a renewable power source that can help reduce pollution and solve many energy problems."',
        hint: 'General could be about energy needs. Specific could introduce solar power specifically.',
      },
      {
        id: 'gst-write-4',
        prompt:
          'Write a General and Specific statement to introduce this thesis:\n\nThesis: "Captain Smith\'s leadership skills and survival knowledge were the main reasons Jamestown survived its difficult first years in America."',
        hint: 'General could be about early American explorers. Specific could introduce Captain John Smith.',
      },
      {
        id: 'gst-write-5',
        prompt:
          'Write a General and Specific statement to introduce this thesis:\n\nThesis: "The samurai\'s Bushido values helped shape not only how they behaved in battle, but also influenced Japanese culture for hundreds of years."',
        hint: 'General could be about warriors and codes of honor. Specific could introduce samurai and Bushido.',
      },
    ],
    exampleResponse: {
      prompt:
        'Write a General and Specific statement to introduce this thesis:\n\nThesis: "Dolphins use echolocation to navigate and hunt in the ocean."',
      response:
        'General: "The ocean contains diverse animals with a wide range of amazing behaviors."\n\nSpecific: "Dolphins, for example, are intelligent marine mammals that use special sounds to communicate and find their way around."',
      explanation:
        'The General statement is broad (about ocean animals). The Specific narrows to dolphins and their sounds. Together they build toward the thesis about echolocation.',
    },
  },

  'write-introductory-sentences': {
    id: 'write-introductory-sentences',
    name: 'Add Intro Sentences',
    description: 'Add sentences to complete an introductory paragraph.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 5, revisePhase: 2 },
    instruction: 'Add a sentence to connect the ideas in this introduction.',
    prompts: [
      {
        id: 'intro-1',
        prompt:
          'Add a bridging sentence to connect these ideas:\n\nGeneral: "Technology has transformed education."\nSpecific: "Digital devices are common in modern classrooms."\n\n[YOUR SENTENCE HERE]\n\nThesis: "Technology enhances learning by providing interactive experiences and access to unlimited information."',
        hint: 'Add a sentence that explains HOW digital devices are used or gives an example.',
      },
      {
        id: 'intro-2',
        prompt:
          'Add a bridging sentence to connect these ideas:\n\nGeneral: "The ocean is vital to life on Earth."\nSpecific: "Marine ecosystems face serious threats."\n\n[YOUR SENTENCE HERE]\n\nThesis: "We must protect our oceans through conservation efforts and sustainable practices."',
        hint: 'Add a sentence that explains what threats exist or why protection is needed.',
      },
      {
        id: 'intro-3',
        prompt:
          'Add a bridging sentence to connect these ideas:\n\nGeneral: "Reading is a fundamental skill."\nSpecific: "Books open doors to knowledge and imagination."\n\n[YOUR SENTENCE HERE]\n\nThesis: "Students should read for at least 30 minutes every day to improve their academic success."',
        hint: 'Add a sentence about the benefits of reading regularly.',
      },
      {
        id: 'intro-4',
        prompt:
          'Add a bridging sentence to connect these ideas:\n\nGeneral: "Helping others strengthens communities."\nSpecific: "Volunteering benefits both givers and receivers."\n\n[YOUR SENTENCE HERE]\n\nThesis: "Students should participate in community service to develop empathy and leadership skills."',
        hint: 'Add a sentence about what types of volunteer work students can do.',
      },
      {
        id: 'intro-5',
        prompt:
          'Add a bridging sentence to connect these ideas:\n\nGeneral: "Exercise is important for everyone."\nSpecific: "Physical activity has many health benefits."\n\n[YOUR SENTENCE HERE]\n\nThesis: "Daily exercise helps children develop strong bodies and healthy habits for life."',
        hint: 'Add a sentence about specific benefits like energy, mood, or focus.',
      },
    ],
    exampleResponse: {
      prompt:
        'Add a bridging sentence:\n\nGeneral: "Ancient civilizations have shaped modern society."\nSpecific: "Egypt was one of the most advanced civilizations of the ancient world."\n\n[YOUR SENTENCE HERE]\n\nThesis: "Ancient Egyptian innovations in architecture, writing, and government influenced cultures for thousands of years."',
      response:
        'The Egyptians built massive monuments and developed systems for farming along the Nile River.',
      explanation:
        'This bridging sentence adds new information (monuments, farming) that connects Egypt\'s advancement to the thesis about their lasting innovations.',
    },
  },

  'craft-conclusion-from-gst': {
    id: 'craft-conclusion-from-gst',
    name: 'Write Conclusion Paragraphs',
    description: 'Create conclusions using the TSG (Thesis-Specific-General) structure.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 5, revisePhase: 2 },
    instruction: 'Write a conclusion paragraph for this essay. Use T-S-G order (reverse of intro).',
    prompts: [
      {
        id: 'concl-1',
        prompt:
          'Write a conclusion (T-S-G order) for this introduction:\n\nGeneral: "Ancient civilizations have left lasting marks on human history."\nSpecific: "The Egyptians built massive pyramids, developed hieroglyphic writing, and created advanced irrigation systems."\nThesis: "Ancient Egypt\'s innovations in architecture, writing, and agriculture shaped the development of future civilizations."',
        hint: 'Start with the thesis (rephrased), then specific, then general. Don\'t copy exactly!',
      },
      {
        id: 'concl-2',
        prompt:
          'Write a conclusion (T-S-G order) for this introduction:\n\nGeneral: "The universe contains countless wonders."\nSpecific: "Our solar system has eight planets, dozens of moons, and thousands of asteroids orbiting the sun."\nThesis: "Studying our solar system helps us understand our place in the universe."',
        hint: 'Rephrase each part. End with a forward-looking general statement.',
      },
      {
        id: 'concl-3',
        prompt:
          'Write a conclusion (T-S-G order) for this introduction:\n\nGeneral: "Protecting our environment is everyone\'s responsibility."\nSpecific: "Recycling paper, plastic, glass, and metal reduces waste and saves natural resources."\nThesis: "Recycling helps create a cleaner, more sustainable world for future generations."',
        hint: 'Start by restating the thesis, then summarize the specifics, end with a broader takeaway.',
      },
      {
        id: 'concl-4',
        prompt:
          'Write a conclusion (T-S-G order) for this introduction:\n\nGeneral: "Learning happens in many different ways."\nSpecific: "Reading books expands vocabulary, improves focus, and sparks imagination."\nThesis: "Regular reading helps students succeed in school and life."',
        hint: 'Restate the main argument, summarize the benefits, end with a broader truth.',
      },
      {
        id: 'concl-5',
        prompt:
          'Write a conclusion (T-S-G order) for this introduction:\n\nGeneral: "Many animals make wonderful companions."\nSpecific: "Dogs are loyal, playful, and protective of their families."\nThesis: "Dogs make excellent pets for children and adults alike."',
        hint: 'Rephrase each statement. Your conclusion should feel like a satisfying ending.',
      },
    ],
    exampleResponse: {
      prompt:
        'Write a conclusion for this introduction:\n\nGeneral: "Water is essential for all life on Earth."\nSpecific: "Through evaporation, condensation, and precipitation, water continuously moves."\nThesis: "The water cycle ensures that fresh water is constantly renewed."',
      response:
        'T (rephrased): The water cycle keeps giving us fresh water all over Earth.\nS (rephrased): Water goes up as vapor, makes clouds, and comes down as rain over and over.\nG (rephrased): Life needs the water cycle to survive.',
      explanation:
        'The conclusion follows T-S-G order (reverse of intro\'s G-S-T). Each sentence is rephrased, not copied, and the general statement ends with a broader truth.',
    },
  },

  'write-t-from-topic': {
    id: 'write-t-from-topic',
    name: 'Write Thesis from Topic',
    description: 'Develop a clear thesis statement from a given topic.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Write a thesis statement for this topic.',
    prompts: [
      {
        id: 'thesis-1',
        prompt:
          'Write a thesis statement for this topic:\n\nTopic: Cell phones for kids\n\nBackground: Cell phones are becoming common among young students. Parents and educators have different views on this trend. Some think phones help with safety, while others worry about distractions.',
        hint: 'Take a position: Should kids have cell phones? Why or why not?',
      },
      {
        id: 'thesis-2',
        prompt:
          'Write a thesis statement for this topic:\n\nTopic: Year-round school\n\nBackground: Some schools operate year-round instead of having long summer breaks. Supporters say it helps students retain knowledge, while critics worry about burnout and lost summer experiences.',
        hint: 'Take a clear stance and give a reason for your position.',
      },
      {
        id: 'thesis-3',
        prompt:
          'Write a thesis statement for this topic:\n\nTopic: School lunch programs\n\nBackground: Schools provide lunch to millions of students each day. Some schools offer mostly healthy options, while others still serve processed foods. Many families rely on school meals.',
        hint: 'What should schools do about lunch? Make a specific argument.',
      },
      {
        id: 'thesis-4',
        prompt:
          'Write a thesis statement for this topic:\n\nTopic: Physical education requirements\n\nBackground: Most schools require students to take physical education classes. Some people think more PE time is needed, while others believe academic classes should take priority.',
        hint: 'Should schools have more, less, or the same amount of PE? Why?',
      },
      {
        id: 'thesis-5',
        prompt:
          'Write a thesis statement for this topic:\n\nTopic: Zoos and animal conservation\n\nBackground: Zoos house animals from around the world. Some people believe zoos help protect endangered species and educate the public. Others think animals should live in their natural habitats.',
        hint: 'Are zoos good or bad for animals and conservation? Take a position.',
      },
    ],
    exampleResponse: {
      prompt:
        'Write a thesis statement for:\n\nTopic: Homework\n\nBackground: Students often have homework after school. Some find it helpful for learning, while others feel it takes too much time away from other activities.',
      response: 'Homework helps students practice what they learned in school.',
      explanation:
        'This thesis takes a clear position (homework is helpful) and gives a reason (practice). It\'s arguable - someone could disagree and support their position.',
    },
  },

  'match-details-pro-con': {
    id: 'match-details-pro-con',
    name: 'Match Details Pro/Con',
    description: 'Categorize supporting details as pro (for) or con (against) arguments.',
    category: 'essay',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Sort these details into pro (for) and con (against) categories.',
    prompts: [
      {
        id: 'procon-1',
        prompt:
          'Topic: Should homework be banned?\n\nSort these details:\n1. "Students need time to relax and play after school."\n2. "Practice at home helps students remember lessons."\n3. "Too much homework causes stress and anxiety."\n4. "Homework teaches responsibility and time management."\n5. "Family time is more valuable than extra worksheets."\n6. "Parents can see what children are learning."',
        hint: 'PRO = supports banning homework. CON = supports keeping homework.',
      },
      {
        id: 'procon-2',
        prompt:
          'Topic: Should schools start later?\n\nSort these details:\n1. "Teens naturally sleep later due to biology."\n2. "Parents need kids at school before work."\n3. "More sleep improves academic performance."\n4. "After-school activities would end too late."\n5. "Fewer car accidents with alert teen drivers."\n6. "Bus schedules would be more expensive."',
        hint: 'PRO = supports later start times. CON = supports current start times.',
      },
      {
        id: 'procon-3',
        prompt:
          'Topic: Should junk food be banned in schools?\n\nSort these details:\n1. "Healthy eating habits start young."\n2. "Students should learn to make choices."\n3. "Sugar crashes affect afternoon learning."\n4. "Vending machines provide school funding."\n5. "Childhood obesity rates are rising."\n6. "Total bans may increase rebellious eating."',
        hint: 'PRO = supports banning junk food. CON = supports keeping junk food available.',
      },
      {
        id: 'procon-4',
        prompt:
          'Topic: Should pets be allowed in classrooms?\n\nSort these details:\n1. "Caring for animals teaches responsibility."\n2. "Many students have allergies to animals."\n3. "Pets can calm anxious students."\n4. "Pets require expensive care and supplies."\n5. "Students learn about biology firsthand."\n6. "Animals can be noisy and disruptive."',
        hint: 'PRO = supports classroom pets. CON = opposes classroom pets.',
      },
      {
        id: 'procon-5',
        prompt:
          'Topic: Should students have more field trips?\n\nSort these details:\n1. "Real-world experiences enhance learning."\n2. "Field trips are expensive for schools."\n3. "Field trips create lasting memories."\n4. "Classroom time is already limited."\n5. "Students learn better outside classrooms."\n6. "Some students misbehave on trips."',
        hint: 'PRO = supports more field trips. CON = opposes more field trips.',
      },
    ],
    exampleResponse: {
      prompt:
        'Topic: Should schools have longer recess?\n\nSort: Exercise helps focus / More recess = less class time / Playing reduces stress / Kids get hurt on playgrounds',
      response:
        'PRO (longer recess):\n• Exercise helps students focus better in class.\n• Playing with friends reduces stress and anxiety.\n\nCON (against longer recess):\n• More recess means less time for important subjects.\n• Some students get hurt during playground activities.',
      explanation:
        'PRO arguments support the position (longer recess). CON arguments oppose it. Each detail is sorted based on whether it supports or contradicts the main question.',
    },
  },
};
