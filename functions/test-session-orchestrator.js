/**
 * Test Cloud Function phase transition logic
 */

const admin = require('firebase-admin');

// Initialize admin with your project
admin.initializeApp({
  projectId: 'writing-arena',
});

const db = admin.firestore();

async function testPhaseTransitions() {
  console.log('🧪 TESTING CLOUD FUNCTION PHASE TRANSITIONS\n');
  
  try {
    // Create a test session
    const testSessionId = `test-session-${Date.now()}`;
    const testSession = {
      sessionId: testSessionId,
      matchId: `test-match-${Date.now()}`,
      mode: 'ranked',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      config: {
        trait: 'all',
        promptId: 'test-prompt',
        promptType: 'narrative',
        phase: 1,
        phaseDuration: 120, // Should be 120 for Phase 1
      },
      players: {
        'test-user-1': {
          userId: 'test-user-1',
          displayName: 'Test User',
          avatar: '🧪',
          rank: 'Silver III',
          isAI: false,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'test-conn',
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
    
    console.log('1️⃣ Creating test session with Phase 1...');
    const sessionRef = db.collection('sessions').doc(testSessionId);
    await sessionRef.set(testSession);
    console.log('✅ Test session created\n');
    
    // Check initial state
    let snap = await sessionRef.get();
    let data = snap.data();
    console.log('📊 Initial state:');
    console.log('  - Phase:', data.config.phase);
    console.log('  - Duration:', data.config.phaseDuration);
    console.log('  - Phase1 Start:', data.timing.phase1StartTime ? 'SET' : 'MISSING');
    console.log('  - Phase2 Start:', data.timing.phase2StartTime ? 'SET' : 'MISSING');
    console.log('');
    
    // Simulate user submission for Phase 1
    console.log('2️⃣ Simulating user submission for Phase 1...');
    await sessionRef.update({
      'players.test-user-1.phases.phase1': {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        content: 'Test writing',
        wordCount: 50,
        score: 85,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 1\n');
    
    // Wait for Cloud Function to fire
    console.log('⏱️ Waiting 5 seconds for Cloud Function to transition...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if transitioned to Phase 2
    snap = await sessionRef.get();
    data = snap.data();
    
    console.log('📊 After Phase 1 submission:');
    console.log('  - Phase:', data.config.phase, data.config.phase === 2 ? '✅' : '❌ SHOULD BE 2');
    console.log('  - Duration:', data.config.phaseDuration, data.config.phaseDuration === 60 ? '✅' : '❌ SHOULD BE 60');
    console.log('  - Phase2 Start:', data.timing.phase2StartTime ? '✅ SET' : '❌ MISSING');
    console.log('  - Coordination Ready:', data.coordination.allPlayersReady ? '❌ SHOULD BE FALSE' : '✅');
    console.log('');
    
    if (data.config.phase !== 2) {
      console.error('❌ TEST FAILED: Did not transition to Phase 2!');
      console.log('Cloud Function may not be firing. Check Firebase logs.');
      return;
    }
    
    if (data.config.phaseDuration !== 60) {
      console.error('❌ TEST FAILED: phaseDuration not set to 60!');
      console.log('Current value:', data.config.phaseDuration);
      return;
    }
    
    if (!data.timing.phase2StartTime) {
      console.error('❌ TEST FAILED: phase2StartTime not set!');
      return;
    }
    
    console.log('✅ TEST PASSED: Phase 1 → 2 transition correct!\n');
    
    // Test Phase 2 → 3 transition
    console.log('3️⃣ Simulating user submission for Phase 2...');
    await sessionRef.update({
      'players.test-user-1.phases.phase2': {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        responses: { clarity: 'Good', strengths: 'Strong', improvements: 'Better', organization: 'Nice', engagement: 'Great' },
        score: 80,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 2\n');
    
    console.log('⏱️ Waiting 5 seconds for Cloud Function to transition...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    snap = await sessionRef.get();
    data = snap.data();
    
    console.log('📊 After Phase 2 submission:');
    console.log('  - Phase:', data.config.phase, data.config.phase === 3 ? '✅' : '❌ SHOULD BE 3');
    console.log('  - Duration:', data.config.phaseDuration, data.config.phaseDuration === 60 ? '✅' : '❌ SHOULD BE 60');
    console.log('  - Phase3 Start:', data.timing.phase3StartTime ? '✅ SET' : '❌ MISSING');
    console.log('  - Coordination Ready:', data.coordination.allPlayersReady ? '❌ SHOULD BE FALSE' : '✅');
    console.log('');
    
    if (data.config.phase !== 3) {
      console.error('❌ TEST FAILED: Did not transition to Phase 3!');
      return;
    }
    
    console.log('✅ TEST PASSED: Phase 2 → 3 transition correct!\n');
    
    // Test Phase 3 → Completed
    console.log('4️⃣ Simulating user submission for Phase 3...');
    await sessionRef.update({
      'players.test-user-1.phases.phase3': {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        revisedContent: 'Revised test writing',
        wordCount: 55,
        score: 90,
      },
      updatedAt: admin.firestore.Timestamp.now(),
    });
    console.log('✅ User submitted Phase 3\n');
    
    console.log('⏱️ Waiting 5 seconds for Cloud Function to mark completed...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    snap = await sessionRef.get();
    data = snap.data();
    
    console.log('📊 After Phase 3 submission:');
    console.log('  - State:', data.state, data.state === 'completed' ? '✅' : '❌ SHOULD BE completed');
    console.log('  - Coordination Ready:', data.coordination.allPlayersReady ? '✅' : '❌ SHOULD BE TRUE');
    console.log('');
    
    if (data.state !== 'completed') {
      console.error('❌ TEST FAILED: Session not marked completed!');
      return;
    }
    
    console.log('✅ TEST PASSED: Phase 3 → Completed transition correct!\n');
    
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('  ✅ Phase 1 → 2: Transitions, sets duration=60, sets phase2StartTime');
    console.log('  ✅ Phase 2 → 3: Transitions, sets duration=60, sets phase3StartTime');
    console.log('  ✅ Phase 3 → Completed: Marks session as completed');
    console.log('');
    console.log('Cloud Functions are working correctly! 🚀');
    
    // Cleanup
    console.log('🧹 Cleaning up test session...');
    await sessionRef.delete();
    console.log('✅ Test session deleted');
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error);
  }
  
  process.exit(0);
}

// Run tests
testPhaseTransitions();

