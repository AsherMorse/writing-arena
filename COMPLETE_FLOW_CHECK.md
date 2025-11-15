# Complete Flow Check - TWR Feedback & LP Updates

## ✅ TWR FEEDBACK AT EACH PHASE

### Phase 1: Writing
**API**: `/api/batch-rank-writings`
**Prompt**: `generateTWRBatchRankingPrompt()` ✅
**TWR Elements**:
- ✅ Checks for sentence expansion (because/but/so)
- ✅ Identifies appositives
- ✅ Evaluates sentence combining
- ✅ Checks transition words
- ✅ Scores based on TWR strategy count (5+ = 90-100)
- ✅ Requires quoting student text
- ✅ Names specific TWR strategies

**Output**: Rankings with TWR-specific strengths/improvements

---

### Phase 2: Peer Feedback
**API**: `/api/batch-rank-feedback`
**Prompt**: `generateTWRPeerFeedbackPrompt()` ✅
**TWR Elements**:
- ✅ Rewards feedback that names TWR strategies
- ✅ Requires quoting peer's text
- ✅ Penalizes vague comments
- ✅ High scores for concrete TWR suggestions

**Output**: Score based on feedback specificity

---

### Phase 3: Revision
**API 1**: `/api/generate-feedback` (for AI guidance)
**Prompt**: `generateTWRFeedbackPrompt()` ✅
**TWR Elements**:
- ✅ Analyzes user's original writing
- ✅ Quotes exact sentences
- ✅ Names TWR strategies to use
- ✅ Gives concrete before/after examples

**API 2**: `/api/batch-rank-revisions` (for scoring)
**Prompt**: `generateTWRRevisionPrompt()` ✅
**TWR Elements**:
- ✅ Checks if TWR strategies applied
- ✅ Identifies specific improvements made
- ✅ Compares original vs revised

**Output**: Real, specific feedback + revision score

---

## ⚠️ ISSUE FOUND: ResultsContent Not Compatible

**Problem**: ResultsContent expects URL params:
```typescript
const searchParams = useSearchParams();
const matchId = searchParams.get('matchId');
const trait = searchParams.get('trait');
// ... etc
```

**But**: New session architecture doesn't use URL params!

**Impact**: ResultsContent can't load match data, LP updates fail

---

## 🔧 FIX REQUIRED:

ResultsContent needs to be updated to:
1. Get matchId from session (not URL)
2. Get all scores from session.players
3. Calculate LP change
4. Call updateUserStatsAfterSession()

---

## 📊 LP UPDATE FLOW (Currently):

```typescript
ResultsContent loads
↓
Gets matchId from URL ❌ (doesn't exist in new architecture)
↓
Loads rankings from matchStates
↓
Calculates LP change
↓
Calls updateUserStatsAfterSession(uid, xp, points, lpChange)
↓
Updates Firestore users/{uid}
```

**This is broken in new session architecture!**

---

## ✅ WHAT NEEDS TO BE FIXED:

1. Update ResultsContent to work with session data (not URL params)
2. Pass session to ResultsContent
3. Extract scores from session.players.{userId}.phases
4. Calculate LP based on rankings
5. Update user profile

Let me fix this NOW.

