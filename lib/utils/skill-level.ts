/**
 * Skill level utilities
 * Maps player ranks to skill levels and grade levels for AI generation
 */

export type SkillLevel = 'beginner' | 'intermediate' | 'proficient' | 'advanced' | 'expert' | 'master';

/**
 * Get skill level from rank string
 */
export function getSkillLevelFromRank(rank: string): SkillLevel {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  if (rank.includes('Diamond')) return 'expert';
  if (rank.includes('Master') || rank.includes('Grand')) return 'master';
  return 'intermediate';
}

/**
 * Get grade level from rank string
 */
export function getGradeLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return '6th';
  if (rank.includes('Silver')) return '7th-8th';
  if (rank.includes('Gold')) return '9th-10th';
  if (rank.includes('Platinum')) return '11th';
  if (rank.includes('Diamond')) return '12th';
  if (rank.includes('Master') || rank.includes('Grand')) return '12th';
  return '7th-8th';
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

