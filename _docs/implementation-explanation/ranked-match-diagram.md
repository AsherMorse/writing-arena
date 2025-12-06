```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              RANKED MATCH FLOW                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  MATCHMAKING │ ──▶ │   PHASE 1      │ ──▶ │    PHASE 2       │ ──▶ │     PHASE 3         │ ──▶ RESULTS
│    LOBBY     │     │   WRITING      │     │  PEER FEEDBACK   │     │    REVISION         │
└─────────────┘     └────────────────┘     └──────────────────┘     └─────────────────────┘
      │                    │                       │                        │
      │                    ▼                       ▼                        ▼
      │              ┌───────────┐          ┌───────────┐           ┌───────────┐
      │              │  WAITING  │          │  WAITING  │           │  WAITING  │
      │              │  SCREEN   │          │  SCREEN   │           │  SCREEN   │
      │              └───────────┘          └───────────┘           └───────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               DETAILED PHASE FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    MatchmakingContent.tsx                WritingSessionContent.tsx
           │                                       │
           │ useCreateSession()                    │ useSession()
           │ fillLobbyWithAI()                     │ useAIGeneration()
           │ useMatchmakingSession()               │ useBatchRankingSubmission()
           ▼                                       │ useAutoSubmit()
    ┌─────────────────┐                            │
    │ Join/Create     │                            ▼
    │ Session in      │◀──────────────────────────────────────────────────────┐
    │ Firestore       │                                                        │
    └────────┬────────┘                                                        │
             │                                                                 │
             │ countdown → startSession()                                      │
             ▼                                                                 │
    ┌─────────────────┐                                                        │
    │ Navigate to     │                                                        │
    │ /session/[id]   │                                                        │
    └────────┬────────┘                                                        │
             │                                                                 │
             │ SessionPage detects phase                                       │
             ▼                                                                 │
    ┌─────────────────┐        ┌─────────────────┐        ┌───────────────────┐
    │ PHASE 1         │        │ PHASE 2         │        │ PHASE 3           │
    │ Writing         │───────▶│ Peer Feedback   │───────▶│ Revision          │──▶ Results
    │ Session         │        │                 │        │                   │
    └─────────────────┘        └─────────────────┘        └───────────────────┘
             │                        │                          │
             ▼                        ▼                          ▼
      ┌────────────┐          ┌────────────┐             ┌────────────┐
      │ User       │          │ User       │             │ User       │
      │ Submits    │          │ Submits    │             │ Submits    │
      └─────┬──────┘          └─────┬──────┘             └─────┬──────┘
            │                       │                          │
            ▼                       ▼                          ▼
      ┌─────────────────────────────────────────────────────────────────────┐
      │  useBatchRankingSubmission()                                         │
      │  1. Wait for AI submissions (retry loop polling matchStates doc)    │
      │  2. Combine user + AI submissions                                    │
      │  3. Call batch ranking API                                           │
      │  4. Save rankings to matchStates                                     │
      │  5. Call submitPhase() → Updates session Firestore                   │
      └─────────────────────────────────────────────────────────────────────┘
            │
            ▼
      ┌─────────────────────────────────────────────────────────────────────┐
      │  WaitingForPlayers Screen (shown when hasSubmitted() is true)       │
      │  • Shows submission progress                                         │
      │  • Displays writing tips                                             │
      │  • Waits for all players to submit                                   │
      └─────────────────────────────────────────────────────────────────────┘
            │
            ▼
      ┌─────────────────────────────────────────────────────────────────────┐
      │  usePhaseTransition() Hook (polling every 1 second)                  │
      │  • Detects when all real players have submitted                      │
      │  • Calls checkAndTransitionPhase()                                   │
      │    └──▶ transitionToNextPhase() (Firestore transaction)              │
      │        • Updates config.phase                                        │
      │        • Sets new phaseDuration                                      │
      │        • Sets phaseNStartTime = serverTimestamp()                    │
      └─────────────────────────────────────────────────────────────────────┘
            │
            ▼
      ┌─────────────────────────────────────────────────────────────────────┐
      │  Firestore Listener (SessionManager.listenToSession)                 │
      │  • Detects phase change                                              │
      │  • Updates local session state                                       │
      │  • SessionPage re-renders with new phase component                   │
      └─────────────────────────────────────────────────────────────────────┘
```

relevant chat: 
* "Understanding ranked match flow and functions"
* "Why is phase transition slow in ranked matches?"