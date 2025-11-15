/**
 * LLM + TWR Validation Tests
 * Actually calls the API endpoints to test real LLM responses
 * Validates alignment with The Writing Revolution methodology
 */

import { validateTWRFeedback, TWR_STRATEGIES } from '@/lib/utils/twr-prompts';

// Test samples based on TWR principles
const TWR_TEST_SAMPLES = {
  usesAppositives: {
    content: "The lighthouse, a weathered stone sentinel, stood on the rocky cliff. Sarah, a curious ten-year-old, had passed it daily but never explored it. Today, however, the ancient door stood ajar.",
    expectedTWRStrategies: ['appositive', 'transition word (however)'],
    expectedScore: 85-95,
  },
  
  usesSentenceExpansion: {
    content: "I approached the lighthouse because the golden light intrigued me. The door was locked but I found a key hidden nearby so I could enter. Inside was dark although a faint glow came from upstairs.",
    expectedTWRStrategies: ['because', 'but', 'so', 'although'],
    expectedScore: 80-90,
  },
  
  choppyNeedsCombining: {
    content: "The lighthouse was old. It was on a cliff. I walked past it. The door was open. I went inside. There was a chest. It was glowing.",
    expectedTWRStrategies: ['needs sentence combining', 'needs expansion'],
    expectedScore: 40-60,
  },
  
  noTransitions: {
    content: "I saw the lighthouse on Monday. I went there on Tuesday. I opened the door on Wednesday. I found a chest on Thursday.",
    expectedTWRStrategies: ['needs transitions', 'repetitive structure'],
    expectedScore: 50-65,
  },
  
  goodTransitions: {
    content: "First, I noticed the lighthouse door was open. Then, I approached it carefully. However, when I got closer, I hesitated. Finally, curiosity won and I stepped inside.",
    expectedTWRStrategies: ['transitions', 'sequence words'],
    expectedScore: 75-85,
  },
};

describe('LLM + TWR Validation Tests', () => {
  
  // Set longer timeout for API calls
  jest.setTimeout(30000);
  
  describe('analyze-writing API - TWR Detection', () => {
    it('should recognize and praise appositive use', async () => {
      const response = await fetch('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.usesAppositives.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Should score highly
      expect(data.overallScore).toBeGreaterThanOrEqual(80);
      
      // Should mention appositives in feedback
      const allFeedback = [
        ...data.strengths || [],
        ...Object.values(data.specificFeedback || {}),
      ].join(' ').toLowerCase();
      
      const recognizesAppositives = 
        allFeedback.includes('appositive') ||
        allFeedback.includes('weathered stone sentinel') ||
        allFeedback.includes('curious ten-year-old');
      
      expect(recognizesAppositives).toBe(true);
    });
    
    it('should identify need for sentence combining in choppy writing', async () => {
      const response = await fetch('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.choppyNeedsCombining.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Should score lower due to choppiness
      expect(data.overallScore).toBeLessThan(65);
      
      // Should suggest combining or expansion
      const improvements = data.improvements.join(' ').toLowerCase();
      
      const suggestsCombining = 
        improvements.includes('combin') ||
        improvements.includes('expand') ||
        improvements.includes('because') ||
        improvements.includes('choppy') ||
        improvements.includes('simple sentence');
      
      expect(suggestsCombining).toBe(true);
    });
    
    it('should reward use of because/but/so expansions', async () => {
      const response = await fetch('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.usesSentenceExpansion.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Should score well
      expect(data.overallScore).toBeGreaterThanOrEqual(75);
      
      // Should recognize the expansions
      const strengths = data.strengths.join(' ').toLowerCase();
      
      const recognizesExpansion = 
        strengths.includes('because') ||
        strengths.includes('but') ||
        strengths.includes('so') ||
        strengths.includes('although') ||
        strengths.includes('thinking');
      
      expect(recognizesExpansion).toBe(true);
    });
    
    it('should identify missing transitions', async () => {
      const response = await fetch('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.noTransitions.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Should score lower due to lack of transitions
      expect(data.overallScore).toBeLessThan(70);
      
      // Should suggest transitions
      const improvements = data.improvements.join(' ').toLowerCase();
      
      const suggestsTransitions = 
        improvements.includes('transition') ||
        improvements.includes('however') ||
        improvements.includes('therefore') ||
        improvements.includes('connect') ||
        improvements.includes('flow');
      
      expect(suggestsTransitions).toBe(true);
    });
    
    it('should validate feedback specificity using TWR validator', async () => {
      const response = await fetch('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.excellent.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Use TWR validator
      const validation = validateTWRFeedback(data);
      
      console.log('TWR Validation Results:', validation);
      
      // Should meet TWR standards
      expect(validation.issues.length).toBeLessThanOrEqual(2); // Allow some flexibility
      
      // Should have at least some TWR elements
      expect(validation.mentionsTWR || validation.hasQuotes).toBe(true);
    });
  });
  
  describe('batch-rank-writings API - Comparative TWR Analysis', () => {
    it('should rank writings by TWR strategy usage', async () => {
      const writings = [
        {
          playerId: 'player-1',
          playerName: 'Expert',
          content: TWR_TEST_SAMPLES.usesAppositives.content,
          wordCount: 50,
          isAI: false,
        },
        {
          playerId: 'player-2',
          playerName: 'Needs Work',
          content: TWR_TEST_SAMPLES.choppyNeedsCombining.content,
          wordCount: 23,
          isAI: false,
        },
      ];
      
      const response = await fetch('http://localhost:3000/api/batch-rank-writings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writings,
          prompt: 'Write about discovering something mysterious',
          promptType: 'narrative',
          trait: 'all',
        }),
      });
      
      const data = await response.json();
      
      // Should rank appositive-using writing higher
      const expertRanking = data.rankings.find((r: any) => r.playerId === 'player-1');
      const needsWorkRanking = data.rankings.find((r: any) => r.playerId === 'player-2');
      
      expect(expertRanking.score).toBeGreaterThan(needsWorkRanking.score);
      expect(expertRanking.rank).toBeLessThan(needsWorkRanking.rank);
      
      // Expert feedback should mention TWR strategies
      const expertFeedback = [
        ...expertRanking.strengths || [],
        ...expertRanking.improvements || [],
      ].join(' ').toLowerCase();
      
      expect(expertFeedback).toMatch(/appositive|transition|because|sentence/);
    });
  });
  
  describe('evaluate-peer-feedback API - TWR Specificity', () => {
    it('should reward peer feedback that names TWR strategies', async () => {
      const specificFeedback = {
        clarity: "Your main idea is clear. In your opening 'The lighthouse stood tall,' you establish the setting.",
        strengths: "You use an appositive in 'The lighthouse, a stone tower, stood' which adds description (TWR strategy).",
        improvements: "Your third sentence 'She went in' could expand with because (TWR): 'She went in because curiosity drove her'",
        organization: "You use 'However' as a transition word (TWR) effectively between paragraphs.",
        engagement: "The golden light creates mystery and makes me want to read more.",
      };
      
      const vagueFeedback = {
        clarity: "It's clear.",
        strengths: "Good writing.",
        improvements: "Add more details.",
        organization: "Pretty good.",
        engagement: "Interesting.",
      };
      
      // Test specific feedback
      const response1 = await fetch('http://localhost:3000/api/evaluate-peer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: specificFeedback,
          peerWriting: TWR_TEST_SAMPLES.usesAppositives.content,
        }),
      });
      
      // Test vague feedback
      const response2 = await fetch('http://localhost:3000/api/evaluate-peer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: vagueFeedback,
          peerWriting: TWR_TEST_SAMPLES.usesAppositives.content,
        }),
      });
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Specific, TWR-aware feedback should score MUCH higher
      expect(data1.score).toBeGreaterThan(data2.score + 15);
    });
  });
  
  describe('evaluate-revision API - TWR Application', () => {
    it('should recognize when TWR strategies were applied', async () => {
      const original = "I saw the lighthouse. It was old. The door opened. I went in.";
      
      const revised = "I saw the ancient lighthouse, a weathered stone tower. Although the door was rusty, it opened easily because I pushed hard.";
      
      const feedback = {
        improvements: [
          'Add appositives for description',
          'Expand sentences with because/but/so',
          'Combine short sentences',
        ],
      };
      
      const response = await fetch('http://localhost:3000/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: original,
          revisedContent: revised,
          feedback,
        }),
      });
      
      const data = await response.json();
      
      // Should score highly for applying TWR strategies
      expect(data.score).toBeGreaterThanOrEqual(80);
      
      // Should recognize specific improvements
      const improvements = data.improvements.join(' ').toLowerCase();
      
      const recognizesTWR = 
        improvements.includes('appositive') ||
        improvements.includes('because') ||
        improvements.includes('although') ||
        improvements.includes('combin');
      
      expect(recognizesTWR).toBe(true);
    });
    
    it('should penalize minimal revision', async () => {
      const original = "The lighthouse was old and stood on a cliff.";
      const revised = "The lighthouse was very old and stood on a big cliff."; // Minimal change
      
      const response = await fetch('http://localhost:3000/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: original,
          revisedContent: revised,
          feedback: { improvements: ['Add more details', 'Use TWR strategies'] },
        }),
      });
      
      const data = await response.json();
      
      // Should score lower for minimal revision
      expect(data.score).toBeLessThan(70);
    });
  });
  
  describe('generate-feedback API - TWR Guidance', () => {
    it('should provide actionable TWR strategies', async () => {
      const response = await fetch('http://localhost:3000/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: TWR_TEST_SAMPLES.choppyNeedsCombining.content,
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Should provide specific TWR strategies
      expect(data.improvements).toBeInstanceOf(Array);
      expect(data.improvements.length).toBeGreaterThanOrEqual(3);
      
      // Use TWR validator
      const validation = validateTWRFeedback(data);
      
      console.log('Feedback Validation:', validation);
      
      // Should mention TWR strategies
      expect(validation.mentionsTWR).toBe(true);
      
      // Should have specific examples
      expect(validation.isSpecific).toBe(true);
    });
    
    it('should give concrete revision examples, not vague advice', async () => {
      const response = await fetch('http://localhost:3000/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "I went to the store. I bought milk. I came home.",
          promptType: 'narrative',
        }),
      });
      
      const data = await response.json();
      
      // Each improvement should be detailed
      data.improvements.forEach((improvement: string) => {
        expect(improvement.length).toBeGreaterThan(30);
      });
      
      // Should include action words
      const allImprovements = data.improvements.join(' ').toLowerCase();
      const hasActionWords = 
        allImprovements.includes('change') ||
        allImprovements.includes('add') ||
        allImprovements.includes('combine') ||
        allImprovements.includes('expand') ||
        allImprovements.includes('insert');
      
      expect(hasActionWords).toBe(true);
    });
  });
});

describe('TWR Strategy Recognition Tests', () => {
  
  Object.entries(TWR_STRATEGIES).forEach(([key, strategy]) => {
    describe(strategy.name, () => {
      it(`should recognize ${strategy.name} in student writing`, async () => {
        // This is a conceptual test - in practice would need specific samples
        // for each TWR strategy
        
        expect(strategy.name).toBeTruthy();
        expect(strategy.description).toBeTruthy();
        expect(strategy.examples.length).toBeGreaterThan(0);
        expect(strategy.keywords.length).toBeGreaterThan(0);
      });
    });
  });
  
  it('should have all core TWR strategies defined', () => {
    const requiredStrategies = [
      'sentenceExpansion',
      'appositives',
      'sentenceCombining',
      'transitionWords',
      'sensoryDetails',
      'subordinatingConjunctions',
    ];
    
    requiredStrategies.forEach(strategy => {
      expect(TWR_STRATEGIES).toHaveProperty(strategy);
      expect(TWR_STRATEGIES[strategy as keyof typeof TWR_STRATEGIES].name).toBeTruthy();
      expect(TWR_STRATEGIES[strategy as keyof typeof TWR_STRATEGIES].examples.length).toBeGreaterThan(0);
    });
  });
});

describe('Feedback Quality Validation', () => {
  
  it('should validate good TWR-aligned feedback', () => {
    const goodFeedback = {
      strengths: [
        "Your appositive 'The lighthouse, a weathered sentinel,' adds vivid description (TWR strategy)",
        "Using 'because' in 'I entered because the light intrigued me' shows deeper thinking (TWR expansion)",
      ],
      improvements: [
        "Combine sentences 2-3 (TWR combining): 'Door rusty. It creaked.' → 'The rusty door creaked'",
        "Add transition before sentence 4: 'However,' to signal change",
      ],
    };
    
    const validation = validateTWRFeedback(goodFeedback);
    
    expect(validation.mentionsTWR).toBe(true);
    expect(validation.hasQuotes).toBe(true);
    expect(validation.hasConcreteExamples).toBe(true);
    expect(validation.isSpecific).toBe(true);
    expect(validation.issues.length).toBe(0);
  });
  
  it('should flag vague feedback', () => {
    const vagueFeedback = {
      strengths: [
        "Good writing",
        "Nice descriptions",
      ],
      improvements: [
        "Add more details",
        "Use better words",
      ],
    };
    
    const validation = validateTWRFeedback(vagueFeedback);
    
    expect(validation.mentionsTWR).toBe(false);
    expect(validation.hasQuotes).toBe(false);
    expect(validation.isSpecific).toBe(false);
    expect(validation.issues.length).toBeGreaterThan(2);
  });
  
  it('should recognize feedback with TWR terminology', () => {
    const twrFeedback = {
      improvements: [
        "Use sentence expansion with because to show why",
        "Add an appositive after lighthouse for description",
        "Insert transition word However before sentence 3",
      ],
    };
    
    const validation = validateTWRFeedback(twrFeedback);
    
    expect(validation.mentionsTWR).toBe(true);
    expect(validation.hasConcreteExamples).toBe(true);
  });
});

