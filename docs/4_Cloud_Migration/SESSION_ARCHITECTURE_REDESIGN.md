# Session Architecture Redesign - Comprehensive Analysis & Proposal

## Current Architecture - Critical Issues Identified

### 1. **Browser-Based Session Management (sessionStorage)**

#### Current Problems:
```typescript
// Scattered throughout codebase:
sessionStorage.setItem(`${matchId}-players`, JSON.stringify(players));
sessionStorage.setItem(`${matchId}-startTime`, now.toString());
sessionStorage.setItem(`${matchId}-content`, writingContent);
sessionStorage.setItem(`${matchId}-submitted`, 'true');
sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
```

**Issues:**
- ❌ **Lost on tab close**: sessionStorage clears when tab closes
- ❌ **Not shared across tabs**: User opens new tab = lost state
- ❌ **No server validation**: Anyone can manipulate localStorage
- ❌ **Browser refresh risk**: State restoration is fragile
- ❌ **Memory leaks**: Old match data never cleaned up
- ❌ **No synchronization**: Different tabs/devices have different state

### 2. **URL as State Container**

#### Current Problems:
```typescript
// Example from PeerFeedbackContent.tsx:
router.push(
  `/ranked/phase-rankings?phase=2&matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}&feedbackScore=${feedbackScore}&peerFeedback=${encodeURIComponent(JSON.stringify(responses))}`
);
```

**Issues:**
- ❌ **URL length limits**: Browser caps at ~2000 chars, can truncate data
- ❌ **Security risk**: Sensitive data visible in URLs, browser history
- ❌ **Poor UX**: Ugly, unreadable URLs
- ❌ **Not bookmarkable**: URLs with encoded data are not shareable
- ❌ **State leakage**: Data persists in browser history
- ❌ **Hard to debug**: Complex encoded parameters

### 3. **No Presence/Connection Management**

#### Current Problems:
- ❌ **No reconnection logic**: User refreshes = new matchId generated
- ❌ **Ghost players**: Disconnected users stay in match forever
- ❌ **No heartbeat**: Can't detect if user crashed/closed browser
- ❌ **Timeout-based coordination**: Leader/follower uses polling with timeouts
- ❌ **Race conditions**: Multiple clients making same decisions

### 4. **Fragile Leader-Follower Pattern**

#### Current Problems:
```typescript
// From WritingSessionContent.tsx:
if (!isLeader) {
  // Poll for match state to exist (max 15 seconds)
  let attempts = 0;
  const maxAttempts = 30;
  
  const waitForMatch = async (): Promise<void> => {
    const snap = await getDoc(matchRef);
    if (snap.exists()) return;
    
    attempts++;
    if (attempts >= maxAttempts) {
      // Fallback: create match ourselves
      await createMatchState(...);
    }
    setTimeout(() => waitForMatch(), 500);
  };
}
```

**Issues:**
- ❌ **Polling is inefficient**: 30 requests over 15 seconds
- ❌ **No leader handoff**: Leader disconnects = game stalls
- ❌ **Timeout fallbacks**: Can create duplicate match states
- ❌ **Network waste**: Constant polling drains bandwidth

---

## Proposed Architecture - Robust Session Management

### **Core Principles**
1. ✅ **Server of Truth**: Firestore is the single source of truth
2. ✅ **Real-time Sync**: All clients listen to Firestore changes
3. ✅ **Presence System**: Track user connections/disconnections
4. ✅ **Reconnection Support**: Users can rejoin sessions safely
5. ✅ **Clean URLs**: URLs only contain immutable IDs
6. ✅ **State Validation**: Server validates all state transitions

---

## New Architecture Components

### 1. **Session Document (Firestore)**

Replace scattered sessionStorage with a unified Firestore document:

```typescript
// firestore: /sessions/{sessionId}
interface GameSession {
  // Immutable metadata
  sessionId: string;
  matchId: string;  // Links to matchStates collection
  mode: 'practice' | 'quick-match' | 'ranked';
  createdAt: Timestamp;
  
  // Game configuration
  config: {
    trait: string;
    promptId: string;
    promptType: string;
    phase: 1 | 2 | 3;
    phaseDuration: number;
  };
  
  // Players and their connection status
  players: {
    [userId: string]: {
      userId: string;
      displayName: string;
      avatar: string;
      rank: string;
      isAI: boolean;
      
      // Connection tracking
      status: 'connected' | 'disconnected' | 'reconnecting';
      lastHeartbeat: Timestamp;
      connectionId: string;  // Unique per browser session
      
      // Phase progress
      phases: {
        phase1?: {
          submitted: boolean;
          submittedAt?: Timestamp;
          content?: string;
          wordCount?: number;
        };
        phase2?: {
          submitted: boolean;
          submittedAt?: Timestamp;
        };
        phase3?: {
          submitted: boolean;
          submittedAt?: Timestamp;
        };
      };
    };
  };
  
  // Session state machine
  state: 'forming' | 'active' | 'waiting' | 'transitioning' | 'completed' | 'abandoned';
  
  // Phase timing (calculated server-side)
  timing: {
    phase1StartTime?: Timestamp;
    phase2StartTime?: Timestamp;
    phase3StartTime?: Timestamp;
  };
  
  // Coordination (replaces leader pattern)
  coordination: {
    readyCount: number;
    allPlayersReady: boolean;
    nextPhase?: 1 | 2 | 3;
  };
}
```

### 2. **Session Manager Service**

Create a dedicated service for session lifecycle:

```typescript
// lib/services/session-manager.ts

class SessionManager {
  private sessionId: string;
  private userId: string;
  private connectionId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionListener: (() => void) | null = null;
  
  /**
   * Join or resume a session
   * - Creates session if joining for first time
   * - Updates connection status if reconnecting
   * - Sets up heartbeat to maintain presence
   */
  async joinSession(
    sessionId: string,
    userId: string,
    playerInfo: PlayerInfo
  ): Promise<GameSession> {
    this.sessionId = sessionId;
    this.userId = userId;
    this.connectionId = generateConnectionId();
    
    const sessionRef = doc(db, 'sessions', sessionId);
    
    // Check if session exists
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      // Reconnecting to existing session
      await this.reconnectToSession(sessionRef, playerInfo);
    } else {
      // Creating new session
      await this.createNewSession(sessionRef, playerInfo);
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Listen for session updates
    this.listenToSession();
    
    return sessionSnap.data() as GameSession;
  }
  
  /**
   * Heartbeat to maintain presence
   * - Updates lastHeartbeat timestamp every 5 seconds
   * - Server can detect disconnections after 15 seconds
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await updateDoc(doc(db, 'sessions', this.sessionId), {
          [`players.${this.userId}.lastHeartbeat`]: serverTimestamp(),
          [`players.${this.userId}.status`]: 'connected',
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
        // Could trigger reconnection logic here
      }
    }, 5000);
  }
  
  /**
   * Submit phase work
   * - Automatically updates coordination.readyCount
   * - Triggers phase transition when all ready
   */
  async submitPhase(
    phase: 1 | 2 | 3,
    data: PhaseSubmissionData
  ): Promise<void> {
    const sessionRef = doc(db, 'sessions', this.sessionId);
    
    await updateDoc(sessionRef, {
      [`players.${this.userId}.phases.phase${phase}`]: {
        submitted: true,
        submittedAt: serverTimestamp(),
        ...data,
      },
    });
    
    // Server function increments readyCount and checks if all ready
    // This avoids race conditions
  }
  
  /**
   * Listen for session changes
   * - Real-time updates to UI
   * - Detect when phase transitions
   * - Detect when other players disconnect/reconnect
   */
  private listenToSession(): void {
    const sessionRef = doc(db, 'sessions', this.sessionId);
    
    this.sessionListener = onSnapshot(sessionRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.error('Session no longer exists');
        return;
      }
      
      const session = snapshot.data() as GameSession;
      
      // Emit events for UI updates
      this.onSessionUpdate(session);
      
      // Check if phase changed
      if (session.config.phase !== this.currentPhase) {
        this.onPhaseTransition(session.config.phase);
      }
    });
  }
  
  /**
   * Leave session gracefully
   */
  async leaveSession(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.sessionListener) {
      this.sessionListener();
    }
    
    // Mark as disconnected
    await updateDoc(doc(db, 'sessions', this.sessionId), {
      [`players.${this.userId}.status`]: 'disconnected',
      [`players.${this.userId}.lastHeartbeat`]: serverTimestamp(),
    });
  }
}
```

### 3. **Server-Side Session Orchestration (Cloud Functions)**

Move coordination logic to server to avoid race conditions:

```typescript
// functions/src/session-orchestrator.ts

/**
 * Firestore trigger: When a player submits a phase
 * - Increment readyCount atomically
 * - Check if all real players are ready
 * - Trigger phase transition if ready
 */
export const onPhaseSubmission = functions.firestore
  .document('sessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as GameSession;
    const after = change.after.data() as GameSession;
    
    // Check if any player just submitted
    const beforeSubmissions = countSubmissions(before, before.config.phase);
    const afterSubmissions = countSubmissions(after, after.config.phase);
    
    if (afterSubmissions > beforeSubmissions) {
      // Someone submitted, check if all ready
      const realPlayers = Object.values(after.players).filter(p => !p.isAI);
      const allSubmitted = realPlayers.every(p => 
        p.phases[`phase${after.config.phase}`]?.submitted
      );
      
      if (allSubmitted) {
        // Transition to next phase or complete
        await transitionPhase(context.params.sessionId, after);
      }
    }
  });

/**
 * Scheduled function: Clean up stale connections
 * - Runs every minute
 * - Marks players as disconnected if heartbeat > 15 seconds old
 * - Abandons sessions if all players disconnected > 5 minutes
 */
export const cleanupStaleSessions = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const staleThreshold = 15; // seconds
    
    const sessionsSnapshot = await admin.firestore()
      .collection('sessions')
      .where('state', 'in', ['forming', 'active', 'waiting'])
      .get();
    
    for (const doc of sessionsSnapshot.docs) {
      const session = doc.data() as GameSession;
      let hasActivePlayer = false;
      
      for (const [userId, player] of Object.entries(session.players)) {
        if (player.isAI) continue;
        
        const secondsSinceHeartbeat = now.seconds - player.lastHeartbeat.seconds;
        
        if (secondsSinceHeartbeat > staleThreshold) {
          // Mark as disconnected
          await doc.ref.update({
            [`players.${userId}.status`]: 'disconnected',
          });
        } else {
          hasActivePlayer = true;
        }
      }
      
      // If no active players for 5 minutes, abandon session
      if (!hasActivePlayer) {
        const sessionAge = now.seconds - session.createdAt.seconds;
        if (sessionAge > 300) { // 5 minutes
          await doc.ref.update({ state: 'abandoned' });
        }
      }
    }
  });
```

### 4. **Clean URL Structure**

URLs only contain the immutable sessionId:

```typescript
// OLD (bad):
/ranked/session?trait=all&promptId=prompt-123&matchId=match-456&isLeader=true

// NEW (good):
/session/session-abc123

// The session page loads all data from Firestore:
const SessionPage = () => {
  const { sessionId } = useParams();
  const session = useSession(sessionId); // Custom hook
  
  // All data comes from Firestore, not URL
  const { trait, promptId, matchId, phase, players } = session;
  
  return <SessionUI />;
};
```

### 5. **Reconnection Flow**

```typescript
/**
 * User reconnection flow
 * 1. User opens /session/{sessionId} (from bookmark, refresh, etc.)
 * 2. SessionManager checks if session exists
 * 3. If exists and user is in players list → Reconnect
 * 4. Update user's status to 'connected'
 * 5. Restore to current phase
 * 6. Resume gameplay
 */

const useSession = (sessionId: string) => {
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  useEffect(() => {
    if (!user || !sessionId) return;
    
    const sessionManager = new SessionManager();
    
    const init = async () => {
      try {
        setIsReconnecting(true);
        
        const gameSession = await sessionManager.joinSession(
          sessionId,
          user.uid,
          {
            displayName: user.displayName,
            avatar: user.avatar,
            rank: user.rank,
          }
        );
        
        setSession(gameSession);
        setIsReconnecting(false);
        
        // If user was in middle of phase, resume
        if (gameSession.state === 'active') {
          console.log('✅ Reconnected to active session');
        }
      } catch (error) {
        console.error('Failed to join/resume session:', error);
        // Redirect to dashboard
      }
    };
    
    init();
    
    return () => {
      sessionManager.leaveSession();
    };
  }, [sessionId, user]);
  
  return { session, isReconnecting };
};
```

---

## Migration Plan

### Phase 1: Add Session Collection (Non-Breaking)
- ✅ Create `sessions` Firestore collection
- ✅ Create `SessionManager` service
- ✅ Run both old and new systems in parallel
- ✅ Log comparison between sessionStorage and Firestore

### Phase 2: Migrate Matchmaking
- ✅ Update `MatchmakingContent` to create session documents
- ✅ Pass `sessionId` instead of all parameters in URL
- ✅ Keep backward compatibility with old URLs

### Phase 3: Migrate Session Pages
- ✅ Update `WritingSessionContent` to use SessionManager
- ✅ Update `PeerFeedbackContent` to use SessionManager
- ✅ Update `RevisionContent` to use SessionManager
- ✅ Remove sessionStorage dependencies

### Phase 4: Add Server Functions
- ✅ Deploy Cloud Functions for orchestration
- ✅ Add cleanup scheduled function
- ✅ Monitor for 1 week

### Phase 5: Remove Old System
- ✅ Remove all sessionStorage usage
- ✅ Remove URL parameter passing
- ✅ Remove leader/follower polling logic
- ✅ Update documentation

---

## Benefits of New Architecture

### Reliability
- ✅ **Browser refresh works**: State in Firestore, not sessionStorage
- ✅ **Tab switching works**: All tabs sync to same Firestore doc
- ✅ **Network issues handled**: Reconnection logic built-in
- ✅ **No race conditions**: Server coordinates state transitions

### User Experience
- ✅ **Bookmarkable sessions**: Clean `/session/{id}` URLs
- ✅ **Resume from any device**: sessionId works anywhere
- ✅ **See teammate status**: Real-time presence indicators
- ✅ **Graceful degradation**: Can continue even if players disconnect

### Developer Experience
- ✅ **Single source of truth**: All state in Firestore
- ✅ **Easier debugging**: Inspect session doc in Firebase console
- ✅ **Better testing**: Mock Firestore, not sessionStorage
- ✅ **Type safety**: Strongly typed session interface

### Security
- ✅ **Server validation**: Cloud Functions enforce rules
- ✅ **No URL manipulation**: Data not in URLs
- ✅ **Audit trail**: All changes timestamped in Firestore
- ✅ **Firestore rules**: Protect session documents

---

## Example Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Sessions can only be read/written by players in that session
    match /sessions/{sessionId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.players.keys();
      
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.players[request.auth.uid].userId;
      
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.players.keys() &&
        onlyUpdatingOwnPlayerData(request.auth.uid);
    }
    
    function onlyUpdatingOwnPlayerData(userId) {
      let affectedKeys = request.resource.data.diff(resource.data).affectedKeys();
      return affectedKeys.hasOnly([
        'players.' + userId + '.lastHeartbeat',
        'players.' + userId + '.status',
        'players.' + userId + '.phases'
      ]);
    }
  }
}
```

---

## Monitoring & Alerts

### Key Metrics to Track
- Session creation rate
- Average session duration
- Reconnection rate
- Abandonment rate (players disconnecting mid-game)
- Heartbeat failure rate
- Phase transition latency

### Alerts
- Alert if reconnection rate > 20%
- Alert if abandonment rate > 10%
- Alert if heartbeat failures > 5% over 1 hour
- Alert if session creation fails

---

## Open Questions

1. **Session Expiry**: How long to keep completed sessions? (Proposal: 7 days)
2. **Reconnection Timeout**: How long to wait for reconnection? (Proposal: 5 minutes)
3. **AI Backfill on Disconnect**: Should we replace disconnected players with AI? (Proposal: No, just continue with fewer players)
4. **Cross-Device Sessions**: Should users be able to continue on different device? (Proposal: Yes, if same userId)

---

## Estimated Effort

- **Development**: 2-3 days
- **Testing**: 1 day
- **Deployment**: 0.5 days
- **Monitoring**: Ongoing
- **Total**: ~4 days

---

## Conclusion

The current architecture has fundamental issues that make it unreliable:
- Browser-based state is fragile
- URL-based parameters are limiting
- No connection management leads to ghost players
- Leader-follower polling is inefficient

The proposed architecture solves these by:
- Moving to Firestore as single source of truth
- Implementing presence/heartbeat system
- Using server-side orchestration
- Supporting reconnection gracefully
- Cleaning up URLs

This will make the game much more reliable and provide a better experience for users.

