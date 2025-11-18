/**
 * Quick Phase Timing Test
 * Rapid test to verify phase durations are correct
 * 
 * Run from functions directory:
 * cd functions && node ../test-scripts/quick-phase-test.js
 */

const admin = require('../functions/node_modules/firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'hour-college' });
}

const db = admin.firestore();

async function testPhaseDurations() {
  console.log('⚡ QUICK PHASE DURATION TEST\n');
  
  const sessionId = `quick-test-${Date.now()}`;
  const userId = 'test-user';
  
  try {
    // Create Phase 1 session
    console.log('1️⃣ Creating Phase 1 session (120s)...');
    const session = {
      sessionId,
      matchId: `match-${Date.now()}`,
      mode: 'ranked',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      config: {
        trait: 'all',
        promptId: 'test',
        promptType: 'narrative',
        phase: 1,
        phaseDuration: 120,
      },
      players: {
        [userId]: {
          userId,
          displayName: 'Test',
          avatar: '🧪',
          rank: 'Silver III',
          isAI: false,
          status: 'connected',
          lastHeartbeat: admin.firestore.Timestamp.now(),
          connectionId: 'test',
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
    
    const ref = db.collection('sessions').doc(sessionId);
    await ref.set(session);
    
    // Submit Phase 1
    console.log('📤 Submitting Phase 1...');
    await ref.update({
      [`players.${userId}.phases.phase1`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        content: 'Test',
        wordCount: 10,
        score: 75,
      },
    });
    
    // Wait and check Phase 2
    await new Promise(r => setTimeout(r, 3000));
    let data = (await ref.get()).data();
    
    console.log('\n2️⃣ Phase 2 Check:');
    console.log('   Phase:', data.config.phase, data.config.phase === 2 ? '✅' : '❌');
    console.log('   Duration:', data.config.phaseDuration, data.config.phaseDuration === 60 ? '✅' : '❌ SHOULD BE 60');
    console.log('   Phase2 Start:', data.timing.phase2StartTime ? '✅ SET' : '❌ MISSING');
    
    if (data.config.phase !== 2 || data.config.phaseDuration !== 60) {
      console.error('\n❌ PHASE 2 TIMING BROKEN!');
      await ref.delete();
      return;
    }
    
    // Submit Phase 2
    console.log('\n📤 Submitting Phase 2...');
    await ref.update({
      [`players.${userId}.phases.phase2`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        responses: {},
        score: 80,
      },
    });
    
    // Wait and check Phase 3
    await new Promise(r => setTimeout(r, 3000));
    data = (await ref.get()).data();
    
    console.log('\n3️⃣ Phase 3 Check:');
    console.log('   Phase:', data.config.phase, data.config.phase === 3 ? '✅' : '❌');
    console.log('   Duration:', data.config.phaseDuration, data.config.phaseDuration === 60 ? '✅' : '❌ SHOULD BE 60');
    console.log('   Phase3 Start:', data.timing.phase3StartTime ? '✅ SET' : '❌ MISSING');
    
    if (data.config.phase !== 3 || data.config.phaseDuration !== 60) {
      console.error('\n❌ PHASE 3 TIMING BROKEN!');
      await ref.delete();
      return;
    }
    
    // Submit Phase 3
    console.log('\n📤 Submitting Phase 3...');
    await ref.update({
      [`players.${userId}.phases.phase3`]: {
        submitted: true,
        submittedAt: admin.firestore.Timestamp.now(),
        revisedContent: 'Revised',
        wordCount: 12,
        score: 85,
      },
    });
    
    // Wait and check completion
    await new Promise(r => setTimeout(r, 3000));
    data = (await ref.get()).data();
    
    console.log('\n🏁 Completion Check:');
    console.log('   State:', data.state, data.state === 'completed' ? '✅' : '❌');
    
    if (data.state === 'completed') {
      console.log('\n🎉 ALL PHASE TIMING TESTS PASSED!');
      console.log('\nPhase Durations Were Correct:');
      console.log('  Phase 1: 120 seconds ✅');
      console.log('  Phase 2: 60 seconds ✅');
      console.log('  Phase 3: 60 seconds ✅');
      console.log('\nCloud Functions Working! 🔥');
    } else {
      console.error('\n❌ SESSION NOT COMPLETED');
    }
    
    // Cleanup
    await ref.delete();
    console.log('\n🧹 Test session cleaned up\n');
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
  }
  
  process.exit(0);
}

testPhaseDurations();

