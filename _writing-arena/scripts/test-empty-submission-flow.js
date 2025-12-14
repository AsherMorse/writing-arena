/**
 * Test Empty Submission Flow
 * Simulates a complete ranked match with EMPTY submissions to verify scoring
 * Calls all endpoints like the live site does
 * 
 * Usage: node scripts/test-empty-submission-flow.js
 * Or: npm run test:empty-submissions
 */

// Node 18+ has native fetch support

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data - simulating empty submissions
const EMPTY_WRITING = {
  playerId: 'test-user-empty',
  playerName: 'Test User (Empty)',
  content: '', // EMPTY
  wordCount: 0, // EMPTY
  isAI: false,
  rank: 'Silver III',
};

const AI_WRITINGS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    content: 'This is a sample writing from an AI player. It has some content and demonstrates writing skills.',
    wordCount: 20,
    isAI: true,
    rank: 'Silver II',
  },
  {
    playerId: 'ai-2',
    playerName: 'AI Player 2',
    content: 'Another AI writing sample with different content and style.',
    wordCount: 15,
    isAI: true,
    rank: 'Silver III',
  },
  {
    playerId: 'ai-3',
    playerName: 'AI Player 3',
    content: 'A third AI writing sample to test batch ranking functionality.',
    wordCount: 18,
    isAI: true,
    rank: 'Silver II',
  },
  {
    playerId: 'ai-4',
    playerName: 'AI Player 4',
    content: 'Final AI writing sample for comprehensive testing.',
    wordCount: 12,
    isAI: true,
    rank: 'Silver III',
  },
];

const EMPTY_FEEDBACK = {
  playerId: 'test-user-empty',
  playerName: 'Test User (Empty)',
  responses: {
    clarity: '', // EMPTY
    strengths: '', // EMPTY
    improvements: '', // EMPTY
    organization: '', // EMPTY
    engagement: '', // EMPTY
  },
  peerWriting: 'Sample peer writing to review.',
  isAI: false,
};

const AI_FEEDBACKS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    responses: {
      clarity: 'The main idea is clear and well presented.',
      strengths: 'Good use of descriptive language.',
      improvements: 'Could add more specific examples.',
      organization: 'Well structured with clear flow.',
      engagement: 'Very engaging and interesting.',
    },
    peerWriting: 'Sample peer writing to review.',
    isAI: true,
  },
  {
    playerId: 'ai-2',
    playerName: 'AI Player 2',
    responses: {
      clarity: 'The message is understandable.',
      strengths: 'Strong opening sentence.',
      improvements: 'Needs more detail in the middle.',
      organization: 'Good paragraph structure.',
      engagement: 'Holds attention well.',
    },
    peerWriting: 'Sample peer writing to review.',
    isAI: true,
  },
];

const EMPTY_REVISION = {
  playerId: 'test-user-empty',
  playerName: 'Test User (Empty)',
  originalContent: 'Original writing content here.',
  revisedContent: '', // EMPTY
  feedback: {
    strengths: ['Good attempt'],
    improvements: ['Add more detail'],
  },
  wordCount: 0, // EMPTY
  isAI: false,
};

const AI_REVISIONS = [
  {
    playerId: 'ai-1',
    playerName: 'AI Player 1',
    originalContent: 'Original writing content here.',
    revisedContent: 'Revised writing content with improvements and additional details.',
    feedback: {
      strengths: ['Good attempt'],
      improvements: ['Add more detail'],
    },
    wordCount: 15,
    isAI: true,
  },
];

async function testPhase1EmptyWriting() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 TEST 1: Phase 1 - Empty Writing Submission');
  console.log('='.repeat(80));
  
  const allWritings = [EMPTY_WRITING, ...AI_WRITINGS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User writing:', {
    content: EMPTY_WRITING.content || '(EMPTY)',
    contentLength: EMPTY_WRITING.content?.length || 0,
    wordCount: EMPTY_WRITING.wordCount,
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
    
    const userRanking = data.rankings?.find((r) => r.playerId === EMPTY_WRITING.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0);
      console.log('  - Improvements:', userRanking.improvements?.length || 0);
      
      if (userRanking.score === 0) {
        console.log('  ✅ CORRECT: Empty submission scored as 0');
      } else {
        console.log('  ❌ ERROR: Empty submission got score', userRanking.score, '(should be 0)');
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
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function testPhase2EmptyFeedback() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 TEST 2: Phase 2 - Empty Feedback Submission');
  console.log('='.repeat(80));
  
  const allFeedback = [EMPTY_FEEDBACK, ...AI_FEEDBACKS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User feedback:', {
    totalChars: Object.values(EMPTY_FEEDBACK.responses).join('').length,
    responses: Object.entries(EMPTY_FEEDBACK.responses).map(([key, value]) => ({
      key,
      length: value?.length || 0,
    })),
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
    
    const userRanking = data.rankings?.find((r) => r.playerId === EMPTY_FEEDBACK.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0);
      console.log('  - Improvements:', userRanking.improvements?.length || 0);
      
      if (userRanking.score === 0) {
        console.log('  ✅ CORRECT: Empty feedback scored as 0');
      } else {
        console.log('  ❌ ERROR: Empty feedback got score', userRanking.score, '(should be 0)');
      }
    } else {
      console.log('  ❌ ERROR: User ranking not found in response');
    }
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function testPhase3EmptyRevision() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 TEST 3: Phase 3 - Empty Revision Submission');
  console.log('='.repeat(80));
  
  const allRevisions = [EMPTY_REVISION, ...AI_REVISIONS];
  
  console.log('\n📊 Submitting batch ranking request:');
  console.log('  - User revision:', {
    originalContent: EMPTY_REVISION.originalContent?.substring(0, 30) + '...',
    revisedContent: EMPTY_REVISION.revisedContent || '(EMPTY)',
    revisedContentLength: EMPTY_REVISION.revisedContent?.length || 0,
    wordCount: EMPTY_REVISION.wordCount,
    unchanged: EMPTY_REVISION.revisedContent === EMPTY_REVISION.originalContent,
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
    
    const userRanking = data.rankings?.find((r) => r.playerId === EMPTY_REVISION.playerId);
    
    if (userRanking) {
      console.log('\n🎯 User Ranking:');
      console.log('  - Score:', userRanking.score);
      console.log('  - Rank:', userRanking.rank);
      console.log('  - Strengths:', userRanking.strengths?.length || 0);
      console.log('  - Improvements:', userRanking.improvements?.length || 0);
      
      if (userRanking.score === 0) {
        console.log('  ✅ CORRECT: Empty revision scored as 0');
      } else {
        console.log('  ❌ ERROR: Empty revision got score', userRanking.score, '(should be 0)');
      }
    } else {
      console.log('  ❌ ERROR: User ranking not found in response');
    }
    
    return userRanking;
  } catch (error) {
    console.error('  ❌ ERROR:', error.message);
    return null;
  }
}

async function testValidationFunctions() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TEST 4: Validation Functions (Direct Test)');
  console.log('='.repeat(80));
  
  // We can't directly test the validation functions from Node.js since they're TypeScript
  // But we can test the API endpoints which use them
  
  console.log('\n📝 Note: Validation happens in the hook before API call');
  console.log('   Testing via API endpoints above will show if validation is working');
  console.log('   Check server logs for validation warnings');
}

async function runAllTests() {
  console.log('\n🚀 Starting Empty Submission Flow Tests');
  console.log('='.repeat(80));
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(80));
  
  const results = {
    phase1: null,
    phase2: null,
    phase3: null,
  };
  
  // Test Phase 1
  results.phase1 = await testPhase1EmptyWriting();
  
  // Test Phase 2
  results.phase2 = await testPhase2EmptyFeedback();
  
  // Test Phase 3
  results.phase3 = await testPhase3EmptyRevision();
  
  // Test validation
  await testValidationFunctions();
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const allPassed = [
    results.phase1?.score === 0,
    results.phase2?.score === 0,
    results.phase3?.score === 0,
  ].every(Boolean);
  
  console.log('\nPhase 1 (Empty Writing):', results.phase1?.score === 0 ? '✅ PASS' : '❌ FAIL', `(score: ${results.phase1?.score || 'N/A'})`);
  console.log('Phase 2 (Empty Feedback):', results.phase2?.score === 0 ? '✅ PASS' : '❌ FAIL', `(score: ${results.phase2?.score || 'N/A'})`);
  console.log('Phase 3 (Empty Revision):', results.phase3?.score === 0 ? '✅ PASS' : '❌ FAIL', `(score: ${results.phase3?.score || 'N/A'})`);
  
  console.log('\n' + '='.repeat(80));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Empty submissions correctly scored as 0');
  } else {
    console.log('❌ SOME TESTS FAILED - Empty submissions are getting scores');
    console.log('\n⚠️  Check server logs for:');
    console.log('   - Validation warnings');
    console.log('   - API key status');
    console.log('   - Mock data generation logs');
  }
  console.log('='.repeat(80));
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error('\n❌ TEST RUNNER ERROR:', error);
  process.exit(1);
});

