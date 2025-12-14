# Ranked Flow: Mock vs Real - Complete Audit

## 🔍 Overview
This document audits the **entire ranked match flow** from start to finish, identifying what's real vs mock/placeholder.

---

## 1️⃣ Landing Page (`/ranked/page.tsx`)

### ✅ REAL
- User profile data (rank, LP, display name)
- Trait selection UI (only "All Traits" enabled)
- Navigation to matchmaking

### ⚠️ MOCK / PLACEHOLDER
- **Trait-specific modes** - Only "All Traits" works, others say "Coming Soon"
  - Content, Organization, Grammar, Vocabulary, Mechanics modes disabled

---

## 2️⃣ Matchmaking (`/ranked/matchmaking/page.tsx`)

### ✅ REAL
- Real Firestore queue join/leave
- Real-time listening for other players in queue
- Actual prompt selection from library (20 prompts)
- matchId generation
- TWR concepts carousel

### ⚠️ MOCK / PLACEHOLDER
- **AI Player Backfill** - Every 5 seconds, adds generated AI players
  - Line 82-97: `generateAIPlayer()` creates fake players with random ranks
  - AI players have hardcoded names: ProWriter99, WordMaster, EliteScribe, PenChampion
  - AI players have hardcoded avatars: 🎯, 📖, ✨, 🏅
  - **Issue**: There's NO actual matchmaking algorithm checking for real players in other queues
  - **Result**: You always play with 4 AI bots, never real humans

### 📝 Notes
- The queue system EXISTS and WORKS (Firestore integration is real)
- Real players DO appear in the queue
- Problem: No logic to wait for real players or create parties of real humans
- AI backfill happens too quickly (5 seconds) before real humans can match

---

## 3️⃣ Phase 1: Writing Session (`/ranked/session/page.tsx`)

### ✅ REAL
- Real timer (4 minutes)
- Real word count
- Real AI evaluation via `/api/analyze-writing` (Claude API)
- Real feedback stored in Firestore
- Match state synchronization
- Real "Waiting for Players" screen
- TWR tips modal

### ⚠️ MOCK / PLACEHOLDER
- **AI Opponent Scores** - Session page doesn't generate AI scores, but passes through empty/mock aiScores array

---

## 4️⃣ Phase Rankings (After Phase 1) (`/ranked/phase-rankings/page.tsx`)

### ✅ REAL
- Your actual score from AI evaluation
- Real countdown timer (10s)
- TWR concepts carousel
- Compact layout

### ⚠️ MOCK / PLACEHOLDER
- **AI Player Scores** - Lines 85-116
  ```typescript
  { 
    name: 'ProWriter99', 
    score: Math.round(65 + Math.random() * 25),  // RANDOM!
  },
  { 
    name: 'WordMaster', 
    score: Math.round(60 + Math.random() * 30),  // RANDOM!
  },
  // etc...
  ```
  - **Issue**: These are randomly generated scores, not from actual AI evaluation
  - **Issue**: Rankings shuffle each time page renders (now fixed with useMemo, but scores still random)

---

## 5️⃣ Phase 2: Peer Feedback (`/ranked/peer-feedback/page.tsx`)

### ✅ REAL
- Real timer (3 minutes)
- Real AI evaluation via `/api/evaluate-peer-feedback` (Claude API)
- Real feedback stored in Firestore
- TWR tips modal
- Match state synchronization

### ⚠️ MOCK / PLACEHOLDER
- **Peer's Writing** - Lines 10-33: `MOCK_PEER_WRITINGS`
  - Hardcoded sample essays (2 options)
  - Line 49: `const [currentPeer] = useState(MOCK_PEER_WRITINGS[0])`
  - **Issue**: You're ALWAYS evaluating the same fake essay, not another player's actual writing
  - No retrieval of real peer writing from Firestore
  - Comment on line 49: `// In reality, match them with actual peer`

---

## 6️⃣ Phase Rankings (After Phase 2) (`/ranked/phase-rankings/page.tsx`)

### ✅ REAL
- Your actual feedback evaluation score from AI

### ⚠️ MOCK / PLACEHOLDER
- **AI Player Scores** - Same random generation as Phase 1 rankings
- See section 4 above - same issue repeats

---

## 7️⃣ Phase 3: Revision (`/ranked/revision/page.tsx`)

### ✅ REAL
- Real timer (4 minutes)
- Real AI feedback generation via `/api/generate-feedback` (Claude API)
- Real AI revision evaluation via `/api/evaluate-revision` (Claude API)
- Real feedback stored in Firestore
- TWR tips modal
- No sticky elements (scrolls smoothly)

### ⚠️ MOCK / PLACEHOLDER
- **Peer Feedback Display** - Lines 311-318: Comment says `{/* Peer Feedback - MOCK */}`
  - Hardcoded peer feedback text:
    ```
    "Your story has a great sense of mystery..."
    "Try adding more description about what Sarah is feeling..."
    ```
  - **Issue**: Not showing the actual feedback responses from Phase 2
  - Should retrieve from Firestore or URL params

---

## 8️⃣ Final Results (`/ranked/results/page.tsx`)

### ✅ REAL
- Your actual scores from all 3 phases
- Composite score calculation (weighted)
- LP/XP/Points calculations
- **NOW SAVES TO FIRESTORE** (just fixed!)
- Retrieves real AI feedback from Firestore
- Shows "✓ Real AI" badge when real feedback available
- Session history saved

### ⚠️ MOCK / PLACEHOLDER
- **AI Player Scores Across All 3 Phases** - Lines 133-170
  ```typescript
  const aiPlayers = [
    {
      name: 'ProWriter99',
      phase1: Math.round(65 + Math.random() * 25),  // RANDOM!
      phase2: Math.round(70 + Math.random() * 20),  // RANDOM!
      phase3: Math.round(75 + Math.random() * 15),  // RANDOM!
    },
    // ... 3 more AI players with random scores
  ];
  ```
  - **Issue**: AI opponents get randomly generated scores for all phases
  - They don't actually "compete" - their scores are fake
  - Rankings are based on these random scores vs your real scores

- **MOCK_PHASE_FEEDBACK Fallback** - Lines 11-62
  - Hardcoded generic feedback as fallback
  - Only shown if real AI feedback not available
  - Now properly attempts to load real feedback first

---

## 🎯 SUMMARY OF MOCK/PLACEHOLDER ITEMS

### Critical Issues (Breaks Multiplayer Experience)

1. **No Real Player Matching** ✋ CRITICAL
   - Location: `/ranked/matchmaking/page.tsx` lines 82-97
   - Issue: Always backfills with AI within 5 seconds
   - Impact: Players NEVER play against other humans, only bots

2. **Mock Peer Writing in Phase 2** ✋ CRITICAL  
   - Location: `/ranked/peer-feedback/page.tsx` lines 10-33, 49
   - Issue: Always evaluating same 2 hardcoded essays
   - Impact: Not a real peer evaluation - you're not reading another player's work

3. **Random AI Opponent Scores** ⚠️ HIGH
   - Location: Multiple files (phase-rankings, results)
   - Issue: AI players get random scores, not from actual evaluation
   - Impact: Rankings are partly fake - only your score is real

4. **Mock Peer Feedback Display in Revision** ⚠️ MEDIUM
   - Location: `/ranked/revision/page.tsx` lines 311-318
   - Issue: Shows hardcoded peer feedback, not actual responses
   - Impact: Students don't see what their peer actually wrote about their work

### Minor/Acceptable Placeholders

5. **AI Player Names/Avatars** ℹ️ LOW
   - Location: `/lib/matchmaking-queue.ts` lines 112-147
   - Issue: AI players have hardcoded names and avatars
   - Impact: Recognizable as bots, but acceptable for testing

6. **Trait-Specific Modes Disabled** ℹ️ LOW
   - Location: `/ranked/page.tsx` line 146
   - Issue: Only "All Traits" mode works
   - Impact: Less variety, but clearly marked "Coming Soon"

---

## 🔄 Real vs Mock Data Flow Diagram

```
USER'S DATA:
✅ Profile (real Firestore)
✅ Writing (real)
✅ Phase 1 Score (real Claude AI)
✅ Phase 2 Score (real Claude AI)  
✅ Phase 3 Score (real Claude AI)
✅ AI Feedback (real, stored in Firestore)
✅ LP/XP Changes (real, saved to Firestore)

AI OPPONENTS' DATA:
❌ Players (generated bots, not real humans)
❌ Phase 1 Scores (random 60-90)
❌ Phase 2 Scores (random 60-90)
❌ Phase 3 Scores (random 60-90)
❌ Writing content (never written by AI)
❌ Feedback (never given by AI)

PEER INTERACTION:
❌ Peer's writing you evaluate (hardcoded samples)
❌ Peer feedback shown to you (hardcoded text)
✅ Your feedback evaluation (real AI judges quality)
```

---

## 💡 RECOMMENDATIONS

### Priority 1: Enable Real Player Matching
**Problem**: Always plays with AI bots  
**Solution**: 
- Increase AI backfill delay from 5s to 30-60s
- Implement actual matchmaking that waits for real players
- Add "Play vs AI" option separate from "Ranked"
- Show party composition (X real players, Y AI) before match starts

### Priority 2: Implement Real Peer Writing Exchange
**Problem**: Not evaluating real peer work  
**Solution**:
- Store player writings in matchState
- In Phase 2, retrieve a real opponent's Phase 1 writing
- Round-robin assignment (Player 1 reviews Player 2, Player 2 reviews Player 3, etc.)

### Priority 3: Generate Real AI Opponent Scores
**Problem**: AI scores are random, not evaluated  
**Solution Option A (Quick):
- Generate AI writing using Claude
- Run it through same evaluation pipeline
- Store real scores

**Solution Option B (Better):
- Pre-generate 100+ AI-written essays at various skill levels
- Store in database with pre-calculated scores
- Assign appropriate AI essays based on player's rank

### Priority 4: Show Real Peer Feedback in Revision
**Problem**: Not showing actual peer comments  
**Solution**:
- Retrieve peer's Phase 2 responses from Firestore
- Display actual feedback instead of mock text
- Show peer's name/avatar for accountability

---

## 📊 Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| User Authentication | ✅ Real | Firebase Auth |
| User Profile | ✅ Real | Firestore |
| Matchmaking Queue | ✅ Real | Firestore, but doesn't wait |
| AI Backfill | ⚠️ Too Fast | 5s delay, should be 30-60s |
| Player Names | ❌ Mock | AI-generated bots |
| Prompt Library | ✅ Real | 20 real prompts |
| Phase 1 Writing | ✅ Real | User's actual writing |
| Phase 1 Evaluation | ✅ Real | Claude AI |
| Phase 1 Feedback Storage | ✅ Real | Firestore |
| Phase 1 AI Scores | ❌ Mock | Random 60-90 |
| Phase 2 Peer Writing | ❌ Mock | Hardcoded samples |
| Phase 2 Evaluation | ✅ Real | Claude AI |
| Phase 2 Feedback Storage | ✅ Real | Firestore |
| Phase 2 AI Scores | ❌ Mock | Random 60-90 |
| Phase 3 AI Feedback Gen | ✅ Real | Claude AI |
| Phase 3 Revision Eval | ✅ Real | Claude AI |
| Phase 3 Feedback Storage | ✅ Real | Firestore |
| Phase 3 Peer Feedback Display | ❌ Mock | Hardcoded text |
| Phase 3 AI Scores | ❌ Mock | Random 60-90 |
| Results Display | ✅ Real | Your scores accurate |
| Results AI Feedback | ✅ Real | Retrieves from Firestore |
| LP/XP/Points Save | ✅ Real | Just fixed! |
| Session History | ✅ Real | Saved to Firestore |
| Waiting Screens | ✅ Real | Match sync works |
| TWR Carousels | ✅ Real | Educational content |

---

## 🎯 Bottom Line

**What Works Great:**
- Your entire evaluation pipeline (real Claude AI at every phase)
- Your feedback storage and retrieval
- Your profile updates (LP, XP, stats)
- Match synchronization between phases
- UI/UX and educational content

**What Needs Work:**
- 🚨 **Multiplayer is mostly simulated** - you're not playing against real humans
- 🚨 **Peer feedback loop is broken** - not exchanging real work
- 🚨 **AI opponents are hollow** - random scores, no actual content
- ✅ But the INFRASTRUCTURE is there! Just needs the connections made.

The good news: The foundation is solid. All the Firestore structures, API endpoints, and UI components are in place. It's a matter of connecting the dots to enable real multiplayer interaction.

