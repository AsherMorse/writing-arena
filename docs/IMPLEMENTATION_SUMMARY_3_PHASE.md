# Three-Phase Battle System - Implementation Summary

## ✅ Completed Implementation

The 3-phase battle system has been successfully implemented for **Ranked Mode Only**. Practice and Quick Match modes remain unchanged with their single-phase writing experience.

## 📁 New Files Created

1. **`/app/ranked/peer-feedback/page.tsx`** - Phase 2: Peer Feedback
2. **`/app/ranked/revision/page.tsx`** - Phase 3: Revision
3. **`/docs/THREE_PHASE_BATTLE_SYSTEM.md`** - Complete documentation

## 📝 Modified Files

1. **`/app/ranked/session/page.tsx`** - Updated to route to peer-feedback phase
2. **`/app/ranked/results/page.tsx`** - Completely rewritten to show all 3 phases

## 🎮 Complete User Flow

```
User starts Ranked Battle
       ↓
┌──────────────────────────────────────┐
│ PHASE 1: WRITING (4 minutes)         │
│ - Write response to prompt           │
│ - AI evaluates writing quality       │
│ - Weight: 40%                         │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ PHASE 2: PEER FEEDBACK (3 minutes)   │
│ - Read another player's writing      │
│ - Answer 5 evaluation questions      │
│ - AI evaluates feedback quality      │
│ - Weight: 30%                         │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ PHASE 3: REVISION (4 minutes)        │
│ - View original writing               │
│ - See AI & peer feedback              │
│ - Revise and improve                  │
│ - AI evaluates revision quality       │
│ - Weight: 30%                         │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ FINAL RESULTS                         │
│ - Composite score from all 3 phases  │
│ - Rankings vs other players           │
│ - LP changes based on placement       │
│ - XP and rewards (2.5x for ranked)   │
└──────────────────────────────────────┘
```

## 🎯 Phase Details

### Phase 1: Writing
- **Duration:** 4 minutes (240 seconds)
- **Weight:** 40% of final score
- **Mock Scoring:** `60 + (wordCount / 5) + random(0-15)`
- **Output:** Writing content + score

### Phase 2: Peer Feedback
- **Duration:** 3 minutes (180 seconds)
- **Weight:** 30% of final score
- **Questions:**
  1. What is the main idea? Is it clear?
  2. What are the strongest parts?
  3. What could be improved? Be specific.
  4. How well is it organized?
  5. How engaging is it?
- **Mock Scoring:** 
  - Complete (all questions 50+ chars): 75-95
  - Incomplete: 50-80
- **Mock Peer Writing:** Hardcoded sample essays

### Phase 3: Revision
- **Duration:** 4 minutes (240 seconds)
- **Weight:** 30% of final score
- **Feedback Shown:**
  - AI: 3 strengths + 3 suggestions (mock)
  - Peer: Their responses from Phase 2
- **Mock Scoring:**
  - Significant changes: 85-95
  - Minor/no changes: 60-75

### Results Display
- **Individual Phase Scores:** Shows all 3 scores
- **Composite Score:** `(Phase1 × 0.4) + (Phase2 × 0.3) + (Phase3 × 0.3)`
- **Rankings:** 1-5 based on composite scores
- **LP Changes:**
  - 1st: +35 LP
  - 2nd: +22 LP
  - 3rd: +12 LP
  - 4th: -5 LP
  - 5th: -15 LP
- **XP Multiplier:** 2.5x for ranked
- **Bonus Rewards:** Victory bonuses for 1st/2nd place

## 🔄 Data Flow

### URL Parameters Passed Between Phases:

**Session → Peer Feedback:**
```
?trait=...
&promptType=...
&content=<encoded>
&wordCount=...
&aiScores=...
&yourScore=...
```

**Peer Feedback → Revision:**
```
<all previous params>
&feedbackScore=...
&peerFeedback=<encoded JSON>
```

**Revision → Results:**
```
<all previous params>
&originalContent=<encoded>
&revisedContent=<encoded>
&revisedWordCount=...
&revisionScore=...
```

## 🎭 Mock Data Locations

All mock data is self-contained within each page component:

1. **Writing Scores** - Simple formula in `session/page.tsx`
2. **Peer Writings** - `MOCK_PEER_WRITINGS` array in `peer-feedback/page.tsx`
3. **Feedback Scoring** - Completeness check in `peer-feedback/page.tsx`
4. **AI Feedback** - `MOCK_AI_FEEDBACK` object in `revision/page.tsx`
5. **Revision Scoring** - Change detection in `revision/page.tsx`
6. **AI Players** - Generated in `results/page.tsx` with random scores

## 🚀 Testing Instructions

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Ranked Mode:**
   - Go to `/ranked`
   - Select a writing trait
   - Click "Find Match"

3. **Complete Phase 1 (Writing):**
   - Write at least 50 words
   - Click "Finish Early" or wait for timer

4. **Complete Phase 2 (Peer Feedback):**
   - Read the sample peer writing
   - Answer all 5 questions (50+ chars each)
   - Click "Submit Feedback" when done

5. **Complete Phase 3 (Revision):**
   - Review the AI and peer feedback
   - Make changes to your writing
   - Click "Submit Revision"

6. **View Results:**
   - See your scores for all 3 phases
   - Check your placement (1-5)
   - View LP change and rewards

## ✅ Verification Checklist

- [x] All 3 new pages created
- [x] Session routes to peer-feedback
- [x] Peer-feedback routes to revision
- [x] Revision routes to results
- [x] Results shows all phase scores
- [x] Composite scoring works correctly
- [x] LP changes based on placement
- [x] Mock data in all phases
- [x] No linter errors
- [x] TypeScript compilation successful
- [x] Build completes successfully
- [x] Practice mode unchanged
- [x] Quick Match mode unchanged

## 📊 Build Output

All new routes successfully built:
```
├ ○ /ranked/peer-feedback                3.02 kB         105 kB
├ ○ /ranked/revision                     2.61 kB         105 kB
├ ○ /ranked/results                      4.43 kB         229 kB
└ ○ /ranked/session                      2.53 kB         104 kB
```

## 🔜 Next Steps (Database & AI Integration)

When ready to replace mock data with real implementation:

### 1. Database Schema Updates

Add to Firestore:
- `battles` collection for multiplayer sessions
- `peer_feedback` subcollection
- `revisions` subcollection
- Update `WritingSession` type to include `revisedContent`

### 2. API Endpoints Needed

- `/api/evaluate-writing` - For Phase 1 scoring
- `/api/evaluate-feedback` - For Phase 2 scoring
- `/api/generate-feedback` - AI feedback for Phase 3
- `/api/evaluate-revision` - For Phase 3 scoring

### 3. Real-time Matching

- Implement party matching system
- Assign peer writings (ensure no self-reviews)
- Sync phase progression across party members

### 4. Integration Points

All mock data calls are clearly marked with comments like:
- `// Mock AI scoring`
- `const MOCK_PEER_WRITINGS = ...`
- `const MOCK_AI_FEEDBACK = ...`

Search for these patterns to find integration points.

## 🎉 Summary

The 3-phase battle system is now fully functional with mock data for testing! The flow is smooth, all timers work, and the scoring system calculates composite scores correctly. Practice and Quick Match modes are unchanged.

**Ready for testing and iteration on the flow/UX before integrating real AI and database calls!**

