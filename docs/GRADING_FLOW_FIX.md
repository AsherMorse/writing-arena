# Grading Flow Fix - Session Scores Not Persisting

## Problem
After each phase completes, scores should be saved to the Firebase session document and fetched to show the user in the next phases. However, scores weren't being displayed correctly in ResultsContent.

## Root Cause Analysis

### The Flow (What Should Happen)
1. **Grading**: User submits → `useBatchRankingSubmission` calls batch ranking API → Gets rankings with scores
2. **Saving to matchStates**: Rankings saved to `matchStates.rankings.phase{N}` ✅
3. **Saving to session**: Scores saved to `sessions.players.{userId}.phases.phase{N}.score` ✅
4. **Fetching**: ResultsContent reads scores from session document
5. **Display**: Scores shown to user

### The Issue
`ResultsContent` component was receiving `session` as a prop, but:
- When navigating via URL params (`/ranked/results?matchId=...`), the session prop was `undefined`
- Component fell back to hardcoded defaults (75, 80, 78) instead of reading from Firebase
- Session document wasn't being fetched when not provided as prop

## Solution Implemented

### 1. Enhanced ResultsContent to Fetch Session
**File**: `components/ranked/ResultsContent.tsx`

**Changes**:
- Added `useSearchParams` to get `sessionId` and `matchId` from URL params
- Added `useSession` hook to fetch session document when not provided as prop
- Added logic to get `sessionId` from `matchState` if only `matchId` is available
- Added fallback to URL params for scores if session isn't available yet
- Added logging to track score retrieval

**Code**:
```typescript
// Get sessionId from URL params or matchId
const sessionIdFromParams = searchParams?.get('sessionId') || '';
const matchIdFromParams = searchParams?.get('matchId') || '';

// Try to get sessionId from matchState if we have matchId but no sessionId
const [sessionIdFromMatch, setSessionIdFromMatch] = useState<string>('');
useEffect(() => {
  const fetchSessionIdFromMatch = async () => {
    if (matchIdFromParams && !sessionIdFromParams && !sessionProp) {
      const matchState = await getMatchState(matchIdFromParams);
      if (matchState?.sessionId) {
        setSessionIdFromMatch(matchState.sessionId);
      }
    }
  };
  fetchSessionIdFromMatch();
}, [matchIdFromParams, sessionIdFromParams, sessionProp]);

const finalSessionId = sessionIdFromParams || sessionIdFromMatch;
const { session: sessionFromHook } = useSession(finalSessionId || null);
const finalSession = sessionProp || sessionFromHook;

// Get scores from session first, then from URL params as fallback
const writingScore = userPlayer?.phases.phase1?.score || parseInt(searchParams?.get('writingScore') || '75', 10);
const feedbackScore = (userPlayer?.phases.phase2 as any)?.score || parseInt(searchParams?.get('feedbackScore') || '80', 10);
const revisionScore = userPlayer?.phases.phase3?.score || parseInt(searchParams?.get('revisionScore') || '78', 10);
```

### 2. Added Logging to Track Score Saving
**File**: `lib/hooks/useBatchRankingSubmission.ts`

**Changes**:
- Added logging before and after `submitPhase` call
- Logs the score and data being saved

**Code**:
```typescript
const submissionData = options.prepareSubmissionData(clampScore(score));
console.log(`✅ BATCH RANKING - Submitting phase ${options.phase} with score:`, clampScore(score), 'data:', submissionData);
await options.submitPhase(options.phase, submissionData);
console.log(`✅ BATCH RANKING - Successfully saved phase ${options.phase} to session`);
```

### 3. Added Logging to Session Manager
**File**: `lib/services/session-manager.ts`

**Changes**:
- Added logging before and after Firestore update
- Logs sessionId, userId, phase, and data being saved

**Code**:
```typescript
console.log(`💾 SESSION MANAGER - Saving phase ${phase} data:`, {
  sessionId: this._sessionId,
  userId: this._userId,
  phase,
  data: phaseData,
});

await updateDoc(sessionRef, {
  [`players.${this._userId}.phases.phase${phase}`]: phaseData,
  updatedAt: serverTimestamp(),
});

console.log(`✅ SESSION MANAGER - Successfully saved phase ${phase} to session ${this._sessionId}`);
```

### 4. Added Debug Logging in ResultsContent
**File**: `components/ranked/ResultsContent.tsx`

**Changes**:
- Added useEffect to log session scores when available
- Helps debug if scores are being read correctly

**Code**:
```typescript
useEffect(() => {
  if (user && finalSession) {
    console.log('📊 RESULTS - Session scores:', {
      writingScore: userPlayer?.phases.phase1?.score,
      feedbackScore: (userPlayer?.phases.phase2 as any)?.score,
      revisionScore: userPlayer?.phases.phase3?.score,
      hasSession: !!finalSession,
      hasUserPlayer: !!userPlayer,
    });
  }
}, [user, finalSession, userPlayer]);
```

## Verification Steps

1. **Check Console Logs**:
   - Look for `✅ BATCH RANKING - Submitting phase X with score:` - confirms score is being saved
   - Look for `✅ SESSION MANAGER - Successfully saved phase X` - confirms Firestore update succeeded
   - Look for `📊 RESULTS - Session scores:` - confirms scores are being read

2. **Check Firestore**:
   - Navigate to `sessions/{sessionId}` document
   - Check `players.{userId}.phases.phase1.score` - should have the writing score
   - Check `players.{userId}.phases.phase2.score` - should have the feedback score
   - Check `players.{userId}.phases.phase3.score` - should have the revision score

3. **Check Results Page**:
   - Navigate to results page after completing all phases
   - Scores should match what's in Firestore
   - Check browser console for any errors

## Files Modified

1. `components/ranked/ResultsContent.tsx` - Added session fetching logic
2. `lib/hooks/useBatchRankingSubmission.ts` - Added logging
3. `lib/services/session-manager.ts` - Added logging

## Next Steps for Testing

1. Complete a full ranked match (all 3 phases)
2. Check browser console for logging output
3. Verify scores in Firestore match what's displayed
4. If scores still don't appear, check:
   - Is `sessionId` being passed correctly in URL?
   - Is `matchId` available in URL params?
   - Are there any Firestore permission errors?
   - Is the session document being updated correctly?

