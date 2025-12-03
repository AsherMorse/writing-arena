/**
 * Skill level utilities
 * Maps player ranks to skill levels and grade levels for AI generation
 */

export type SkillLevel = 'beginner' | 'intermediate' | 'proficient' | 'advanced' | 'expert' | 'master';

/**
 * Get skill level from rank string
 */
export function getSkillLevelFromRank(rank: string | number | unknown): SkillLevel {
  const rankStr = String(rank ?? 'Silver III');
  if (rankStr.includes('Bronze')) return 'beginner';
  if (rankStr.includes('Silver')) return 'intermediate';
  if (rankStr.includes('Gold')) return 'proficient';
  if (rankStr.includes('Platinum')) return 'advanced';
  if (rankStr.includes('Diamond')) return 'expert';
  if (rankStr.includes('Master') || rankStr.includes('Grand')) return 'master';
  return 'intermediate';
}

/**
 * Get grade level from rank string
 * Supports grades 3rd-12th
 */
export function getGradeLevelFromRank(rank: string | number | unknown): string {
  const rankStr = String(rank ?? 'Silver III');
  if (rankStr.includes('Bronze I') || rankStr.includes('Bronze II')) return '3rd-4th';
  if (rankStr.includes('Bronze III')) return '5th';
  if (rankStr.includes('Bronze')) return '6th';
  if (rankStr.includes('Silver I') || rankStr.includes('Silver II')) return '7th';
  if (rankStr.includes('Silver III')) return '8th';
  if (rankStr.includes('Silver')) return '7th-8th';
  if (rankStr.includes('Gold I') || rankStr.includes('Gold II')) return '9th';
  if (rankStr.includes('Gold III')) return '10th';
  if (rankStr.includes('Gold')) return '9th-10th';
  if (rankStr.includes('Platinum')) return '11th';
  if (rankStr.includes('Diamond')) return '12th';
  if (rankStr.includes('Master') || rankStr.includes('Grand')) return '12th';
  return '7th-8th';
}

/**
 * Get approximate grade level number for age-appropriate instruction
 * Returns a number between 3-12
 */
export function getGradeLevelNumber(rank: string | number | unknown): number {
  const gradeLevel = getGradeLevelFromRank(rank);
  
  // Extract number from grade level string
  if (gradeLevel.includes('3rd')) return 3;
  if (gradeLevel.includes('4th')) return 4;
  if (gradeLevel.includes('5th')) return 5;
  if (gradeLevel.includes('6th')) return 6;
  if (gradeLevel.includes('7th')) return 7;
  if (gradeLevel.includes('8th')) return 8;
  if (gradeLevel.includes('9th')) return 9;
  if (gradeLevel.includes('10th')) return 10;
  if (gradeLevel.includes('11th')) return 11;
  if (gradeLevel.includes('12th')) return 12;
  
  // Handle ranges - take the lower bound
  if (gradeLevel.includes('7th-8th')) return 7;
  if (gradeLevel.includes('9th-10th')) return 9;
  if (gradeLevel.includes('3rd-4th')) return 3;
  
  return 7; // Default to 7th grade
}

/**
 * Get skill characteristics for AI writing generation
 */
export function getSkillCharacteristics(skillLevel: SkillLevel): string {
  const characteristics: Record<SkillLevel, string> = {
    beginner: `- Simple, short sentences (mostly subject-verb-object)
- Basic 6th grade vocabulary with repetition
- Include 3-4 spelling errors (common words misspelled: "teh", "becuase", "thier", "alot")
- Include 2-3 grammar mistakes (run-ons, fragments, tense shifts, subject-verb agreement)
- Missing or incorrect punctuation (missing commas, periods, apostrophes)
- Ideas present but brief and underdeveloped
- Minimal or no transitions
- 40-60 words total (2-minute rush)
- 1-2 short paragraphs only`,
    
    intermediate: `- Mix of simple and compound sentences
- 7th-8th grade vocabulary with some variety
- Include 1-2 spelling/typo errors (realistic typos: "teh", "recieve", "definately", "alot")
- Include 1-2 grammar mistakes (comma splices, occasional tense inconsistency, missing apostrophes)
- Generally correct punctuation but may miss a comma or two
- Clear main ideas with some supporting details
- Some basic transitions (First, Then, Also)
- 50-70 words total (2-minute rush)
- 2-3 short paragraphs`,
    
    proficient: `- Mix of simple, compound, and some complex sentences
- 9th-10th grade vocabulary with good variety
- Maybe 1 minor typo (realistic fast-typing error like "teh")
- Mostly error-free grammar (at most 1 small mistake)
- Well-developed ideas with some specific details
- Effective transitions between ideas
- Clear organization
- 60-80 words total (2-minute rush)
- 2-3 paragraphs`,
    
    advanced: `- Complex and varied sentence structures
- 11th grade vocabulary used appropriately
- Error-free grammar and mechanics
- Detailed, well-supported ideas
- Smooth transitions and flow
- Strong organization
- 70-85 words total (2-minute rush)
- 3 paragraphs`,
    
    expert: `- Sophisticated and varied syntax
- 12th grade vocabulary with precise word choice
- Flawless mechanics
- Deeply developed ideas with nuance
- Seamless transitions
- Compelling organization
- Effective rhetorical devices
- 75-90 words total (2-minute rush)
- 3-4 paragraphs`,
    
    master: `- Masterful sentence variety and rhythm
- College-level vocabulary
- Perfect command of language
- Profound and insightful ideas
- Elegant transitions
- Exceptional organization
- Sophisticated literary techniques
- Distinctive voice
- 80-100 words total (2-minute rush)
- 3-4 paragraphs`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

/**
 * Get feedback characteristics for AI peer feedback generation
 */
export function getFeedbackCharacteristics(skillLevel: SkillLevel): string {
  const characteristics: Record<SkillLevel, string> = {
    beginner: `- Simple, general observations
- Basic language ("good", "nice", "cool")
- May miss some details
- Feedback is encouraging but not very specific`,
    
    intermediate: `- More specific observations
- References some specific parts of the writing
- Constructive suggestions
- Uses some writing vocabulary`,
    
    proficient: `- Detailed, specific feedback
- References exact sentences or phrases
- Actionable suggestions for improvement
- Uses writing terminology appropriately`,
    
    advanced: `- Sophisticated analysis
- Identifies literary techniques
- Highly specific, actionable feedback
- References Writing Revolution strategies`,
    
    expert: `- Expert-level analysis
- Identifies nuanced writing techniques
- Highly specific, actionable feedback
- References advanced Writing Revolution strategies`,
    
    master: `- Masterful analysis
- Identifies sophisticated writing techniques
- Highly specific, actionable feedback
- References advanced Writing Revolution strategies`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

/**
 * Get revision characteristics for AI revision generation
 */
export function getRevisionCharacteristics(skillLevel: SkillLevel): string {
  const characteristics: Record<SkillLevel, string> = {
    beginner: `- Add a few more details where suggested
- Fix obvious grammar errors
- Maybe add 1-2 more sentences
- Improvements are modest but present
- Some feedback points may be missed`,
    
    intermediate: `- Address several feedback points
- Add more descriptive details
- Improve some sentence structures
- Add transitions where suggested
- Noticeable improvement while staying at level`,
    
    proficient: `- Address most feedback points thoughtfully
- Add sophisticated details and descriptions
- Improve sentence variety meaningfully
- Enhance organization and flow
- Clear, substantial improvement`,
    
    advanced: `- Address all major feedback points
- Add nuanced details and imagery
- Demonstrate strong command of writing techniques
- Polish sentence structures elegantly
- Significant, sophisticated improvement`,
    
    expert: `- Address all feedback points masterfully
- Add sophisticated details and imagery
- Demonstrate expert command of writing techniques
- Polish sentence structures elegantly
- Exceptional improvement`,
    
    master: `- Address all feedback points with mastery
- Add masterful details and imagery
- Demonstrate masterful command of writing techniques
- Polish sentence structures with artistry
- Exceptional, sophisticated improvement`,
  };
  
  return characteristics[skillLevel] || characteristics.intermediate;
}

