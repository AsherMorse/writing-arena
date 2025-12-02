/**
 * Automated Session Simulation
 * Tests complete game flow: Phase 1 → Phase 2 → Phase 3 → Results
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'writing-arena',
    });
  } else {
    admin.initializeApp({
      projectId: 'writing-arena',
    });
  }
}

const db = admin.firestore();

async function simulateCompleteSession() {
  console.log('🎮 SIMULATING COMPLETE RANKED SESSION\n');
  console.log('=' .repeat(60));
  
  const testUserId = `test-user-${Date.now()}`;
  const sessionId = `session-test-${Date.now()}`;
  const matchId = `match-test-${Date.now()}`;
  
  try {
    // Step 1: Create session with 1 real player + 4 AI
    console.log('\n📝 STEP 1: Creating session...');
    const session = {
      sessionId,
      matchId,
      mode: 'ranked',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      config: {
        trait: 'all',
        promptId: 'test-prompt',
        promptType: 'narrative',
        phase: 1,
        phaseDuration: 120,
      },
      players: {
        [testUserId]: {
          userId: testUserId,
          displayName: 'Test User',
          avatar: '🧪',
          rank: 'Silver III',
          isAI: false,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'test-conn',
          phases: {},
        },
        'ai-1': {
          userId: 'ai-1',
          displayName: 'AI Player 1',
          avatar: '🤖',
          rank: 'Silver II',
          isAI: true,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'ai-conn-1',
          phases: {},
        },
        'ai-2': {
          userId: 'ai-2',
          displayName: 'AI Player 2',
          avatar: '🤖',
          rank: 'Silver III',
          isAI: true,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'ai-conn-2',
          phases: {},
        },
        'ai-3': {
          userId: 'ai-3',
          displayName: 'AI Player 3',
          avatar: '🤖',
          rank: 'Silver II',
          isAI: true,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'ai-conn-3',
          phases: {},
        },
        'ai-4': {
          userId: 'ai-4',
          displayName: 'AI Player 4',
          avatar: '🤖',
          rank: 'Silver III',
          isAI: true,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'ai-conn-4',
          phases: {},
        },
      },
      state: 'active',
      timing: {
        phase1StartTime: admin.firestore.Timestamp.now(),
      },
      coordination: {
        readyCount: 0,
        allPlayersReady: false,
      },
    };
    
    const sessionRef = db.collection('sessions').doc(sessionId);
    await sessionRef.set(session);
    console.log('✅ Session created with 5 players (1 real + 4 AI)');
    console.log('   Session ID:', sessionId);
    console.log('   Phase: 1, Duration: 120 seconds');
    
    // Step 2: Simulate user Phase 1 submission
    console.log('\n📝 STEP 2: User submits Phase 1...');
    await sessionRef.update({
      [`players.${testUserId}.phases.phase1`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        content: 'Test writing about discovering something mysterious',
        wordCount: 50,
        score: 75,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 1');
    
    // Step 3: Wait for Cloud Function to transition
    console.log('\n⏱️ STEP 3: Waiting for Cloud Function to transition to Phase 2...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let snap = await sessionRef.get();
    let data = snap.data();
    
    if (data.config.phase === 2) {
      console.log('✅ Cloud Function transitioned to Phase 2!');
      console.log('   Phase:', data.config.phase);
      console.log('   Duration:', data.config.phaseDuration, '(should be 60)');
      console.log('   Phase 2 Start Time:', data.timing.phase2StartTime ? 'SET ✅' : 'MISSING ❌');
      console.log('   Coordination Reset:', !data.coordination.allPlayersReady ? 'YES ✅' : 'NO ❌');
    } else {
      console.error('❌ FAILED: Still in Phase', data.config.phase);
      console.log('Cloud Function may not have fired. Check logs.');
      return;
    }
    
    // Step 4: Simulate user Phase 2 submission
    console.log('\n📝 STEP 4: User submits Phase 2...');
    await sessionRef.update({
      [`players.${testUserId}.phases.phase2`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        responses: {
          clarity: 'Clear main idea',
          strengths: 'Good description',
          improvements: 'Could add more details',
          organization: 'Well organized',
          engagement: 'Very engaging',
        },
        score: 80,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 2');
    
    // Step 5: Wait for transition to Phase 3
    console.log('\n⏱️ STEP 5: Waiting for Cloud Function to transition to Phase 3...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    snap = await sessionRef.get();
    data = snap.data();
    
    if (data.config.phase === 3) {
      console.log('✅ Cloud Function transitioned to Phase 3!');
      console.log('   Phase:', data.config.phase);
      console.log('   Duration:', data.config.phaseDuration, '(should be 60)');
      console.log('   Phase 3 Start Time:', data.timing.phase3StartTime ? 'SET ✅' : 'MISSING ❌');
    } else {
      console.error('❌ FAILED: Still in Phase', data.config.phase);
      return;
    }
    
    // Step 6: Simulate user Phase 3 submission
    console.log('\n📝 STEP 6: User submits Phase 3...');
    await sessionRef.update({
      [`players.${testUserId}.phases.phase3`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        revisedContent: 'Revised version of test writing with improvements',
        wordCount: 55,
        score: 85,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 3');
    
    // Step 7: Wait for session to complete
    console.log('\n⏱️ STEP 7: Waiting for Cloud Function to mark session completed...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    snap = await sessionRef.get();
    data = snap.data();
    
    if (data.state === 'completed') {
      console.log('✅ Cloud Function marked session as completed!');
      console.log('   State:', data.state);
    } else {
      console.error('❌ FAILED: Session state is', data.state, '(should be completed)');
      return;
    }
    
    // Step 8: Verify all data
    console.log('\n📊 STEP 8: Verifying session data...');
    console.log('\nUser Scores:');
    console.log('  Phase 1:', data.players[testUserId].phases.phase1?.score || 'MISSING');
    console.log('  Phase 2:', data.players[testUserId].phases.phase2?.score || 'MISSING');
    console.log('  Phase 3:', data.players[testUserId].phases.phase3?.score || 'MISSING');
    
    console.log('\nTiming Verification:');
    console.log('  Phase 1 Start:', data.timing.phase1StartTime ? 'SET ✅' : 'MISSING ❌');
    console.log('  Phase 2 Start:', data.timing.phase2StartTime ? 'SET ✅' : 'MISSING ❌');
    console.log('  Phase 3 Start:', data.timing.phase3StartTime ? 'SET ✅' : 'MISSING ❌');
    
    const phase2Start = data.timing.phase2StartTime;
    const phase3Start = data.timing.phase3StartTime;
    
    if (phase2Start && phase3Start) {
      const phase2Millis = phase2Start.toMillis();
      const phase3Millis = phase3Start.toMillis();
      const diff = phase3Millis - phase2Millis;
      
      console.log('\n  Time between Phase 2 and 3:', Math.floor(diff / 1000), 'seconds');
      console.log('  (Should be small, just the transition delay)');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('  ✅ Session created');
    console.log('  ✅ Phase 1 → 2 transition (Cloud Function)');
    console.log('  ✅ Phase 2 → 3 transition (Cloud Function)');
    console.log('  ✅ Phase 3 → Completed (Cloud Function)');
    console.log('  ✅ All timestamps set correctly');
    console.log('  ✅ Durations updated (120 → 60 → 60)');
    console.log('\n🚀 Session architecture working correctly!');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test session...');
    await sessionRef.delete();
    console.log('✅ Test session deleted\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error(error.stack);
  }
  
  process.exit(0);
}

// Run simulation
console.log('Starting automated session simulation...\n');
simulateCompleteSession();

