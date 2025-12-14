# Three-Phase Battle System (Ranked Mode Only)

## Overview

The Ranked battle experience has been enhanced to include three phases that test different writing skills. This creates a more comprehensive assessment of writing ability and engagement.

## Flow Diagram

```
Start Ranked Battle
      ↓
┌─────────────────────┐
│  PHASE 1: WRITING   │
│  (5 minutes)        │
│  Weight: 40%        │
└─────────────────────┘
      ↓
┌─────────────────────┐
│ PHASE 2: FEEDBACK   │
│  (3 minutes)        │
│  Weight: 30%        │
└─────────────────────┘
      ↓
┌─────────────────────┐
│ PHASE 3: REVISION   │
│  (4 minutes)        │
│  Weight: 30%        │
└─────────────────────┘
      ↓
┌─────────────────────┐
│  FINAL RESULTS      │
│  Composite Score    │
└─────────────────────┘
```

## Phase Details

### Phase 1: Writing (40% weight)
**File:** `/app/ranked/session/page.tsx`
**Duration:** 5 minutes (300 seconds)

- Players write an original response to a prompt
- AI evaluates the writing quality
- Score is calculated based on:
  - Content quality
  - Organization
  - Word count
  - Grammar and mechanics

**Mock Data:** Uses a simple formula based on word count + randomization for scoring

### Phase 2: Peer Feedback (30% weight)
**File:** `/app/ranked/peer-feedback/page.tsx`
**Duration:** 3 minutes (180 seconds)

- Players are shown another player's writing (randomly assigned)
- Must answer 3 targeted questions:
  1. What is the main idea?
  2. What is one strength?
  3. What is one specific suggestion?

- Feedback is evaluated based on:
  - Specificity (quotes from text)
  - Constructiveness (actionable suggestions)
  - Completeness (all 3 questions answered thoroughly)
  - Helpfulness

**Mock Data:** Feedback quality score based on whether all questions are completed

### Phase 3: Revision (30% weight)
**File:** `/app/ranked/revision/page.tsx`
**Duration:** 4 minutes (240 seconds)

- Players see their original writing
- Receive feedback from:
  - AI (strengths and suggestions)
  - Peer (their evaluation responses)
- Must revise their original work

- Revision is evaluated based on:
  - Quality of changes made
  - Application of feedback
  - Improvement over original
  - Overall writing quality of revision

**Mock Data:** 
- Mock AI feedback with 3 strengths and 3 suggestions
- Revision score based on amount of change and slight randomization

### Phase 4: Final Results
**File:** `/app/ranked/results/page.tsx`

Shows comprehensive breakdown:
- Individual scores for each phase
- Composite score calculation (weighted average)
- Rankings compared to other players
- Phase-by-phase comparison with opponents
- LP (League Points) change based on final placement
- XP and Points rewards (2.5x multiplier for ranked)

**Composite Score Formula:**
```
Composite = (Phase1 × 0.4) + (Phase2 × 0.3) + (Phase3 × 0.3)
```

**LP Changes by Placement:**
- 1st place: +35 LP
- 2nd place: +22 LP
- 3rd place: +12 LP
- 4th place: -5 LP
- 5th place: -15 LP

## Mock Data Implementation

### Current Mock Data Locations:

1. **Writing Scores** (`session/page.tsx`):
   ```typescript
   const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
   ```

2. **Peer Writings** (`peer-feedback/page.tsx`):
   ```typescript
   const MOCK_PEER_WRITINGS = [/* hardcoded sample writings */];
   ```

3. **Feedback Scoring** (`peer-feedback/page.tsx`):
   ```typescript
   const feedbackQuality = isFormComplete() ? Math.random() * 20 + 75 : Math.random() * 30 + 50;
   ```

4. **AI Feedback** (`revision/page.tsx`):
   ```typescript
   const MOCK_AI_FEEDBACK = {
     strengths: [/* 3 strength points */],
     improvements: [/* 3 improvement suggestions */],
     score: 78
   };
   ```

5. **Revision Scoring** (`revision/page.tsx`):
   ```typescript
   const revisionScore = hasSignificantChanges 
     ? Math.min(85 + Math.random() * 10, 95)
     : 60 + Math.random() * 15;
   ```

6. **AI Player Generation** (`results/page.tsx`):
   - Generates 4 AI players with randomized scores for all 3 phases
   - Each AI player has unique name, avatar, and rank

## Integration Points for Real Implementation

When replacing mock data with real functionality:

### Phase 1 - Writing
- [ ] Call real AI evaluation API
- [ ] Store writing in database with session ID
- [ ] Match players in same party

### Phase 2 - Peer Feedback
- [ ] Fetch real peer writing from matched player
- [ ] Call feedback evaluation API
- [ ] Store feedback in database
- [ ] Link feedback to recipient

### Phase 3 - Revision
- [ ] Fetch real AI feedback from evaluation API
- [ ] Fetch real peer feedback from database
- [ ] Call revision evaluation API
- [ ] Store revised writing

### Phase 4 - Results
- [ ] Fetch all players' scores from database
- [ ] Calculate real rankings
- [ ] Update user LP in database
- [ ] Award XP and points
- [ ] Save match history

## Important Notes

### Only Applies to Ranked Mode
- Practice mode: Single writing session only
- Quick Match mode: Single writing session only
- Ranked mode: Three-phase system

### Query Parameters Flow

**Session → Peer Feedback:**
```
?trait=...&promptType=...&content=...&wordCount=...&aiScores=...&yourScore=...
```

**Peer Feedback → Revision:**
```
...all previous + &feedbackScore=...&peerFeedback=...
```

**Revision → Results:**
```
...all previous + &originalContent=...&revisedContent=...&revisedWordCount=...&revisionScore=...
```

### Testing the Flow

To test the complete flow:
1. Navigate to `/ranked`
2. Select a mode and start matchmaking
3. Complete Phase 1: Writing (5 minutes, or let timer expire)
4. Complete Phase 2: Peer Feedback (3 minutes, answer all 3 questions)
5. Complete Phase 3: Revision (4 minutes, make changes to your writing)
6. View comprehensive results with all phase scores

## Future Enhancements

Potential additions to consider:
- [ ] Allow players to see the feedback they received
- [ ] Show improvement metrics over time
- [ ] Add badges for consistent good feedback
- [ ] Implement feedback quality tracking
- [ ] Add "Most Improved" awards for revision phase
- [ ] Create replay feature to review all phases

