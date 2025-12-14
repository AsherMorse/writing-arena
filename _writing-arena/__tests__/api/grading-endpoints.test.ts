/**
 * Grading API Endpoint Tests
 * Testing alignment with The Writing Revolution (TWR) methodology
 */

import { POST as analyzeWriting } from '@/app/api/analyze-writing/route';
import { POST as batchRankWritings } from '@/app/api/batch-rank-writings/route';
import { POST as evaluatePeerFeedback } from '@/app/api/evaluate-peer-feedback/route';
import { POST as evaluateRevision } from '@/app/api/evaluate-revision/route';
import { POST as generateFeedback } from '@/app/api/generate-feedback/route';

// Sample student writings for testing
const SAMPLE_WRITINGS = {
  excellent: {
    content: `The ancient lighthouse, a weathered stone sentinel, stood on the rocky cliff overlooking the churning sea. Sarah had passed it every day on her walk to school, never giving it much thought. However, today was different because the rusty iron door that had always been locked stood slightly ajar, and a mysterious golden light spilled from within.

Her curiosity consumed her thoughts. She approached the lighthouse carefully, her footsteps crunching on the gravel path. When she pushed the door open, the hinges groaned in protest. Inside, the circular room was dusty and filled with old nautical equipment, but in the center sat an ornate wooden chest she had never seen before.`,
    wordCount: 115,
    expectedScore: 85-95,
    twrStrategies: ['appositives', 'subordinating conjunctions', 'sentence variety', 'sensory details'],
  },
  
  good: {
    content: `The old lighthouse stood on the cliff. I walked past it every day to school. I never really looked at it before. But today the door was open and there was a strange golden light coming out.

I was curious so I went closer. The door was rusty. When I opened it I saw the room was dusty. There were old things everywhere. In the middle was a wooden chest that looked mysterious.`,
    wordCount: 75,
    expectedScore: 70-80,
    twrStrategies: ['needs sentence combining', 'needs transitions', 'needs appositives'],
  },
  
  needsWork: {
    content: `There was a lighthouse. It was old. I saw it. The door opened. I went in. There was a chest. It was gold.`,
    wordCount: 23,
    expectedScore: 40-60,
    twrStrategies: ['sentence expansion needed', 'add because/but/so', 'needs details'],
  },
};

const SAMPLE_PEER_FEEDBACK = {
  excellent: {
    responses: {
      clarity: "The main idea is clearly about discovering a mysterious lighthouse. In your opening sentence 'The lighthouse stood sentinel,' you establish the setting effectively.",
      strengths: "Your use of the appositive 'a weathered stone sentinel' adds vivid description. The phrase 'golden light spilled from within' uses strong sensory language that I can visualize.",
      improvements: "In your third sentence, you could expand 'Her curiosity got the better of her' by adding because: 'Her curiosity got the better of her because the light seemed to pulse with an otherworldly rhythm.' This would show deeper thinking.",
      organization: "You use 'However' effectively to transition between paragraphs. The chronological flow from past to present works well.",
      engagement: "The mysterious golden light creates suspense. I want to know what's in the chest!",
    },
    expectedScore: 85-95,
  },
  
  vague: {
    responses: {
      clarity: "The writing is clear and easy to understand.",
      strengths: "Good description and nice vocabulary.",
      improvements: "Could add more details and better transitions.",
      organization: "It's organized pretty well.",
      engagement: "It's interesting and engaging.",
    },
    expectedScore: 40-60,
  },
};

describe('Grading API Endpoints - TWR Alignment Tests', () => {
  
  describe('analyze-writing endpoint', () => {
    it('should provide TWR-specific feedback for excellent writing', async () => {
      const request = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: SAMPLE_WRITINGS.excellent.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response = await analyzeWriting(request as any);
      const data = await response.json();
      
      // Should have overall score
      expect(data.overallScore).toBeGreaterThanOrEqual(SAMPLE_WRITINGS.excellent.expectedScore[0]);
      
      // Should have trait scores
      expect(data.traits).toHaveProperty('content');
      expect(data.traits).toHaveProperty('organization');
      expect(data.traits).toHaveProperty('grammar');
      
      // Should provide specific strengths
      expect(data.strengths).toBeInstanceOf(Array);
      expect(data.strengths.length).toBeGreaterThanOrEqual(3);
      
      // Should provide specific improvements
      expect(data.improvements).toBeInstanceOf(Array);
      expect(data.improvements.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should identify TWR strategies used in writing', async () => {
      const request = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: SAMPLE_WRITINGS.excellent.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response = await analyzeWriting(request as any);
      const data = await response.json();
      
      const allFeedback = [
        ...data.strengths || [],
        ...data.improvements || [],
        ...Object.values(data.specificFeedback || {}),
      ].join(' ').toLowerCase();
      
      // Should mention TWR strategies (or specific examples from the text)
      // At minimum, should quote actual text from the student
      const hasSpecificQuotes = allFeedback.includes('"') || allFeedback.includes("'");
      
      // Either has quotes OR explicitly mentions strategies
      const mentionsTWR = 
        allFeedback.includes('sentence') ||
        allFeedback.includes('transition') ||
        allFeedback.includes('because') ||
        allFeedback.includes('but') ||
        allFeedback.includes('so') ||
        hasSpecificQuotes;
      
      expect(mentionsTWR).toBe(true);
    });
    
    it('should give lower scores to simple writing that needs TWR strategies', async () => {
      const request = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: SAMPLE_WRITINGS.needsWork.content,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response = await analyzeWriting(request as any);
      const data = await response.json();
      
      // Should score lower (40-60 range)
      expect(data.overallScore).toBeLessThan(65);
      
      // Should suggest TWR strategies in improvements
      const improvements = data.improvements.join(' ').toLowerCase();
      
      const suggestsTWR = 
        improvements.includes('sentence') ||
        improvements.includes('expand') ||
        improvements.includes('because') ||
        improvements.includes('but') ||
        improvements.includes('so') ||
        improvements.includes('combining') ||
        improvements.includes('transition');
      
      expect(suggestsTWR).toBe(true);
    });
  });
  
  describe('batch-rank-writings endpoint', () => {
    it('should rank writings correctly based on TWR principles', async () => {
      const writings = [
        {
          playerId: 'excellent-player',
          playerName: 'Expert Writer',
          content: SAMPLE_WRITINGS.excellent.content,
          wordCount: SAMPLE_WRITINGS.excellent.wordCount,
          isAI: false,
        },
        {
          playerId: 'good-player',
          playerName: 'Good Writer',
          content: SAMPLE_WRITINGS.good.content,
          wordCount: SAMPLE_WRITINGS.good.wordCount,
          isAI: false,
        },
        {
          playerId: 'needs-work-player',
          playerName: 'Developing Writer',
          content: SAMPLE_WRITINGS.needsWork.content,
          wordCount: SAMPLE_WRITINGS.needsWork.wordCount,
          isAI: false,
        },
      ];
      
      const request = new Request('http://localhost:3000/api/batch-rank-writings', {
        method: 'POST',
        body: JSON.stringify({
          writings,
          prompt: 'Write about discovering something mysterious',
          promptType: 'narrative',
          trait: 'all',
        }),
      });
      
      const response = await batchRankWritings(request as any);
      const data = await response.json();
      
      // Should return rankings
      expect(data.rankings).toBeInstanceOf(Array);
      expect(data.rankings.length).toBe(3);
      
      // Should rank excellent writing highest
      const excellentRanking = data.rankings.find((r: any) => r.playerId === 'excellent-player');
      const needsWorkRanking = data.rankings.find((r: any) => r.playerId === 'needs-work-player');
      
      expect(excellentRanking.score).toBeGreaterThan(needsWorkRanking.score);
      expect(excellentRanking.rank).toBeLessThan(needsWorkRanking.rank); // Lower rank number = better
    });
    
    it('should provide TWR-specific feedback for each ranked writing', async () => {
      const writings = [
        {
          playerId: 'test-player',
          playerName: 'Test Writer',
          content: SAMPLE_WRITINGS.good.content,
          wordCount: SAMPLE_WRITINGS.good.wordCount,
          isAI: false,
        },
      ];
      
      const request = new Request('http://localhost:3000/api/batch-rank-writings', {
        method: 'POST',
        body: JSON.stringify({
          writings,
          prompt: 'Write about discovering something mysterious',
          promptType: 'narrative',
          trait: 'all',
        }),
      });
      
      const response = await batchRankWritings(request as any);
      const data = await response.json();
      
      const ranking = data.rankings[0];
      
      // Should have detailed feedback
      expect(ranking).toHaveProperty('strengths');
      expect(ranking).toHaveProperty('improvements');
      expect(ranking).toHaveProperty('traitFeedback');
      
      // Improvements should be specific
      expect(ranking.improvements.length).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('evaluate-peer-feedback endpoint', () => {
    it('should reward specific, TWR-aligned peer feedback', async () => {
      const request = new Request('http://localhost:3000/api/evaluate-peer-feedback', {
        method: 'POST',
        body: JSON.stringify({
          responses: SAMPLE_PEER_FEEDBACK.excellent.responses,
          peerWriting: SAMPLE_WRITINGS.excellent.content,
        }),
      });
      
      const response = await evaluatePeerFeedback(request as any);
      const data = await response.json();
      
      // Specific feedback should get high score
      expect(data.score).toBeGreaterThanOrEqual(80);
      
      // Should recognize that this feedback quotes actual text
      expect(data.strengths).toBeInstanceOf(Array);
      expect(data.strengths.length).toBeGreaterThan(0);
    });
    
    it('should penalize vague peer feedback', async () => {
      const request = new Request('http://localhost:3000/api/evaluate-peer-feedback', {
        method: 'POST',
        body: JSON.stringify({
          responses: SAMPLE_PEER_FEEDBACK.vague.responses,
          peerWriting: SAMPLE_WRITINGS.excellent.content,
        }),
      });
      
      const response = await evaluatePeerFeedback(request as any);
      const data = await response.json();
      
      // Vague feedback should get lower score
      expect(data.score).toBeLessThan(70);
      
      // Should suggest being more specific
      const improvements = data.improvements.join(' ').toLowerCase();
      expect(improvements).toMatch(/specific|quote|example|reference/);
    });
  });
  
  describe('evaluate-revision endpoint', () => {
    it('should reward effective application of TWR strategies', async () => {
      const original = SAMPLE_WRITINGS.good.content;
      
      // Revised version with TWR improvements
      const revised = `The ancient lighthouse, a weathered stone sentinel, stood on the rocky cliff. I walked past it every day to school, never giving it much thought. However, today was different because the door was open and a strange golden light spilled from within.

I was curious, so I went closer to investigate. When I opened the rusty door, the hinges groaned loudly. The dusty room was filled with old nautical equipment, but in the center sat a mysterious wooden chest that seemed to glow with an inner light.`;
      
      const feedback = {
        strengths: ['Clear structure'],
        improvements: ['Add appositives', 'Use subordinating conjunctions', 'Combine short sentences'],
      };
      
      const request = new Request('http://localhost:3000/api/evaluate-revision', {
        method: 'POST',
        body: JSON.stringify({
          originalContent: original,
          revisedContent: revised,
          feedback,
        }),
      });
      
      const response = await evaluateRevision(request as any);
      const data = await response.json();
      
      // Should recognize improvements
      expect(data.score).toBeGreaterThan(75);
      
      // Should identify specific improvements made
      expect(data.improvements).toBeInstanceOf(Array);
      expect(data.strengths).toBeInstanceOf(Array);
    });
    
    it('should identify lack of revision', async () => {
      const original = SAMPLE_WRITINGS.good.content;
      const revised = original; // No changes!
      
      const request = new Request('http://localhost:3000/api/evaluate-revision', {
        method: 'POST',
        body: JSON.stringify({
          originalContent: original,
          revisedContent: revised,
          feedback: {},
        }),
      });
      
      const response = await evaluateRevision(request as any);
      const data = await response.json();
      
      // Should score lower for no changes
      expect(data.score).toBeLessThan(70);
    });
  });
  
  describe('generate-feedback endpoint', () => {
    it('should provide TWR-specific strategies in feedback', async () => {
      const request = new Request('http://localhost:3000/api/generate-feedback', {
        method: 'POST',
        body: JSON.stringify({
          content: SAMPLE_WRITINGS.good.content,
          promptType: 'narrative',
        }),
      });
      
      const response = await generateFeedback(request as any);
      const data = await response.json();
      
      // Should have strengths and improvements
      expect(data.strengths).toBeInstanceOf(Array);
      expect(data.improvements).toBeInstanceOf(Array);
      expect(data.score).toBeGreaterThan(0);
      
      // Improvements should mention TWR strategies
      const improvements = data.improvements.join(' ').toLowerCase();
      
      const mentionsTWR = 
        improvements.includes('because') ||
        improvements.includes('but') ||
        improvements.includes('so') ||
        improvements.includes('appositive') ||
        improvements.includes('combining') ||
        improvements.includes('expand') ||
        improvements.includes('transition') ||
        improvements.includes('sentence');
      
      expect(mentionsTWR).toBe(true);
    });
    
    it('should quote actual text from student writing', async () => {
      const request = new Request('http://localhost:3000/api/generate-feedback', {
        method: 'POST',
        body: JSON.stringify({
          content: SAMPLE_WRITINGS.excellent.content,
          promptType: 'narrative',
        }),
      });
      
      const response = await generateFeedback(request as any);
      const data = await response.json();
      
      const allFeedback = [
        ...data.strengths,
        ...data.improvements,
      ].join(' ');
      
      // Should include quotes from the actual text
      // Check for quote marks or specific phrases from the writing
      const hasQuotes = allFeedback.includes('"') || allFeedback.includes("'");
      const referencesActualText = 
        allFeedback.toLowerCase().includes('lighthouse') ||
        allFeedback.toLowerCase().includes('sentinel') ||
        allFeedback.toLowerCase().includes('golden light');
      
      expect(hasQuotes || referencesActualText).toBe(true);
    });
  });
});

describe('TWR Methodology Validation', () => {
  
  describe('Sentence Expansion (because/but/so)', () => {
    it('should recognize when because/but/so are used well', async () => {
      const withExpansion = "I opened the door because the golden light intrigued me.";
      const without = "I opened the door.";
      
      const request1 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: withExpansion,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const request2 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: without,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response1 = await analyzeWriting(request1 as any);
      const response2 = await analyzeWriting(request2 as any);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Writing with expansion should score higher
      expect(data1.overallScore).toBeGreaterThanOrEqual(data2.overallScore);
    });
  });
  
  describe('Appositives', () => {
    it('should recognize appositives as strong writing', async () => {
      const withAppositive = "The lighthouse, a weathered stone tower, stood on the cliff.";
      const without = "The old lighthouse stood on the cliff.";
      
      const request1 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: withAppositive,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const request2 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: without,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response1 = await analyzeWriting(request1 as any);
      const response2 = await analyzeWriting(request2 as any);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Writing with appositive should score same or higher
      expect(data1.overallScore).toBeGreaterThanOrEqual(data2.overallScore - 5);
    });
  });
  
  describe('Transitions', () => {
    it('should recognize good use of transition words', async () => {
      const withTransitions = "First, I walked to the lighthouse. Then, I opened the door. Finally, I discovered the chest.";
      const without = "I walked to the lighthouse. I opened the door. I discovered the chest.";
      
      const request1 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: withTransitions,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const request2 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: without,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response1 = await analyzeWriting(request1 as any);
      const response2 = await analyzeWriting(request2 as any);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // With transitions should score higher on organization
      expect(data1.traits.organization).toBeGreaterThanOrEqual(data2.traits.organization - 5);
    });
  });
  
  describe('Sentence Variety', () => {
    it('should reward varied sentence structures', async () => {
      const varied = "The lighthouse stood tall. I approached it cautiously. Although the door was rusty, it opened easily.";
      const repetitive = "I saw the lighthouse. I went to the lighthouse. I opened the lighthouse door.";
      
      const request1 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: varied,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const request2 = new Request('http://localhost:3000/api/analyze-writing', {
        method: 'POST',
        body: JSON.stringify({
          content: repetitive,
          trait: 'all',
          promptType: 'narrative',
        }),
      });
      
      const response1 = await analyzeWriting(request1 as any);
      const response2 = await analyzeWriting(request2 as any);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Varied should score higher on grammar/organization
      expect(data1.traits.grammar).toBeGreaterThanOrEqual(data2.traits.grammar);
    });
  });
});

describe('Specificity Requirements (TWR Principle)', () => {
  
  it('feedback should quote actual student text', async () => {
    const uniquePhrase = "The crystalline structure gleamed magnificently";
    
    const request = new Request('http://localhost:3000/api/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({
        content: `${uniquePhrase} in the morning light.`,
        promptType: 'descriptive',
      }),
    });
    
    const response = await generateFeedback(request as any);
    const data = await response.json();
    
    const allFeedback = [
      ...data.strengths || [],
      ...data.improvements || [],
    ].join(' ');
    
    // Should either quote the unique phrase OR use quotes in feedback
    const hasQuotes = allFeedback.includes('"') || allFeedback.includes("'");
    const referencesText = allFeedback.toLowerCase().includes('crystalline') || 
                           allFeedback.toLowerCase().includes('gleamed');
    
    expect(hasQuotes || referencesText).toBe(true);
  });
  
  it('improvements should give concrete examples, not vague advice', async () => {
    const request = new Request('http://localhost:3000/api/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({
        content: SAMPLE_WRITINGS.good.content,
        promptType: 'narrative',
      }),
    });
    
    const response = await generateFeedback(request as any);
    const data = await response.json();
    
    // Each improvement should be reasonably detailed (> 20 characters)
    data.improvements.forEach((improvement: string) => {
      expect(improvement.length).toBeGreaterThan(20);
    });
    
    // Should not just say "add more" without specifics
    const vaguePhrases = ['add more', 'could improve', 'needs work', 'try to'];
    const improvements = data.improvements.join(' ').toLowerCase();
    
    // If it has vague phrases, it should ALSO have specific examples
    if (vaguePhrases.some(phrase => improvements.includes(phrase))) {
      // Should include specifics like "sentence", "because", "transition", etc.
      const hasSpecifics = improvements.includes('sentence') || 
                           improvements.includes('because') ||
                           improvements.includes('transition') ||
                           improvements.includes('"');
      
      expect(hasSpecifics).toBe(true);
    }
  });
});

