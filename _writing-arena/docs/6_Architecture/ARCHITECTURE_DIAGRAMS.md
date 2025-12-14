# Session Architecture - Visual Diagrams

## Current Architecture (Problems)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              sessionStorage (Local)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  match-123-startTime: "1234567890"                       │  │
│  │  match-123-content: "My writing..."                      │  │
│  │  match-123-submitted: "true"                             │  │
│  │  match-123-players: "[...]"                              │  │
│  │  match-123-phase1-score: "85"                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Component                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Reads URL params:                                       │  │
│  │  ?trait=all&promptId=p1&matchId=m1&content=...&score=... │  │
│  │                                                           │  │
│  │  Polls Firestore every 500ms:                            │  │
│  │  - Check if match exists                                 │  │
│  │  - Check if all players ready                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ▼
                  ❌ PROBLEMS ❌
                            
1. Lost on browser refresh/tab close
2. Not synced across tabs
3. URL length limits (2000 chars)
4. No reconnection support
5. Inefficient polling
6. Race conditions with multiple clients
7. No ghost player detection
```

---

## New Architecture (Solutions)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIRESTORE (Server)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /sessions/session-abc123                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ {                                                         │  │
│  │   sessionId: "session-abc123",                            │  │
│  │   state: "active",                                        │  │
│  │   config: { phase: 1, trait: "all", ... },               │  │
│  │   players: {                                              │  │
│  │     "user-1": {                                           │  │
│  │       status: "connected",                                │  │
│  │       lastHeartbeat: Timestamp,                           │  │
│  │       phases: {                                           │  │
│  │         phase1: { submitted: true, content: "..." }       │  │
│  │       }                                                    │  │
│  │     }                                                      │  │
│  │   },                                                       │  │
│  │   coordination: {                                         │  │
│  │     allPlayersReady: false,                               │  │
│  │     readyCount: 2                                         │  │
│  │   }                                                        │  │
│  │ }                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                     │
│                           │                                     │
│                  Real-time sync                                 │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Browser Tab 1│  │  Browser Tab 2│  │ Cloud Function│
├───────────────┤  ├───────────────┤  ├───────────────┤
│ SessionManager│  │ SessionManager│  │ onSubmission  │
│   + Heartbeat │  │   + Heartbeat │  │   Trigger     │
│   + Listener  │  │   + Listener  │  │               │
│               │  │               │  │ Cleanup Stale │
│ useSession    │  │ useSession    │  │  Connections  │
│   hook        │  │   hook        │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
     ▲ ▼                ▲ ▼                   ▲
     │ │                │ │                   │
     │ └────────────────┴─┴───────────────────┘
     │        All synced to same state
     │
     └─ Clean URL: /session/session-abc123

                  ✅ BENEFITS ✅

1. ✅ Survives browser refresh
2. ✅ Synced across all tabs/devices
3. ✅ Clean, short URLs
4. ✅ Automatic reconnection
5. ✅ Real-time updates (no polling)
6. ✅ Server-side coordination (no race conditions)
7. ✅ Heartbeat detects disconnections
```

---

## Connection Lifecycle

```
USER JOINS SESSION
       │
       ▼
┌─────────────────────────────────────────┐
│ SessionManager.joinSession()            │
├─────────────────────────────────────────┤
│ 1. Check if session exists in Firestore│
│ 2. Update player status: "connected"   │
│ 3. Set lastHeartbeat: NOW              │
│ 4. Start heartbeat (every 5 sec)       │
│ 5. Listen for session updates          │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│       ACTIVE SESSION                    │
├─────────────────────────────────────────┤
│ Every 5 seconds:                        │
│   ► Send heartbeat to Firestore         │
│   ► Update lastHeartbeat timestamp      │
│                                         │
│ Real-time listener:                     │
│   ► Detect phase transitions            │
│   ► Detect other player submissions     │
│   ► Detect player disconnections        │
└─────────────────────────────────────────┘
       │
       ├─── User Submits Phase ─────┐
       │                             ▼
       │                  ┌────────────────────────┐
       │                  │ submitPhase()          │
       │                  ├────────────────────────┤
       │                  │ 1. Upload phase data   │
       │                  │ 2. Mark submitted=true │
       │                  │ 3. Cloud Function      │
       │                  │    detects submission  │
       │                  │ 4. If all ready →      │
       │                  │    auto-transition     │
       │                  └────────────────────────┘
       │
       ├─── User Leaves Gracefully ─────┐
       │                                 ▼
       │                  ┌────────────────────────┐
       │                  │ leaveSession()         │
       │                  ├────────────────────────┤
       │                  │ 1. Stop heartbeat      │
       │                  │ 2. Stop listener       │
       │                  │ 3. Update status:      │
       │                  │    "disconnected"      │
       │                  └────────────────────────┘
       │
       └─── User Crashes/Network Loss ───┐
                                          ▼
                           ┌────────────────────────────┐
                           │ Cloud Function Cleanup     │
                           ├────────────────────────────┤
                           │ Every 1 minute:            │
                           │ 1. Check all sessions      │
                           │ 2. If no heartbeat for 15s │
                           │    → mark "disconnected"   │
                           │ 3. If all disconnected 5m  │
                           │    → mark "abandoned"      │
                           └────────────────────────────┘
```

---

## Phase Transition Flow

```
PHASE 1: WRITING

Player 1: Writing...
Player 2: Writing...
Player 3: Writing...
Player 4: Writing...
Player 5: Writing...

       │
       ▼
┌─────────────────────────────────────────┐
│ Player 1 submits                        │
│   ► submitPhase(1, { content, score })  │
│   ► Firestore: phase1.submitted = true  │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Cloud Function: onPlayerSubmission      │
│   ► Triggered by Firestore update       │
│   ► Count: 1 / 5 players submitted      │
│   ► Not ready yet, continue waiting     │
└─────────────────────────────────────────┘

       (more players submit...)

       │
       ▼
┌─────────────────────────────────────────┐
│ Player 5 submits (LAST PLAYER)          │
│   ► submitPhase(1, { content, score })  │
│   ► Firestore: phase1.submitted = true  │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Cloud Function: onPlayerSubmission      │
│   ► Count: 5 / 5 players submitted      │
│   ► ALL READY!                          │
│   ► Update coordination.allPlayersReady │
│   ► Wait 3 seconds (show results)       │
│   ► transitionToNextPhase()             │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Firestore Update                        │
│   ► config.phase = 2                    │
│   ► timing.phase2StartTime = NOW        │
│   ► coordination.allPlayersReady = false│
│   ► coordination.readyCount = 0         │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ All Clients (Real-time Listener)        │
│   ► Detect phase changed to 2           │
│   ► Trigger onPhaseTransition(2)        │
│   ► UI updates to Phase 2               │
└─────────────────────────────────────────┘

PHASE 2: PEER FEEDBACK
(Process repeats...)
```

---

## Reconnection Flow

```
USER REFRESHES BROWSER

       │
       ▼
┌─────────────────────────────────────────┐
│ Page Loads: /session/session-abc123    │
├─────────────────────────────────────────┤
│ useSession(sessionId)                   │
│   ► Show "Reconnecting..." UI           │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ SessionManager.joinSession()            │
├─────────────────────────────────────────┤
│ 1. Check if session exists              │
│    ✓ Session found!                     │
│ 2. Check if user in players list        │
│    ✓ User found!                        │
│ 3. Update connection status             │
│    - status: "connected"                │
│    - lastHeartbeat: NOW                 │
│    - connectionId: NEW_ID               │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Load Session State                      │
├─────────────────────────────────────────┤
│ ► Current phase: 2                      │
│ ► Time remaining: 45 seconds            │
│ ► User's Phase 1: Already submitted ✓   │
│ ► Restore UI to Phase 2                 │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Resume Session                          │
├─────────────────────────────────────────┤
│ ✅ Show "Session restored" notification │
│ ✅ Heartbeat active                     │
│ ✅ Real-time sync enabled               │
│ ✅ User can continue gameplay           │
└─────────────────────────────────────────┘

✅ ALL STATE PRESERVED!
- Phase progress
- Submissions
- Time remaining
- Player status
```

---

## Comparison: URL Structure

### **OLD System (Bad)**

```
/ranked/session
  ?trait=all
  &promptId=prompt-narrative-lighthouse
  &matchId=match-user-abc-1731609876543
  &isLeader=true

/ranked/peer-feedback
  ?matchId=match-user-abc-1731609876543
  &trait=all
  &promptId=prompt-narrative-lighthouse
  &promptType=narrative
  &content=The%20old%20lighthouse%20stood%20sentinel...
  &wordCount=95
  &aiScores=42,55,48,62
  &yourScore=85

/ranked/revision
  ?matchId=match-user-abc-1731609876543
  &trait=all
  &promptId=prompt-narrative-lighthouse
  &promptType=narrative
  &content=The%20old%20lighthouse%20stood%20sentinel...
  &wordCount=95
  &aiScores=42,55,48,62
  &yourScore=85
  &feedbackScore=88
  &peerFeedback=%7B%22clarity%22%3A%22The%20main...

❌ Problems:
- Hits URL length limits (~2000 chars)
- Sensitive data in URL history
- Not bookmarkable
- Breaks on special characters
- Lost on navigation
```

### **NEW System (Good)**

```
/session/session-abc123                    (Phase 1)
/session/session-abc123/feedback          (Phase 2)
/session/session-abc123/revision          (Phase 3)
/session/session-abc123/results           (Complete)

✅ Benefits:
- Clean, short URLs
- Bookmarkable
- Works with any content
- Shareable (if needed)
- All data in Firestore, not URL
```

---

## Data Flow: Old vs New

### **OLD System**

```
Matchmaking Page
    │
    ├─ Save to sessionStorage:
    │    - players
    │    - ai-students
    │
    └─ Navigate with URL params:
         /ranked/session?matchId=...&trait=...&promptId=...

Session Page
    │
    ├─ Read from URL params
    │
    ├─ Read from sessionStorage:
    │    - players
    │    - ai-students
    │    - startTime
    │    - content
    │
    ├─ Write to sessionStorage:
    │    - content (on every change)
    │    - submitted
    │
    ├─ Create matchState in Firestore
    │    (leader/follower polling)
    │
    └─ Navigate with URL params:
         /ranked/peer-feedback?matchId=...&content=...&score=...

❌ State scattered across 3 places:
   1. URL params
   2. sessionStorage
   3. Firestore (matchStates)
```

### **NEW System**

```
Matchmaking Page
    │
    ├─ Create session in Firestore:
    │    POST /sessions
    │    {
    │      sessionId,
    │      players,
    │      config: { trait, promptId, ... }
    │    }
    │
    └─ Navigate with clean URL:
         /session/session-abc123

Session Page
    │
    ├─ useSession(sessionId)
    │    │
    │    ├─ Join session
    │    ├─ Start heartbeat
    │    ├─ Listen for updates
    │    └─ Return session state
    │
    ├─ All data from Firestore
    │    - Phase, players, config, etc.
    │
    ├─ submitPhase() writes to Firestore
    │    - Cloud Function handles coordination
    │
    └─ Navigate with clean URL:
         /session/session-abc123/feedback

✅ Single source of truth:
   Firestore /sessions/{sessionId}
```

---

## Summary

| Aspect | Old System | New System |
|--------|-----------|-----------|
| **State Storage** | sessionStorage + URL | Firestore |
| **URL Structure** | Long with params | Clean `/session/{id}` |
| **Sync** | None | Real-time |
| **Reconnection** | Lost | Automatic |
| **Coordination** | Polling | Cloud Functions |
| **Presence** | None | Heartbeat |
| **Cleanup** | Manual | Automatic |

The new architecture is significantly more robust and provides a much better user experience!

