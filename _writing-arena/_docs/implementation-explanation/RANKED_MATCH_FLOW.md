# Ranked Match Flow - Complete Explanation

> **Document Purpose**: Comprehensive explanation of how ranked matches work from entry to results

---

## 🎯 TL;DR - The Absolute Basics

A ranked match is a **competitive 3-phase writing competition** where 5 players (real + AI) compete:
1. **Phase 1 (4 min)**: Everyone writes on the same prompt
2. **Phase 2 (3 min)**: Everyone reviews another player's writing
3. **Phase 3 (3 min)**: Everyone revises their original writing based on feedback

After each phase, **Claude AI ranks all submissions** to determine scores. At the end, players are ranked by composite score and earn/lose LP (League Points) based on placement.

---

## 📊 HIGH-LEVEL OVERVIEW

### The Journey

```
User Flow:
┌─────────────────┐
│  Dashboard      │ User clicks "Ranked Match"
└────────┬────────┘
         ↓
┌─────────────────┐
│  Matchmaking    │ Choose: Wait for players OR Play with AI
└────────┬────────┘
         ↓
┌─────────────────┐
│  Lobby          │ 5 players gather (mix of real + AI)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 1        │ Writing (4 minutes for Silver)
│  [Session]      │ → Auto-submit → Batch Ranking (Claude AI)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 2        │ Peer Feedback (3 minutes)
│  [Session]      │ → Auto-submit → Batch Ranking (Claude AI)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 3        │ Revision (3 minutes)
│  [Session]      │ → Auto-submit → Batch Ranking (Claude AI)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Results        │ Rankings, LP change, XP earned
└─────────────────┘
```

### Key Components

1. **Matchmaking System**: Finds/creates matches, manages queue, fills with AI
2. **Session Manager**: Creates and tracks game sessions in Firestore
3. **Session Orchestrator**: Cloud Function that handles phase transitions
4. **Batch Ranking**: Claude AI evaluates all submissions together for fairness
5. **Results Calculator**: Determines placement, LP/XP rewards, rank changes

### Core Architecture

- **Client**: Next.js React components (UI, state management)
- **Database**: Firebase Firestore (real-time session data)
- **Backend**: Firebase Cloud Functions (phase orchestration)
- **AI**: Claude API (Anthropic) for evaluation and ranking

---

## 🔍 MEDIUM-LEVEL EXPLANATION

### Stage 1: Entry & Matchmaking

**Entry Point**: `/ranked/matchmaking/page.tsx`

**User Choice**:
1. **"Wait for Players"**: Join matchmaking queue, wait for real players
2. **"Compete Against AI"**: Instant match with 4 AI opponents

**Matchmaking Logic**:
- Creates or joins a `GameSession` in Firestore (`/sessions/{sessionId}`)
- Session state: `forming` → waiting for players
- If waiting: Joins queue, listens for other players
- After 15 seconds: Starts backfilling with AI students
- When 5 players gathered: 3-second countdown → Start!

**Key Files**:
- `components/ranked/MatchmakingContent.tsx` - Main orchestration
- `lib/services/matchmaking-queue.ts` - Queue operations
- `lib/services/session-manager.ts` - Session creation/management
- `lib/services/ai-students.ts` - Fetches AI opponents

### Stage 2: Session Creation

**What Gets Created**:

```typescript
GameSession {
  sessionId: "session-123..."
  matchId: "match-456..."
  mode: "ranked"
  state: "forming" → "active" → "completed"
  
  config: {
    trait: "all"
    promptId: "prompt-narrative-sunset"
    promptType: "narrative"
    phase: 1 | 2 | 3
    phaseDuration: 240 // seconds (rank-based)
  }
  
  players: {
    "user-abc": SessionPlayer,
    "ai-student-1": SessionPlayer,
    ...
  }
  
  timing: {
    phase1StartTime: Timestamp
    phase2StartTime: Timestamp // Set after batch ranking
    phase3StartTime: Timestamp // Set after batch ranking
  }
}
```

**Session State Machine**:
```
forming → active (phase 1) → active (phase 2) → active (phase 3) → completed
```

### Stage 3: Phase 1 - Writing

**Component**: `components/ranked/WritingSessionContent.tsx`

**Flow**:
1. Display writing prompt
2. Show TWR (Think-Write-Read) planning phase (optional)
3. User writes in editor, word count updates live
4. Timer counts down from 4 minutes (Silver rank)
5. AI opponents generate writings in background
6. When timer hits 0: Auto-submit

**Submission Process**:
1. User's writing submitted to session
2. Wait for AI writings to be ready
3. **Batch Ranking**: Send all writings to `/api/batch-rank-writings`
   - Claude evaluates all 5 writings together
   - Returns rankings with scores (0-100)
4. Store rankings in `matchStates/{matchId}/rankings.phase1`
5. Update session with user's score
6. Cloud Function detects all submitted → Transitions to Phase 2

**Key Innovation**: Batch ranking ensures fair comparison since all submissions are evaluated together.

### Stage 4: Phase 2 - Peer Feedback

**Component**: `components/ranked/PeerFeedbackContent.tsx`

**Flow**:
1. Fetch assigned peer's writing (round-robin assignment)
2. Display peer's Phase 1 writing
3. User provides structured feedback:
   - Main idea
   - Strength
   - Suggestion for improvement
4. Timer counts down from 3 minutes
5. AI opponents generate feedback in background
6. When timer hits 0: Auto-submit

**Peer Assignment Logic**:
```typescript
// Round-robin: Each player reviews the next player's work
playerIndex → (playerIndex + 1) % totalPlayers
```

**Submission Process**:
1. User's feedback submitted
2. Wait for AI feedback to be ready
3. **Batch Ranking**: Send all feedback to `/api/batch-rank-feedback`
   - Claude evaluates quality of feedback given
4. Transition to Phase 3

### Stage 5: Phase 3 - Revision

**Component**: `components/ranked/RevisionContent.tsx`

**Flow**:
1. Display original Phase 1 writing
2. Generate AI feedback on user's writing
3. Show peer feedback received from Phase 2
4. User revises their original writing
5. Timer counts down from 3 minutes
6. AI opponents generate revisions in background
7. When timer hits 0: Auto-submit

**Validation**:
- Detects if no changes made (penalized)
- Detects empty submission (score = 0)
- Compares improvement over original

**Submission Process**:
1. Revised writing submitted
2. **Batch Ranking**: Send all revisions to `/api/batch-rank-revisions`
   - Claude evaluates improvement and final quality
3. Session state → `completed`
4. Navigate to results

### Stage 6: Results & Scoring

**Component**: `components/ranked/ResultsContent.tsx`

**Calculations**:

```typescript
// Composite Score (overall performance)
compositeScore = (phase1Score + phase2Score + phase3Score) / 3

// Rank all players by composite score
rankings = rankPlayers(allPlayers, 'compositeScore')

// LP Change based on placement
1st place: +35 LP
2nd place: +22 LP
3rd place: +12 LP
4th place: -5 LP
5th place: -15 LP

// Additional rewards
xpEarned = calculateXPEarned(compositeScore, 'ranked')
pointsEarned = calculatePointsEarned(compositeScore, placement)
improvementBonus = (revisionScore - originalScore) * 0.5
```

**Database Updates**:
1. Save session to writing history
2. Update user stats (XP, points, LP, rank)
3. Update AI student stats (they also rank up/down)
4. Check for rank promotion/demotion

**Rank Promotion**:
```typescript
if (newLP >= 100) {
  promote rank (e.g., Silver III → Silver II)
  LP = newLP - 100
}
```

---

## 🔧 LOW-LEVEL IMPLEMENTATION DETAILS

### Detailed Component Breakdown

#### 1. Matchmaking System

**File**: `components/ranked/MatchmakingContent.tsx`

**State Management**:
```typescript
const [players, setPlayers] = useState([user])
const [currentSessionId, setCurrentSessionId] = useState(null)
const [countdown, setCountdown] = useState(null)
const [selectedAIStudents, setSelectedAIStudents] = useState([])
```

**Two Matchmaking Paths**:

**Path A: Wait for Real Players**
```typescript
useEffect(() => {
  if (startChoice !== 'wait') return;
  
  // 1. Join matchmaking queue
  await joinQueue(userId, displayName, avatar, rank, rankLP, trait);
  
  // 2. Create/join session
  const session = await findOrJoinSession(userId, playerInfo, trait);
  setCurrentSessionId(session.sessionId);
  
  // 3. Listen for other players joining queue
  const unsubscribe = listenToQueue(trait, userId, (queuePlayers) => {
    // Add real players to lobby
    queuePlayers.forEach(async (player) => {
      await addPlayerToSession(sessionId, player.userId, playerInfo);
    });
    setPlayers(realPlayers);
  });
  
  // 4. After 15 seconds, start backfilling with AI
  setTimeout(() => {
    const aiStudents = await getRandomAIStudents(userRank, 4);
    // Add AI players gradually (one every 5 seconds)
    setInterval(() => {
      if (players.length < 5) {
        addAIPlayer();
      }
    }, 5000);
  }, 15000);
}, [startChoice]);
```

**Path B: Instant AI Match**
```typescript
useEffect(() => {
  if (startChoice !== 'ai') return;
  
  // 1. Create session
  const session = await findOrJoinSession(userId, playerInfo, trait);
  
  // 2. Fill with AI immediately
  await fillLobbyWithAI(session.sessionId);
}, [startChoice]);

const fillLobbyWithAI = async (sessionId) => {
  const aiStudents = await getRandomAIStudents(userRank, 4);
  
  // Add all 4 AI students at once
  await Promise.all(
    aiStudents.map(ai => 
      addPlayerToSession(sessionId, ai.id, ai.playerInfo, true)
    )
  );
  
  setPlayers([user, ...aiStudents]);
};
```

**Starting the Match**:
```typescript
useEffect(() => {
  if (players.length >= 5 && !countdown) {
    partyLockedRef.current = true;
    finalPlayersRef.current = [...players];
    
    // Leave queue
    await leaveQueue(userId);
    
    // 3-second countdown
    setCountdown(3);
  }
}, [players]);

useEffect(() => {
  if (countdown === 0) {
    const randomPrompt = getRandomPromptForRank(userRank);
    
    // Start the session (sets Phase 1 start time)
    await startSession(
      currentSessionId,
      randomPrompt.id,
      randomPrompt.type,
      SCORING.PHASE1_DURATION,
      userRank
    );
    
    // Navigate to session
    router.push(`/session/${currentSessionId}`);
  }
}, [countdown]);
```

#### 2. Session Manager Deep Dive

**File**: `lib/services/session-manager.ts`

**Core Methods**:

**Finding/Creating Session**:
```typescript
async findOrJoinSession(userId, playerInfo, trait) {
  // Try to find existing forming session
  const query = query(
    collection('sessions'),
    where('state', '==', 'forming'),
    where('config.trait', '==', trait),
    limit(1)
  );
  
  const snapshot = await getDocs(query);
  
  if (!snapshot.empty) {
    // Join existing session
    const sessionId = snapshot.docs[0].id;
    await addPlayerToSession(sessionId, userId, playerInfo);
    return await joinSession(sessionId, userId, playerInfo);
  }
  
  // Create new session
  return await createFormingSession(userId, playerInfo, trait);
}
```

**Starting Session (Phase 1)**:
```typescript
async startSession(sessionId, promptId, promptType, phaseDuration, userRank) {
  // Calculate rank-based duration
  const actualDuration = userRank 
    ? getRankPhaseDuration(userRank, 1)
    : phaseDuration;
  
  await updateDoc(sessionRef, {
    'state': 'active',
    'config.promptId': promptId,
    'config.promptType': promptType,
    'config.phaseDuration': actualDuration,
    'timing.phase1StartTime': serverTimestamp(), // Timer starts NOW
    updatedAt: serverTimestamp()
  });
}
```

**Heartbeat System**:
```typescript
// Every 5 seconds, update player status
private startHeartbeat() {
  this.heartbeatInterval = setInterval(async () => {
    await updateDoc(sessionRef, {
      [`players.${userId}.lastHeartbeat`]: serverTimestamp(),
      [`players.${userId}.status`]: 'connected'
    });
  }, 5000);
}
```

**Real-time Sync**:
```typescript
private listenToSession() {
  onSnapshot(sessionRef, (snapshot) => {
    const session = snapshot.data();
    
    // Detect phase change
    if (previousPhase !== session.config.phase) {
      emit('onPhaseTransition', session.config.phase);
    }
    
    // Detect player status changes
    for (const player of session.players) {
      if (player.status !== previousStatus) {
        emit('onPlayerStatusChange', userId, player.status);
      }
    }
    
    emit('onSessionUpdate', session);
  });
}
```

**Timer Calculation**:
```typescript
getPhaseTimeRemaining(): number {
  const { config, timing } = this.currentSession;
  const phase = config.phase;
  
  // Get start time for current phase
  const startTime = 
    phase === 1 ? timing.phase1StartTime :
    phase === 2 ? timing.phase2StartTime :
    timing.phase3StartTime;
  
  if (!startTime) {
    // Start time not set yet (waiting for batch ranking)
    return config.phaseDuration; // Return full duration
  }
  
  // Calculate elapsed time
  const elapsed = Date.now() - startTime.toMillis();
  const remaining = config.phaseDuration - Math.floor(elapsed / 1000);
  
  return Math.max(0, remaining);
}
```

#### 3. Cloud Function Orchestration

**File**: `functions/session-orchestrator.ts`

**Trigger**: Firestore `onUpdate` for `/sessions/{sessionId}`

**Phase Transition Logic**:
```typescript
export const onPlayerSubmission = functions.firestore
  .document('sessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const currentPhase = after.config.phase;
    
    // Count submissions for current phase
    const players = Object.values(after.players);
    const realPlayers = players.filter(p => !p.isAI);
    const submitted = realPlayers.filter(p => 
      p.phases[`phase${currentPhase}`]?.submitted
    );
    
    // All real players submitted?
    if (submitted.length === realPlayers.length) {
      // Transition immediately (no delay)
      await transitionToNextPhase(sessionId, currentPhase);
    }
  });
```

**Transition Implementation**:
```typescript
async function transitionToNextPhase(sessionId, currentPhase) {
  const session = await getDoc(sessionRef);
  const averageRank = getAverageRank(session.players);
  
  if (currentPhase === 1) {
    // Phase 1 → Phase 2
    const duration = getRankPhaseDuration(averageRank, 2);
    
    await updateDoc(sessionRef, {
      'config.phase': 2,
      'config.phaseDuration': duration,
      // NOTE: phase2StartTime NOT set here!
      // Will be set by client after batch ranking completes
      'coordination.allPlayersReady': false,
      'state': 'active'
    });
  }
  else if (currentPhase === 2) {
    // Phase 2 → Phase 3
    const duration = getRankPhaseDuration(averageRank, 3);
    
    await updateDoc(sessionRef, {
      'config.phase': 3,
      'config.phaseDuration': duration,
      // NOTE: phase3StartTime NOT set here!
      'coordination.allPlayersReady': false,
      'state': 'active'
    });
  }
  else if (currentPhase === 3) {
    // Phase 3 → Complete
    await updateDoc(sessionRef, {
      'state': 'completed',
      'coordination.allPlayersReady': true
    });
  }
}
```

**Rank Calculation**:
```typescript
function getAverageRank(players) {
  const ranks = [];
  
  for (const [_userId, player] of Object.entries(players)) {
    if (player.rank && !player.isAI) {
      ranks.push(player.rank);
    }
  }
  
  if (ranks.length === 0) return null;
  
  // Use median rank for stability
  ranks.sort();
  const medianIndex = Math.floor(ranks.length / 2);
  return ranks[medianIndex];
}
```

#### 4. Batch Ranking System

**Hook**: `lib/hooks/useBatchRankingSubmission.ts`

**Complete Flow**:
```typescript
const { submit } = useBatchRankingSubmission({
  phase: 1,
  matchId: 'match-123',
  sessionId: 'session-456',
  userId: 'user-abc',
  endpoint: '/api/batch-rank-writings',
  firestoreKey: 'aiWritings.phase1',
  rankingsKey: 'rankings.phase1',
  prepareUserSubmission: () => userWriting,
  prepareSubmissionData: (score) => ({ content, wordCount, score }),
  submitPhase: async (phase, data) => { /* Submit to session */ },
  validateSubmission: () => ({ isValid: true }),
  fallbackEvaluation: async () => { /* Fallback if batch fails */ }
});

async function submit() {
  // 1. Validate submission
  const validation = validateSubmission();
  if (!validation.isValid) {
    if (validation.isEmpty) {
      await submitPhase(phase, { ...emptyData, score: 0 });
      return;
    }
  }
  
  // 2. Wait for AI submissions (retry with backoff)
  let aiSubmissions = [];
  await retryWithBackoff(async () => {
    const matchDoc = await getDoc(matchRef);
    aiSubmissions = getNestedValue(matchDoc.data(), firestoreKey);
    
    if (!aiSubmissions || aiSubmissions.length === 0) {
      throw new Error('AI submissions not ready');
    }
  }, { maxAttempts: 10, delayMs: 1000 });
  
  // 3. Combine all submissions
  const userSubmission = prepareUserSubmission();
  const allSubmissions = [userSubmission, ...aiSubmissions];
  
  // 4. Call batch ranking API
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      writings: allSubmissions,
      prompt: matchState.prompt,
      promptType: matchState.promptType,
      trait: matchState.trait
    })
  });
  
  const { rankings } = await response.json();
  
  // 5. Extract user's score
  const yourRanking = rankings.find(r => r.playerId === userId);
  const score = yourRanking.score;
  
  // 6. Store rankings and feedback
  await updateDoc(matchRef, {
    [rankingsKey]: rankings,
    [`feedback.${userId}.phase${phase}`]: {
      strengths: yourRanking.strengths,
      improvements: yourRanking.improvements,
      traitFeedback: yourRanking.traitFeedback
    }
  });
  
  // 7. **TIMING FIX**: Set start time for next phase
  const nextPhase = phase + 1;
  if (nextPhase === 2 || nextPhase === 3) {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      [`timing.phase${nextPhase}StartTime`]: serverTimestamp()
    });
    console.log(`✅ Set phase ${nextPhase} start time after ranking`);
  }
  
  // 8. Submit to session
  await submitPhase(phase, prepareSubmissionData(score));
}
```

**API Endpoint**: `/api/batch-rank-writings/route.ts`

```typescript
export async function POST(request) {
  const { writings, prompt, promptType, trait } = await request.json();
  
  // 1. Build prompt for Claude
  const systemPrompt = getPhase1WritingPrompt(writings, prompt, promptType, trait);
  
  // 2. Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: systemPrompt
      }]
    })
  });
  
  const data = await response.json();
  const claudeResponse = data.content[0].text;
  
  // 3. Parse rankings from Claude's response
  const rankings = parseRankings(claudeResponse, writings);
  
  // 4. Return rankings
  return NextResponse.json({ rankings });
}
```

**Claude Prompt Structure**:
```typescript
function getPhase1WritingPrompt(writings, prompt, promptType, trait) {
  return `
You are an expert writing evaluator for elementary students.

# Context
- Writing Prompt: "${prompt}"
- Prompt Type: ${promptType}
- Trait Focus: ${trait}

# Submissions
${writings.map((w, i) => `
## Writer ${i + 1} (${w.playerName})
${w.content}
`).join('\n')}

# Task
Rank these ${writings.length} submissions from best to worst.
For each submission, provide:
- rank: 1-${writings.length}
- score: 0-100
- strengths: Array of 3 specific strengths
- improvements: Array of 3 specific suggestions
- traitFeedback: Detailed feedback for each writing trait

# Response Format (JSON)
\`\`\`json
{
  "rankings": [
    {
      "writerIndex": 0,
      "rank": 1,
      "score": 87,
      "strengths": ["...", "...", "..."],
      "improvements": ["...", "...", "..."],
      "traitFeedback": {
        "content": "...",
        "organization": "...",
        "grammar": "...",
        "vocabulary": "...",
        "mechanics": "..."
      }
    }
  ]
}
\`\`\`
  `;
}
```

#### 5. Timing Fix (Client-Side Workaround)

**Problem**: Deployed Cloud Function sets 90-second durations instead of rank-based durations for Phases 2 and 3.

**Solution**: Client-side detection and correction in each phase component.

**Implementation** (added to all three phase components):

```typescript
// Fix incorrect phase duration set by Cloud Function
useEffect(() => {
  if (!session || !user || !userProfile || !sessionId) return;
  
  const currentPhase = session.config.phase;
  const currentDuration = session.config.phaseDuration;
  const expectedDuration = getPhaseDuration(
    userProfile.currentRank || 'Silver III', 
    currentPhase
  );
  
  // If Cloud Function set wrong duration, fix it
  if (currentDuration !== expectedDuration) {
    console.warn(
      `⚠️ Phase ${currentPhase} duration mismatch: ` +
      `${currentDuration}s (actual) vs ${expectedDuration}s (expected). Fixing...`
    );
    
    const sessionRef = doc(db, 'sessions', sessionId);
    updateDoc(sessionRef, {
      'config.phaseDuration': expectedDuration
    }).catch(err => console.error('Failed to fix duration:', err));
  }
}, [
  session?.config.phase, 
  session?.config.phaseDuration, 
  userProfile?.currentRank, 
  sessionId, 
  user, 
  userProfile
]);
```

**Why This Works**:
1. Runs on every phase component mount
2. Detects mismatch between deployed duration (90s) and expected duration (180s)
3. Immediately updates Firestore with correct duration
4. Timer recalculates with new duration
5. User gets full time allocation

#### 6. Rank-Based Timing

**File**: `lib/constants/rank-timing.ts`

**Configuration**:
```typescript
export const RANK_TIMING = {
  bronze: {
    phase1: 180,  // 3 minutes
    phase2: 150,  // 2.5 minutes
    phase3: 150,  // 2.5 minutes
  },
  silver: {
    phase1: 240,  // 4 minutes
    phase2: 180,  // 3 minutes
    phase3: 180,  // 3 minutes
  },
  gold: {
    phase1: 300,  // 5 minutes
    phase2: 210,  // 3.5 minutes
    phase3: 210,  // 3.5 minutes
  },
  platinum: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  diamond: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  master: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
};
```

**Usage**:
```typescript
export function getPhaseDuration(rank: string, phase: 1 | 2 | 3): number {
  const tier = getRankTier(rank); // 'Silver III' → 'silver'
  const config = RANK_TIMING[tier];
  
  switch (phase) {
    case 1: return config.phase1;
    case 2: return config.phase2;
    case 3: return config.phase3;
  }
}
```

#### 7. Auto-Submit Hook

**File**: `lib/hooks/useAutoSubmit.ts`

**Purpose**: Automatically submit when timer reaches 0

```typescript
export function useAutoSubmit({
  timeRemaining,
  hasSubmitted,
  onSubmit,
  minPhaseAge = 5000,
  isSessionReady
}) {
  const submittedRef = useRef(false);
  const phaseStartTimeRef = useRef(Date.now());
  
  // Reset when phase changes
  useEffect(() => {
    phaseStartTimeRef.current = Date.now();
    submittedRef.current = false;
  }, [session?.config.phase]);
  
  // Check for auto-submit
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      !hasSubmitted() &&
      !submittedRef.current &&
      isSessionReady()
    ) {
      // Ensure phase has been active for at least minPhaseAge
      const phaseAge = Date.now() - phaseStartTimeRef.current;
      
      if (phaseAge >= minPhaseAge) {
        submittedRef.current = true;
        onSubmit();
      }
    }
  }, [timeRemaining, hasSubmitted, onSubmit, minPhaseAge, isSessionReady]);
}
```

**Why minPhaseAge?**: Prevents auto-submit on page load if reconnecting to an expired phase.

#### 8. AI Generation

**Phase 1 - AI Writing Generation**:

```typescript
useEffect(() => {
  if (!session || aiWritingsGenerated) return;
  
  const generateAIWritings = async () => {
    const aiPlayers = players.filter(p => p.isAI);
    
    // Generate writing for each AI player
    const writings = await Promise.all(
      aiPlayers.map(async (ai) => {
        const response = await fetch('/api/generate-ai-writing', {
          method: 'POST',
          body: JSON.stringify({
            prompt: prompt.description,
            promptType: prompt.type,
            rank: ai.rank,
            playerName: ai.displayName
          })
        });
        
        const data = await response.json();
        return {
          playerId: ai.userId,
          playerName: ai.displayName,
          content: data.content,
          wordCount: data.wordCount,
          isAI: true,
          rank: ai.rank
        };
      })
    );
    
    // Store in matchStates for batch ranking
    await updateDoc(matchRef, {
      'aiWritings.phase1': writings
    });
    
    // Submit each AI after random delay (5-15 seconds)
    aiPlayers.forEach((ai, index) => {
      const delay = 5000 + Math.random() * 10000;
      
      setTimeout(async () => {
        await updateDoc(sessionRef, {
          [`players.${ai.userId}.phases.phase1`]: {
            submitted: true,
            submittedAt: serverTimestamp(),
            content: writings[index].content,
            wordCount: writings[index].wordCount,
            score: 60 + Math.random() * 30
          }
        });
      }, delay);
    });
  };
  
  generateAIWritings();
}, [session, aiWritingsGenerated]);
```

**Similar patterns for Phase 2 (Feedback) and Phase 3 (Revision)**

#### 9. Results Calculation

**File**: `components/ranked/ResultsContent.tsx`

**Score Calculations**:
```typescript
// Composite Score
function calculateCompositeScore(p1, p2, p3) {
  return (p1 + p2 + p3) / 3;
}

// LP Change by Placement
function calculateLPChange(placement) {
  const LP_REWARDS = {
    1: 35,   // 1st place
    2: 22,   // 2nd place
    3: 12,   // 3rd place
    4: -5,   // 4th place
    5: -15   // 5th place
  };
  return LP_REWARDS[placement] || 0;
}

// XP Earned
function calculateXPEarned(compositeScore, mode) {
  const baseXP = mode === 'ranked' ? 100 : 50;
  const scoreMultiplier = compositeScore / 100;
  return Math.round(baseXP * scoreMultiplier);
}

// Points Earned
function calculatePointsEarned(compositeScore, placement) {
  const basePoints = compositeScore;
  const placementBonus = {
    1: 50, 2: 30, 3: 15, 4: 0, 5: -10
  }[placement] || 0;
  return Math.round(basePoints + placementBonus);
}

// Improvement Bonus
function calculateImprovementBonus(originalScore, revisionScore) {
  const improvement = revisionScore - originalScore;
  return Math.max(0, improvement) * 0.5;
}
```

**Ranking Logic**:
```typescript
// Rank all players by composite score
const allPlayers = [
  {
    name: 'You',
    phase1: writingScore,
    phase2: feedbackScore,
    phase3: revisionScore,
    compositeScore: calculateCompositeScore(p1, p2, p3),
    isYou: true
  },
  ...aiPlayers.map(ai => ({
    name: ai.name,
    phase1: ai.phase1Score,
    phase2: ai.phase2Score,
    phase3: ai.phase3Score,
    compositeScore: calculateCompositeScore(ai.p1, ai.p2, ai.p3),
    isYou: false
  }))
];

// Sort by composite score (highest first)
const rankings = rankPlayers(allPlayers, 'compositeScore');

// Your placement
const yourRank = getPlayerRank(rankings, userId);
```

**Rank Promotion/Demotion**:
```typescript
// Update user's LP
const newLP = currentLP + lpChange;

if (newLP >= 100) {
  // Promote!
  currentRank = promoteRank(currentRank);  // 'Silver III' → 'Silver II'
  rankLP = newLP - 100;
} else if (newLP < 0) {
  // Demote!
  currentRank = demoteRank(currentRank);  // 'Silver III' → 'Silver IV'
  rankLP = 100 + newLP;
} else {
  rankLP = newLP;
}

function promoteRank(rank) {
  const [tier, division] = rank.split(' ');  // ['Silver', 'III']
  const divNum = ['I', 'II', 'III', 'IV'].indexOf(division);
  
  if (divNum === 0) {
    // Promote tier! Silver I → Gold IV
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
    const tierIndex = tiers.indexOf(tier);
    return `${tiers[tierIndex + 1]} IV`;
  } else {
    // Promote division: Silver III → Silver II
    return `${tier} ${['I', 'II', 'III', 'IV'][divNum - 1]}`;
  }
}
```

**Database Updates**:
```typescript
// Save writing session
await saveWritingSession({
  userId,
  mode: 'ranked',
  trait,
  promptType,
  content: originalContent,
  wordCount,
  score: compositeScore,
  traitScores: {...},
  xpEarned,
  pointsEarned,
  lpChange,
  placement: yourRank,
  timestamp: new Date(),
  matchId
});

// Update user stats
await updateUserStatsAfterSession(
  userId,
  xpEarned,
  pointsEarned,
  lpChange,
  isVictory,
  wordCount
);

// Update AI student stats
for (const aiPlayer of aiPlayers) {
  await updateAIStudentAfterMatch(
    aiPlayer.userId,
    aiLPChange,
    aiXP,
    aiIsWin,
    aiWordCount
  );
}
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Cloud Function 90-Second Bug

**Problem**: Deployed Cloud Function sets 90-second durations for Phases 2 & 3 instead of rank-based durations (180s for Silver).

**Root Cause**: Old deployed code has hardcoded values:
```typescript
updates['config.phaseDuration'] = 90; // ❌ Hardcoded
```

**Workaround**: Client-side duration fix (implemented in all phase components)

**Proper Fix**: Redeploy Cloud Functions with updated code

### Issue 2: Timing Fix Implementation

**Original Problem**: Timer started before batch ranking completed, so users lost 60-90 seconds per phase.

**Solution**: Phase start times are now set **after** batch ranking completes instead of immediately on phase transition.

**Implementation**:
1. Cloud Function transitions phase but **doesn't set start time**
2. Client completes batch ranking (60-90 seconds)
3. Client sets start time via `useBatchRankingSubmission`
4. Timer starts with full duration

---

## 📚 Key Files Reference

### Entry & Matchmaking
- `app/ranked/matchmaking/page.tsx` - Route wrapper
- `components/ranked/MatchmakingContent.tsx` - Main matchmaking logic
- `components/ranked/MatchmakingLobby.tsx` - Lobby UI
- `components/ranked/MatchmakingStartModal.tsx` - AI vs Real choice modal

### Session Management
- `lib/services/session-manager.ts` - Core session operations
- `lib/hooks/useSession.ts` - React hook for sessions
- `lib/hooks/useSessionData.ts` - Helper hook for session data
- `lib/types/session.ts` - TypeScript types

### Phase Components
- `components/ranked/WritingSessionContent.tsx` - Phase 1
- `components/ranked/PeerFeedbackContent.tsx` - Phase 2
- `components/ranked/RevisionContent.tsx` - Phase 3
- `components/ranked/ResultsContent.tsx` - Final results

### Cloud Functions
- `functions/session-orchestrator.ts` - Phase transitions

### Batch Ranking
- `lib/hooks/useBatchRankingSubmission.ts` - Ranking hook
- `app/api/batch-rank-writings/route.ts` - Phase 1 ranking API
- `app/api/batch-rank-feedback/route.ts` - Phase 2 ranking API
- `app/api/batch-rank-revisions/route.ts` - Phase 3 ranking API
- `lib/prompts/grading-prompts.ts` - Claude AI prompts

### Configuration
- `lib/constants/rank-timing.ts` - Rank-based durations
- `lib/constants/scoring.ts` - Score constants
- `lib/utils/score-calculator.ts` - LP/XP calculations

### Utilities
- `lib/services/matchmaking-queue.ts` - Queue operations
- `lib/services/ai-students.ts` - AI opponent management
- `lib/hooks/useAutoSubmit.ts` - Auto-submit on timer expiry

---

## 🔄 Complete Timeline Example

**User**: Silver II player starting a ranked match

```
T=0s:     Click "Ranked Match" → Navigate to /ranked/matchmaking
T=1s:     Modal appears: "Wait for Players" or "Compete Against AI"
T=2s:     User selects "Compete Against AI"
T=3s:     Session created (state: forming)
T=4s:     4 AI students fetched and added to session
T=5s:     5 players ready → 3-second countdown
T=8s:     startSession() called → Phase 1 begins
          - phase1StartTime set to NOW
          - phaseDuration = 240 seconds (4 minutes)
          - Navigate to /session/{sessionId}

--- PHASE 1: WRITING ---
T=8s:     WritingSessionContent renders
T=10s:    AI writings generation starts in background
T=20s:    User starts writing
T=248s:   Timer hits 0 → Auto-submit triggered
T=249s:   User writing submitted to session
T=250s:   Wait for AI writings (retry with backoff)
T=252s:   All writings ready → Batch ranking API call
T=252-310s: Claude evaluates 5 writings together (58 seconds)
T=310s:   Rankings received → User score: 82/100
T=311s:   Store rankings in matchStates
T=312s:   **Set phase2StartTime = NOW** (timing fix!)
T=313s:   Submit to session with score
T=314s:   Cloud Function detects all submitted → Transitions to Phase 2

--- PHASE 2: PEER FEEDBACK ---
T=315s:   PeerFeedbackContent renders
T=316s:   Duration fix detects/corrects any mismatch
T=317s:   Fetch assigned peer's writing
T=320s:   Display peer's Phase 1 writing
T=325s:   User starts providing feedback
T=495s:   Timer hits 0 → Auto-submit
T=496s:   Feedback submitted
T=497-555s: Batch ranking feedback (58 seconds)
T=555s:   **Set phase3StartTime = NOW** (timing fix!)
T=556s:   Submit with score
T=557s:   Cloud Function transitions to Phase 3

--- PHASE 3: REVISION ---
T=558s:   RevisionContent renders
T=559s:   Duration fix ensures correct time
T=560s:   Display original writing + feedback
T=565s:   User starts revising
T=738s:   Timer hits 0 → Auto-submit
T=739s:   Revision submitted
T=740-798s: Batch ranking revisions (58 seconds)
T=798s:   All rankings complete
T=799s:   Submit with score
T=800s:   Cloud Function sets state: completed
T=801s:   Navigate to results

--- RESULTS ---
T=802s:   ResultsContent renders
T=803s:   Calculate composite score: (82 + 78 + 85) / 3 = 81.67
T=804s:   Rank all players by composite
T=805s:   User placement: 2nd out of 5
T=806s:   Calculate rewards:
          - LP Change: +22
          - XP Earned: 82
          - Points: 112
T=807s:   Update database (user stats, AI stats, history)
T=808s:   Display results with animations
```

**Total Time**: ~13.5 minutes (4 min writing + 3 min feedback + 3 min revision + ~3.5 min for AI processing/transitions)

---

## 🎓 Learning Science Considerations

### Timing Rationale

**Why Rank-Based Timing?**
- Lower ranks need scaffolding and more time to organize thoughts
- Higher ranks can handle complexity and work faster
- Progressive difficulty matches cognitive development

**Timing Progression**:
| Rank | Writing | Feedback | Revision | Total |
|------|---------|----------|----------|-------|
| Bronze | 3 min | 2.5 min | 2.5 min | 8 min |
| Silver | 4 min | 3 min | 3 min | 10 min |
| Gold | 5 min | 3.5 min | 3.5 min | 12 min |
| Platinum+ | 6 min | 4 min | 4 min | 14 min |

### Phase Design

**Phase 1 (Writing)**: Generative thinking, organizing ideas, expressing thoughts

**Phase 2 (Peer Feedback)**: Analytical thinking, identifying strengths/weaknesses, constructive criticism

**Phase 3 (Revision)**: Metacognition, applying feedback, improving work

**Three-Question Feedback Format** (reduced from 5):
- Reduces cognitive load
- Focuses on essential elements
- Maintains quality while improving completion rates

---

## 🚀 Future Improvements

1. **Deploy Updated Cloud Functions**: Fix the 90-second bug at the source
2. **Real-time LP Updates**: Show LP changing during results animation
3. **Streak Bonuses**: Reward consecutive matches
4. **Rank Decay**: Prevent rank inflation over time
5. **Elo-Based Matchmaking**: Better skill matching
6. **Reconnection Handling**: Resume matches after disconnect
7. **Spectator Mode**: Watch other matches in progress
8. **Replay System**: Review past matches with annotations

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Maintained By**: Development Team


