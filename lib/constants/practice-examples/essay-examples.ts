/**
 * @fileoverview Review examples for essay-level lessons (Tier 3).
 * Extracted from AlphaWrite test data.
 */

import { ReviewExample } from './types';

/**
 * @description Review examples for Distinguish G-S-T activity.
 * Students identify which sentences are General, Specific, and Thesis statements.
 */
export const DISTINGUISH_GST_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Label these sentences about Healthy Eating:\n• "What we eat affects how our bodies work."\n• "Fruits and vegetables contain vitamins that help us grow and stay healthy."\n• "Children should eat five servings of fruits and vegetables each day to maintain good health."',
    answer:
      'General: "What we eat affects how our bodies work."\nSpecific: "Fruits and vegetables contain vitamins that help us grow and stay healthy."\nThesis: "Children should eat five servings of fruits and vegetables each day to maintain good health."',
    isCorrect: true,
    explanation:
      'Correct! General is the broadest statement about food and health. Specific narrows to fruits/vegetables and vitamins. Thesis makes a specific argument about what children should do.',
    topic: 'health',
  },
  {
    question:
      'Label these sentences about Technology in Education:\n• "Technology has changed how people learn and communicate."\n• "Computers, tablets, and educational apps are now common tools in many classrooms."\n• "When used properly, technology helps students learn at their own pace and makes lessons more interesting and engaging."',
    answer:
      'General: "Technology has changed how people learn and communicate."\nSpecific: "Computers, tablets, and educational apps are now common tools in many classrooms."\nThesis: "When used properly, technology helps students learn at their own pace and makes lessons more interesting and engaging."',
    isCorrect: true,
    explanation:
      'Correct! The General statement is broad about technology and communication. Specific provides examples of devices. Thesis argues for a benefit with the qualifier "when used properly."',
    topic: 'technology',
  },
  {
    question:
      'Label these sentences about Water Conservation:\n• "Water is one of Earth\'s most precious resources."\n• "Many regions face water shortages due to drought and increasing population."\n• "Simple actions like taking shorter showers and turning off faucets can help save water for future generations."',
    answer:
      'General: "Water is one of Earth\'s most precious resources."\nSpecific: "Many regions face water shortages due to drought and increasing population."\nThesis: "Simple actions like taking shorter showers and turning off faucets can help save water for future generations."',
    isCorrect: true,
    explanation:
      'Correct! General introduces the broad importance of water. Specific narrows to the problem of shortages. Thesis argues for action with specific examples.',
    topic: 'environment',
  },
  {
    question:
      'Label these sentences about Sports and Teamwork:\n• "Many activities help children develop important skills for life."\n• "Soccer, basketball, and baseball require players to work together to achieve their goals."\n• "Playing team sports teaches children valuable life skills like cooperation, communication, and perseverance."',
    answer:
      'General: "Many activities help children develop important skills for life."\nSpecific: "Soccer, basketball, and baseball require players to work together to achieve their goals."\nThesis: "Playing team sports teaches children valuable life skills like cooperation, communication, and perseverance."',
    isCorrect: true,
    explanation:
      'Correct! General is broad about activities and life skills. Specific names particular sports. Thesis makes the argument about what team sports teach.',
    topic: 'sports',
  },
  // Incorrect examples
  {
    question:
      'Label these sentences about School Uniforms:\n• "What students wear to school can impact their education."\n• "Many private schools already require students to wear khaki pants and polo shirts."\n• "Schools should require uniforms because they reduce bullying and help students focus on learning."',
    answer:
      'General: "Schools should require uniforms because they reduce bullying and help students focus on learning."\nSpecific: "Many private schools already require students to wear khaki pants and polo shirts."\nThesis: "What students wear to school can impact their education."',
    isCorrect: false,
    explanation:
      'Incorrect! The labels are swapped. The broad statement about clothing impacting education is the General. The argument about requiring uniforms is the Thesis.',
    topic: 'education',
  },
  {
    question:
      'Label these sentences about Recycling:\n• "Taking care of our planet is everyone\'s responsibility."\n• "Many everyday items like plastic bottles and paper can be recycled instead of thrown away."\n• "Schools should have recycling bins in every classroom to teach students good environmental habits."',
    answer:
      'General: "Taking care of our planet is everyone\'s responsibility."\nSpecific: "Schools should have recycling bins in every classroom to teach students good environmental habits."\nThesis: "Many everyday items like plastic bottles and paper can be recycled instead of thrown away."',
    isCorrect: false,
    explanation:
      'Incorrect! The Specific and Thesis are swapped. The statement about recyclable items is Specific. The argument about putting bins in classrooms is the Thesis.',
    topic: 'environment',
  },
  {
    question:
      'Label these sentences about Space Exploration:\n• "Humans have always been curious about what exists beyond Earth."\n• "NASA and other space agencies send rockets and rovers to explore planets in our solar system."\n• "Space exploration is important because it helps us learn about our universe and may lead to new discoveries that help people on Earth."',
    answer:
      'General: "NASA and other space agencies send rockets and rovers to explore planets in our solar system."\nSpecific: "Humans have always been curious about what exists beyond Earth."\nThesis: "Space exploration is important because it helps us learn about our universe and may lead to new discoveries that help people on Earth."',
    isCorrect: false,
    explanation:
      'Incorrect! General and Specific are swapped. The broad statement about human curiosity is General. The details about NASA and rovers is Specific.',
    topic: 'science',
  },
];

/**
 * @description Review examples for Write G & S from T activity.
 * Students write General and Specific statements to introduce a Thesis.
 */
export const WRITE_GS_FROM_T_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"Tokyo\'s unique blend of old and new makes it a fascinating place to visit."',
    answer:
      'General: "Japan is a country that has many interesting cities and places."\nSpecific: "Tokyo is the capital city of Japan where traditional temples stand next to modern skyscrapers."',
    isCorrect: true,
    explanation:
      'Good G-S-T flow! General introduces Japan broadly, Specific narrows to Tokyo, and the thesis argues why Tokyo is fascinating.',
    topic: 'geography',
  },
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"Dolphins use echolocation to navigate and hunt in the ocean."',
    answer:
      'General: "The ocean contains diverse animals with a wide range of behaviors."\nSpecific: "Dolphins, for example, are intelligent marine mammals that use special sounds to find their way around."',
    isCorrect: true,
    explanation:
      'Excellent! General introduces ocean animals broadly, Specific narrows to dolphins and their sounds, leading naturally to the thesis about echolocation.',
    topic: 'animals',
  },
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"The Roman Empire\'s advanced engineering helped it control vast territories."',
    answer:
      'General: "Long ago, there were many powerful empires."\nSpecific: "Rome was a huge empire that built roads and aqueducts."',
    isCorrect: true,
    explanation:
      'Good structure! General is broad about empires, Specific mentions Rome and its building, connecting well to the thesis about engineering.',
    topic: 'history',
  },
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"The water cycle helps distribute fresh water around the world."',
    answer:
      'General: "Water is everywhere on Earth."\nSpecific: "Water changes from rain to rivers to clouds and back again."',
    isCorrect: true,
    explanation:
      'Simple but effective! General introduces water broadly, Specific describes how water moves, leading to the thesis about distribution.',
    topic: 'science',
  },
  // Incorrect examples
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"Tokyo\'s unique blend of old and new makes it a fascinating place to visit."',
    answer: 'General: "I like ice cream."\nSpecific: "My favorite flavor is chocolate."',
    isCorrect: false,
    explanation:
      'Incorrect! These sentences are completely off-topic. They should be about Tokyo or Japan, not ice cream.',
    topic: 'geography',
  },
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"Dolphins use echolocation to navigate and hunt in the ocean."',
    answer:
      'General: "Dolphins use sound to find their way."\nSpecific: "Dolphins hunt using echolocation."',
    isCorrect: false,
    explanation:
      'Incorrect! Both sentences just repeat information from the thesis. General should be broader, and Specific should provide different context.',
    topic: 'animals',
  },
  {
    question:
      'Write General and Specific statements to introduce this thesis:\n"The Roman Empire\'s advanced engineering helped it control vast territories."',
    answer:
      'General: "Rome had good builders."\nSpecific: "History is full of interesting civilizations."',
    isCorrect: false,
    explanation:
      'Incorrect! The labels are backwards. "History is full of interesting civilizations" is broad (General), while "Rome had good builders" is more specific.',
    topic: 'history',
  },
];

/**
 * @description Review examples for Write Introductory Sentences activity.
 * Students add bridging sentences to complete an introduction.
 */
export const WRITE_INTRODUCTORY_SENTENCES_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Humans have always been curious about space."\nSpecific: "Scientists have developed powerful telescopes and spacecraft to study distant objects."\nThesis: "Space exploration helps us understand our place in the universe and advances technology on Earth."',
    answer:
      'These missions have discovered new planets and taught us about the origins of our solar system.',
    isCorrect: true,
    explanation:
      'Good bridging sentence! It connects the scientific tools (Specific) to meaningful discoveries, supporting the thesis about understanding our place in the universe.',
    topic: 'space',
  },
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Ancient civilizations have shaped modern society."\nSpecific: "Egypt was one of the most advanced civilizations of the ancient world."\nThesis: "Ancient Egyptian innovations in architecture, writing, and government influenced cultures for thousands of years."',
    answer:
      'The Egyptians built massive monuments and developed systems for farming along the Nile River.',
    isCorrect: true,
    explanation:
      'Excellent! This adds specific examples of Egyptian achievements that connect to the thesis about innovations.',
    topic: 'history',
  },
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Good nutrition is essential for health."\nSpecific: "Children need balanced diets to grow properly."\nThesis: "Schools should provide nutritious meals to help students learn and stay healthy."',
    answer:
      'Many students rely on school meals for their main source of nutrition during the day.',
    isCorrect: true,
    explanation:
      'Great connection! This explains WHY schools should be involved, bridging from children\'s needs to the thesis about school meals.',
    topic: 'health',
  },
  // Incorrect examples
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Humans have always been curious about space."\nSpecific: "Scientists have developed powerful telescopes and spacecraft to study distant objects."\nThesis: "Space exploration helps us understand our place in the universe and advances technology on Earth."',
    answer: 'Space is very interesting.',
    isCorrect: false,
    explanation:
      'Too vague! This doesn\'t add any new information or build a connection between the sentences. Be more specific about what makes space exploration valuable.',
    topic: 'space',
  },
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Ancient civilizations have shaped modern society."\nSpecific: "Egypt was one of the most advanced civilizations of the ancient world."\nThesis: "Ancient Egyptian innovations in architecture, writing, and government influenced cultures for thousands of years."',
    answer: 'Egypt was one of the most advanced civilizations.',
    isCorrect: false,
    explanation:
      'This just repeats the Specific sentence! You need to add NEW information that bridges to the thesis.',
    topic: 'history',
  },
  {
    question:
      'Add a sentence to connect these ideas:\nGeneral: "Good nutrition is essential for health."\nSpecific: "Children need balanced diets to grow properly."\nThesis: "Schools should provide nutritious meals to help students learn and stay healthy."',
    answer: 'I like to play soccer on weekends.',
    isCorrect: false,
    explanation:
      'Completely off-topic! The sentence should be about nutrition, children, or school meals - not personal hobbies.',
    topic: 'health',
  },
];

/**
 * @description Review examples for Craft Conclusion from GST activity.
 * Students write conclusion paragraphs in T-S-G (reverse) order.
 */
export const CRAFT_CONCLUSION_FROM_GST_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Throughout history, humans have faced countless challenges."\nSpecific: "From building the first tools to developing complex technologies, people have always found creative ways to overcome obstacles."\nThesis: "Having a problem-solving mindset helps us turn difficulties into opportunities for growth."',
    answer:
      'Thesis (rephrased): "A problem-solving attitude lets us change problems into chances to grow."\nSpecific (rephrased): "People keep finding new ways to solve problems, from easy fixes to hard inventions."\nGeneral (rephrased): "This way of thinking will help us in the future."',
    isCorrect: true,
    explanation:
      'Excellent! The conclusion follows T-S-G order (reverse of intro) and rephrases the ideas without copying them exactly.',
    topic: 'life-skills',
  },
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Water is essential for all life on Earth."\nSpecific: "Through evaporation, condensation, and precipitation, water continuously moves between oceans, atmosphere, and land."\nThesis: "The water cycle ensures that fresh water is constantly renewed and distributed across our planet."',
    answer:
      'Thesis (rephrased): "The water cycle keeps giving us fresh water all over Earth."\nSpecific (rephrased): "Water goes up as vapor, makes clouds, and comes down as rain over and over."\nGeneral (rephrased): "Life needs the water cycle to survive."',
    isCorrect: true,
    explanation:
      'Good structure! Uses simpler words to rephrase the ideas while maintaining T-S-G order.',
    topic: 'science',
  },
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Good nutrition is important for everyone."\nSpecific: "Eating fruits, vegetables, whole grains, and lean proteins gives our bodies the nutrients they need."\nThesis: "A balanced diet helps children grow strong and stay healthy."',
    answer:
      'Thesis (rephrased): "Good food helps kids be healthy and strong."\nSpecific (rephrased): "Fruits, veggies, grains, and meat give us what we need."\nGeneral (rephrased): "Eating right is important."',
    isCorrect: true,
    explanation:
      'Simple but correct! Rephrases each part and maintains the T-S-G order for conclusions.',
    topic: 'health',
  },
  // Incorrect examples
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Throughout history, humans have faced countless challenges."\nSpecific: "From building the first tools to developing complex technologies, people have always found creative ways to overcome obstacles."\nThesis: "Having a problem-solving mindset helps us turn difficulties into opportunities for growth."',
    answer:
      'Thesis: "Having a problem-solving mindset helps us turn difficulties into opportunities for growth."\nSpecific: "From building the first tools to developing complex technologies, people have always found creative ways to overcome obstacles."\nGeneral: "Throughout history, humans have faced countless challenges."',
    isCorrect: false,
    explanation:
      'Just copied the introduction exactly! You need to REPHRASE each sentence in your own words, not copy them.',
    topic: 'life-skills',
  },
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Water is essential for all life on Earth."\nSpecific: "Through evaporation, condensation, and precipitation, water continuously moves between oceans, atmosphere, and land."\nThesis: "The water cycle ensures that fresh water is constantly renewed and distributed across our planet."',
    answer:
      'General: "Water is important for everything."\nSpecific: "Rain, clouds, and oceans all work together."\nThesis: "The water cycle gives us fresh water."',
    isCorrect: false,
    explanation:
      'Wrong order! Conclusions should be T-S-G (Thesis first, then Specific, then General), not G-S-T like introductions.',
    topic: 'science',
  },
  {
    question:
      'Write a conclusion for this introduction:\nGeneral: "Ancient civilizations have left lasting marks on human history."\nSpecific: "The Egyptians built massive pyramids, developed hieroglyphic writing, and created advanced irrigation systems."\nThesis: "Ancient Egypt\'s innovations in architecture, writing, and agriculture shaped the development of future civilizations."',
    answer:
      'Thesis: "Egyptian mummies are very interesting to study."\nSpecific: "King Tut was a famous pharaoh who died young."\nGeneral: "Museums have lots of Egyptian artifacts."',
    isCorrect: false,
    explanation:
      'These are completely NEW ideas, not rephrased versions of the introduction! Your conclusion should echo the intro ideas in different words.',
    topic: 'history',
  },
];

/**
 * @description Review examples for Write T from Topic activity.
 * Students write thesis statements from a given topic.
 */
export const WRITE_T_FROM_TOPIC_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Write a thesis statement for this topic:\nTopic: School uniforms\nBackground: Many schools require students to wear uniforms. Some people think uniforms help students focus on learning, while others believe students should express themselves through clothing.',
    answer: 'Schools should require uniforms because they help students focus on learning.',
    isCorrect: true,
    explanation:
      'Strong thesis! Takes a clear position (should require) and gives a reason (helps focus on learning).',
    topic: 'education',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Pets\nBackground: Pets can be wonderful companions. Dogs, cats, birds, and fish are popular choices. Having a pet requires responsibility and care.',
    answer: 'Every family should have a pet because pets teach children responsibility.',
    isCorrect: true,
    explanation:
      'Good thesis! Makes a claim (families should have pets) and explains why (teaches responsibility).',
    topic: 'animals',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Video games\nBackground: Video games are popular entertainment for many children and adults. Some games are educational, while others are just for fun.',
    answer: 'Video games can be good for kids if they play the right kinds.',
    isCorrect: true,
    explanation:
      'Clear thesis with a qualified position. It acknowledges that not all games are equal.',
    topic: 'technology',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Recess\nBackground: Recess is a break time during the school day when students can play outside. Some schools have reduced recess time to add more academic instruction.',
    answer: 'Schools need longer recess because kids need time to play and exercise.',
    isCorrect: true,
    explanation:
      'Effective thesis! Takes a position (longer recess needed) and provides reasoning (play and exercise).',
    topic: 'education',
  },
  // Incorrect examples
  {
    question:
      'Write a thesis statement for this topic:\nTopic: School uniforms\nBackground: Many schools require students to wear uniforms. Some people think uniforms help students focus on learning, while others believe students should express themselves through clothing.',
    answer: 'Pizza is my favorite food.',
    isCorrect: false,
    explanation: 'Completely off-topic! Your thesis must be about school uniforms, not pizza.',
    topic: 'education',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Homework\nBackground: Students often have homework after school. Some students find it helpful for learning, while others feel it takes too much time away from other activities.',
    answer: 'Should students have homework?',
    isCorrect: false,
    explanation:
      'This is a question, not a thesis statement! A thesis should be a declarative sentence that makes a claim.',
    topic: 'education',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Video games\nBackground: Video games are popular entertainment for many children and adults. Some games are educational, while others are just for fun.',
    answer: 'Video games exist.',
    isCorrect: false,
    explanation:
      'This is just a fact, not a thesis! A thesis should make an argument or take a position that can be supported.',
    topic: 'technology',
  },
  {
    question:
      'Write a thesis statement for this topic:\nTopic: Space exploration\nBackground: Humans have been exploring space since the 1960s. We have sent people to the moon and robots to Mars. Space exploration is expensive but teaches us about our universe.',
    answer: 'Humans have been exploring space since the 1960s.',
    isCorrect: false,
    explanation:
      'This just copies the background information! A thesis should make your OWN argument about the topic.',
    topic: 'space',
  },
];

/**
 * @description Review examples for Match Details Pro/Con activity.
 * Students categorize supporting details as pro (for) or con (against) arguments.
 */
export const MATCH_DETAILS_PRO_CON_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question:
      'Sort these details about whether schools should have longer recess:\n1. "Exercise helps students focus better in class."\n2. "Playing with friends reduces stress and anxiety."\n3. "More recess means less time for important subjects."\n4. "Some students get hurt during playground activities."\n5. "Active kids are healthier and miss fewer school days."\n6. "Teachers need more time to cover required curriculum."',
    answer:
      'PRO (Schools should have longer recess):\n• Exercise helps students focus better in class.\n• Playing with friends reduces stress and anxiety.\n• Active kids are healthier and miss fewer school days.\n\nCON (Schools should NOT have longer recess):\n• More recess means less time for important subjects.\n• Some students get hurt during playground activities.\n• Teachers need more time to cover required curriculum.',
    isCorrect: true,
    explanation:
      'Perfect! Pro arguments support longer recess (focus, stress relief, health). Con arguments argue against it (lost time, injuries, curriculum).',
    topic: 'education',
  },
  {
    question:
      'Sort these details about whether students should wear school uniforms:\n1. "Uniforms reduce bullying about clothing choices."\n2. "Kids need to express their personal style."\n3. "Morning routines are faster without outfit decisions."\n4. "Uniforms can be uncomfortable in some weather."\n5. "Uniforms cost less than trendy clothes."\n6. "Buying uniforms is an extra expense for families."',
    answer:
      'PRO (Students should wear uniforms):\n• Uniforms reduce bullying about clothing choices.\n• Morning routines are faster without outfit decisions.\n• Uniforms cost less than trendy clothes.\n\nCON (Students should NOT wear uniforms):\n• Kids need to express their personal style.\n• Uniforms can be uncomfortable in some weather.\n• Buying uniforms is an extra expense for families.',
    isCorrect: true,
    explanation:
      'Correct! Pro arguments support uniforms (less bullying, faster mornings, cheaper). Con arguments oppose them (no expression, uncomfortable, extra cost).',
    topic: 'education',
  },
  {
    question:
      'Sort these details about whether kids should have cell phones:\n1. "Parents can contact children in emergencies."\n2. "Phones distract from schoolwork and social skills."\n3. "Educational apps help with learning."\n4. "Screen time can harm developing eyes."\n5. "GPS tracking provides peace of mind."\n6. "Cyberbullying is a serious problem."',
    answer:
      'PRO (Kids should have cell phones):\n• Parents can contact children in emergencies.\n• Educational apps help with learning.\n• GPS tracking provides peace of mind.\n\nCON (Kids should NOT have cell phones):\n• Phones distract from schoolwork and social skills.\n• Screen time can harm developing eyes.\n• Cyberbullying is a serious problem.',
    isCorrect: true,
    explanation:
      'Well sorted! Pro arguments support phones (safety, learning, tracking). Con arguments oppose them (distraction, health, bullying).',
    topic: 'technology',
  },
  // Incorrect examples
  {
    question:
      'Sort these details about whether schools should have longer recess:\n1. "Exercise helps students focus better in class."\n2. "Playing with friends reduces stress and anxiety."\n3. "More recess means less time for important subjects."\n4. "Some students get hurt during playground activities."\n5. "Active kids are healthier and miss fewer school days."\n6. "Teachers need more time to cover required curriculum."',
    answer:
      'PRO:\n• More recess means less time for important subjects.\n• Some students get hurt during playground activities.\n• Teachers need more time to cover required curriculum.\n\nCON:\n• Exercise helps students focus better in class.\n• Playing with friends reduces stress and anxiety.\n• Active kids are healthier and miss fewer school days.',
    isCorrect: false,
    explanation:
      'Completely backwards! The PRO and CON categories are swapped. Arguments about focus, stress relief, and health SUPPORT longer recess.',
    topic: 'education',
  },
  {
    question:
      'Sort these details about whether homework should be banned:\n1. "Students need time to relax and play after school."\n2. "Too much homework causes stress and anxiety."\n3. "Practice at home helps students remember lessons."\n4. "Homework teaches responsibility and time management."\n5. "Family time is more valuable than extra worksheets."\n6. "Parents can see what children are learning."',
    answer:
      'PRO:\n• Students need time to relax and play after school.\n• Too much homework causes stress and anxiety.\n• Practice at home helps students remember lessons.\n\nCON:\n• Family time is more valuable than extra worksheets.\n• Homework teaches responsibility and time management.\n• Parents can see what children are learning.',
    isCorrect: false,
    explanation:
      'Mixed up! "Practice at home helps students remember lessons" is a CON argument (against banning). "Family time is more valuable" is a PRO argument (for banning).',
    topic: 'education',
  },
  {
    question:
      'Sort these details about whether kids should have cell phones:\n1. "Parents can contact children in emergencies."\n2. "Phones distract from schoolwork and social skills."\n3. "Educational apps help with learning."\n4. "Screen time can harm developing eyes."\n5. "GPS tracking provides peace of mind."\n6. "Cyberbullying is a serious problem."',
    answer:
      'PRO:\n• Parents can contact children in emergencies.\n• Screen time can harm developing eyes.\n• Cyberbullying is a serious problem.\n\nCON:\n• Educational apps help with learning.\n• GPS tracking provides peace of mind.\n• Phones distract from schoolwork and social skills.',
    isCorrect: false,
    explanation:
      'Several are swapped! Health concerns (screen time) and cyberbullying are CON arguments. Educational apps and GPS tracking are PRO arguments.',
    topic: 'technology',
  },
];

/**
 * @description Map of essay lesson IDs to their review examples.
 */
export const ESSAY_EXAMPLES: Record<string, ReviewExample[]> = {
  'distinguish-g-s-t': DISTINGUISH_GST_EXAMPLES,
  'write-g-s-from-t': WRITE_GS_FROM_T_EXAMPLES,
  'write-introductory-sentences': WRITE_INTRODUCTORY_SENTENCES_EXAMPLES,
  'craft-conclusion-from-gst': CRAFT_CONCLUSION_FROM_GST_EXAMPLES,
  'write-t-from-topic': WRITE_T_FROM_TOPIC_EXAMPLES,
  'match-details-pro-con': MATCH_DETAILS_PRO_CON_EXAMPLES,
};
