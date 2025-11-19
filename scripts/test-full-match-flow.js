/**
 * Test Full Match Flow with Real Submissions
 * Simulates a complete ranked match with actual user content across all 3 phases
 * Calls all endpoints like the live site does
 * 
 * Usage: node scripts/test-full-match-flow.js
 * Or: npm run test:full-match
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data - simulating real user submissions
const USER_WRITING = {
  playerId: 'test-user-real',
  playerName: 'Test User',
  content: 'The ancient lighthouse, a weathered stone sentinel, stood on the cliff overlooking the stormy sea. I approached it cautiously because the mysterious golden light that flickered from its highest window intrigued me deeply. However, when I opened the rusty door, it creaked loudly, echoing through the empty tower. Inside, the dusty room was filled with old navigation equipment, but in the center sat a glowing wooden chest that seemed to pulse with an inner light.',
  wordCount: 85,
  isAI: false,
  rank: 'Silver III',
};

const AI_WRITINGS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    content: 'I walked along the beach and found a shell. It was pretty and shiny. I picked it up and put it in my pocket. Then I went home and showed my mom.',
    wordCount: 32,
    isAI: true,
    rank: 'Silver II',
  },
  {
    playerId: 'ai-2',
    playerName: 'AI Player 2',
    content: 'The forest was dark and mysterious. Trees towered above me like ancient guardians. I heard strange sounds in the distance, but I kept walking forward, determined to discover what lay ahead.',
    wordCount: 38,
    isAI: true,
    rank: 'Silver III',
  },
  {
    playerId: 'ai-3',
    playerName: 'AI Player 3',
    content: 'My adventure began when I discovered an old map in my grandfather\'s attic. The map showed a hidden treasure buried deep in the mountains. I decided to follow the clues and find the treasure.',
    wordCount: 35,
    isAI: true,
    rank: 'Silver II',
  },
  {
    playerId: 'ai-4',
    playerName: 'AI Player 4',
    content: 'The castle stood on the hill, its towers reaching toward the clouds. I had heard stories about this place, but seeing it in person was completely different. The ancient stones seemed to whisper secrets of the past.',
    wordCount: 42,
    isAI: true,
    rank: 'Silver III',
  },
];

const USER_FEEDBACK = {
  playerId: 'test-user-real',
  playerName: 'Test User',
  responses: {
    clarity: 'Your opening uses an appositive (The lighthouse, a weathered sentinel) which is a TWR strategy that adds description efficiently. The main idea is clear.',
    strengths: 'The phrase "because the mysterious light" shows sentence expansion (TWR) - you show WHY you approached it. Good use of descriptive language and transitions.',
    improvements: 'In sentence 3, you could combine (TWR): "The rusty door creaked loudly when I opened it" instead of two sentences. Consider adding more sensory details.',
    organization: 'Good use of transition word "However" (TWR) to signal change. The flow from outside to inside is logical.',
    engagement: 'The glowing chest creates mystery and draws the reader in. The description builds suspense effectively.',
  },
  peerWriting: 'I walked along the beach and found a shell. It was pretty and shiny. I picked it up and put it in my pocket.',
  isAI: false,
};

const AI_FEEDBACKS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    responses: {
      clarity: 'The main idea is understandable but could be clearer.',
      strengths: 'Good attempt at description.',
      improvements: 'Try adding more details about the setting.',
      organization: 'The structure is okay but could flow better.',
      engagement: 'Interesting concept but needs more development.',
    },
    peerWriting: 'I walked along the beach and found a shell. It was pretty and shiny.',
    isAI: true,
  },
  {
    playerId: 'ai-2',
    playerName: 'AI Player 2',
    responses: {
      clarity: 'The message comes through clearly.',
      strengths: 'Strong opening sentence.',
      improvements: 'Needs more detail in the middle section.',
      organization: 'Good paragraph structure.',
      engagement: 'Holds attention well.',
    },
    peerWriting: 'I walked along the beach and found a shell. It was pretty and shiny.',
    isAI: true,
  },
];

const USER_REVISION = {
  playerId: 'test-user-real',
  playerName: 'Test User',
  originalContent: 'The ancient lighthouse, a weathered stone sentinel, stood on the cliff overlooking the stormy sea. I approached it cautiously because the mysterious golden light that flickered from its highest window intrigued me deeply. However, when I opened the rusty door, it creaked loudly, echoing through the empty tower. Inside, the dusty room was filled with old navigation equipment, but in the center sat a glowing wooden chest that seemed to pulse with an inner light.',
  revisedContent: 'The ancient lighthouse, a weathered stone sentinel that had guarded the coast for centuries, stood on the cliff overlooking the stormy sea. I approached it cautiously because the mysterious golden light that flickered from its highest window intrigued me deeply, and I wanted to discover its source. However, when I opened the rusty door, it creaked loudly, echoing through the empty tower like a ghost\'s warning. Inside, the dusty room was filled with old navigation equipment—compasses, maps, and sextants covered in cobwebs—but in the center sat a glowing wooden chest that seemed to pulse with an inner light, calling to me.',
  feedback: {
    strengths: ['Good use of appositives', 'Clear sentence expansion with because'],
    improvements: ['Combine short sentences', 'Add more sensory details'],
  },
  wordCount: 105,
  isAI: false,
};

const AI_REVISIONS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    originalContent: 'I walked along the beach and found a shell.',
    revisedContent: 'I walked along the beach, the warm sand between my toes, and found a beautiful shell that shimmered in the sunlight.',
    feedback: {
      strengths: ['Clear writing'],
      improvements: ['Add more description'],
    },
    wordCount: 20,
    isAI: true,
  },
];

async function testPhase1Writing() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 PHASE 1: Writing Submission');
  console.log('='.repeat(80));
  
  const allWritings = [USER_WRITING, ...AI_WRITINGS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User writing:', {
    contentPreview: USER_WRITING.content.substring(0, 60) + '...',
    wordCount: USER_WRITING.wordCount,
  });
  console.log('  - AI writings:', AI_WRITINGS.length);
  console.log('  - Total submissions:', allWritings.length);
  
  try {
    const response = await fetch(`${BASE_URL}/api/batch-rank-writings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writings: allWritings,
        prompt: 'Write about discovering something mysterious',
        promptType: 'narrative',
        trait: 'all',
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('  ❌ API Error:', response.status, response.statusText);
      console.error('  Response:', text.substring(0, 200));
      return null;
    }
    
    const data = await response.json();
    
    console.log('\n📊 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Rankings count:', data.rankings?.length || 0);
    
    const userRanking = data.rankings?.find((r) => r.playerId === USER_WRITING.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0, 'items');
      console.log('  - Improvements:', userRanking.improvements?.length || 0, 'items');
      
      if (userRanking.score > 0) {
        console.log('  ✅ CORRECT: User writing received a score');
        console.log('  📝 Sample strengths:', userRanking.strengths?.slice(0, 2).join(', ') || 'N/A');
        console.log('  📝 Sample improvements:', userRanking.improvements?.slice(0, 2).join(', ') || 'N/A');
      } else {
        console.log('  ⚠️  WARNING: User writing got score 0 (unexpected for non-empty content)');
      }
      
      // Check if mock scoring was used
      const isMock = userRanking.strengths?.some((s) => s.includes('MOCK')) ||
                     userRanking.improvements?.some((i) => i.includes('MOCK')) ||
                     userRanking.improvements?.some((i) => i.includes('Enable AI'));
      
      if (isMock) {
        console.log('  ⚠️  Using MOCK data (API key may be missing)');
      } else {
        console.log('  ✅ Using REAL AI evaluation');
      }
    } else {
      console.log('  ❌ ERROR: User ranking not found in response');
    }
    
    // Show all rankings
    console.log('\n📊 All Rankings:');
    data.rankings?.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.playerName}: Score ${r.score}, Rank ${r.rank}`);
    });
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function testPhase2Feedback() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 PHASE 2: Peer Feedback Submission');
  console.log('='.repeat(80));
  
  const allFeedback = [USER_FEEDBACK, ...AI_FEEDBACKS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User feedback:', {
    totalChars: Object.values(USER_FEEDBACK.responses).join('').length,
    responseKeys: Object.keys(USER_FEEDBACK.responses),
  });
  console.log('  - AI feedbacks:', AI_FEEDBACKS.length);
  console.log('  - Total submissions:', allFeedback.length);
  
  try {
    const response = await fetch(`${BASE_URL}/api/batch-rank-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackSubmissions: allFeedback,
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('  ❌ API Error:', response.status, response.statusText);
      console.error('  Response:', text.substring(0, 200));
      return null;
    }
    
    const data = await response.json();
    
    console.log('\n📊 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Rankings count:', data.rankings?.length || 0);
    
    const userRanking = data.rankings?.find((r) => r.playerId === USER_FEEDBACK.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0, 'items');
      console.log('  - Improvements:', userRanking.improvements?.length || 0, 'items');
      
      if (userRanking.score > 0) {
        console.log('  ✅ CORRECT: User feedback received a score');
        console.log('  📝 Sample strengths:', userRanking.strengths?.slice(0, 2).join(', ') || 'N/A');
        console.log('  📝 Sample improvements:', userRanking.improvements?.slice(0, 2).join(', ') || 'N/A');
      } else {
        console.log('  ⚠️  WARNING: User feedback got score 0 (unexpected for non-empty content)');
      }
    } else {
      console.log('  ❌ ERROR: User ranking not found in response');
    }
    
    // Show all rankings
    console.log('\n📊 All Rankings:');
    data.rankings?.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.playerName}: Score ${r.score}, Rank ${r.rank}`);
    });
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function testPhase3Revision() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 PHASE 3: Revision Submission');
  console.log('='.repeat(80));
  
  const allRevisions = [USER_REVISION, ...AI_REVISIONS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User revision:', {
    originalWordCount: USER_REVISION.originalContent.split(/\s+/).length,
    revisedWordCount: USER_REVISION.wordCount,
    wordCountIncrease: USER_REVISION.wordCount - USER_REVISION.originalContent.split(/\s+/).length,
    unchanged: USER_REVISION.revisedContent === USER_REVISION.originalContent,
  });
  console.log('  - AI revisions:', AI_REVISIONS.length);
  console.log('  - Total submissions:', allRevisions.length);
  
  try {
    const response = await fetch(`${BASE_URL}/api/batch-rank-revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revisionSubmissions: allRevisions,
      }),
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('  ❌ API Error:', response.status, response.statusText);
      console.error('  Response:', text.substring(0, 200));
      return null;
    }
    
    const data = await response.json();
    
    console.log('\n📊 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Rankings count:', data.rankings?.length || 0);
    
    const userRanking = data.rankings?.find((r) => r.playerId === USER_REVISION.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0, 'items');
      console.log('  - Improvements:', userRanking.improvements?.length || 0, 'items');
      console.log('  - Suggestions:', userRanking.suggestions?.length || 0, 'items');
      
      if (userRanking.score > 0) {
        console.log('  ✅ CORRECT: User revision received a score');
        console.log('  📝 Sample strengths:', userRanking.strengths?.slice(0, 2).join(', ') || 'N/A');
        console.log('  📝 Sample improvements:', userRanking.improvements?.slice(0, 2).join(', ') || 'N/A');
      } else {
        console.log('  ⚠️  WARNING: User revision got score 0 (unexpected for non-empty content)');
      }
    } else {
      console.log('  ❌ ERROR: User ranking not found in response');
    }
    
    // Show all rankings
    console.log('\n📊 All Rankings:');
    data.rankings?.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.playerName}: Score ${r.score}, Rank ${r.rank}`);
    });
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function runFullMatchTest() {
  console.log('\n🎮 Starting Full Match Flow Test');
  console.log('='.repeat(80));
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(80));
  console.log('\nThis test simulates a complete ranked match with real user submissions.');
  console.log('The user will submit writing, feedback, and revisions across all 3 phases.\n');
  
  const results = {
    phase1: null,
    phase2: null,
    phase3: null,
  };
  
  // Test Phase 1
  results.phase1 = await testPhase1Writing();
  
  // Small delay between phases
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test Phase 2
  results.phase2 = await testPhase2Feedback();
  
  // Small delay between phases
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test Phase 3
  results.phase3 = await testPhase3Revision();
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FULL MATCH TEST SUMMARY');
  console.log('='.repeat(80));
  
  const phase1Passed = results.phase1 && results.phase1.score > 0;
  const phase2Passed = results.phase2 && results.phase2.score > 0;
  const phase3Passed = results.phase3 && results.phase3.score > 0;
  
  console.log('\nPhase 1 (Writing):', phase1Passed ? '✅ PASS' : '❌ FAIL', 
    `(score: ${results.phase1?.score || 'N/A'}, rank: ${results.phase1?.rank || 'N/A'})`);
  console.log('Phase 2 (Feedback):', phase2Passed ? '✅ PASS' : '❌ FAIL', 
    `(score: ${results.phase2?.score || 'N/A'}, rank: ${results.phase2?.rank || 'N/A'})`);
  console.log('Phase 3 (Revision):', phase3Passed ? '✅ PASS' : '❌ FAIL', 
    `(score: ${results.phase3?.score || 'N/A'}, rank: ${results.phase3?.rank || 'N/A'})`);
  
  const allPassed = phase1Passed && phase2Passed && phase3Passed;
  
  console.log('\n' + '='.repeat(80));
  if (allPassed) {
    console.log('✅ ALL PHASES PASSED - User submissions correctly scored');
    console.log('\n📈 Final Scores:');
    console.log(`  Writing: ${results.phase1?.score || 0}`);
    console.log(`  Feedback: ${results.phase2?.score || 0}`);
    console.log(`  Revision: ${results.phase3?.score || 0}`);
    console.log(`  Total: ${(results.phase1?.score || 0) + (results.phase2?.score || 0) + (results.phase3?.score || 0)}`);
  } else {
    console.log('❌ SOME PHASES FAILED - Check scores above');
  }
  console.log('='.repeat(80));
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runFullMatchTest().catch((error) => {
  console.error('\n❌ TEST RUNNER ERROR:', error);
  process.exit(1);
});

