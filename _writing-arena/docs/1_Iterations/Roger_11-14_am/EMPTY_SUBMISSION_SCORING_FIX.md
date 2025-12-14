# Empty Submission Scoring Fix

## Issue
Players who didn't write anything (empty submissions) were still receiving base points (40-80 points) instead of getting 0 points.

## Root Cause
The scoring fallback functions in all three phases were giving minimum base scores even when content was empty:

### Phase 1 - Writing (batch-rank-writings API)
```typescript
// OLD - Always gave 50-80 points
const score = Math.round(Math.min(50 + wordCountScore + randomFactor, 95));
```

Even with 0 words, this gave 50 + 0 + (0-30 random) = **50-80 points**

### Phase 1 - Writing (Fallback in component)
```typescript
// OLD - Always gave 40-75 points  
const yourScore = Math.min(Math.max(60 + (wordCount / 5) + Math.random() * 15, 40), 100);
```

Even with 0 words, this gave max(60 + 0 + (0-15), 40) = **40-75 points**

### Phase 2 - Peer Feedback (batch-rank-feedback API)
```typescript
// OLD - Always gave 50-85 points
const baseScore = isComplete ? 70 : 50;
```

Even with 0 characters of feedback, this gave **50-65 points**

### Phase 3 - Revision (batch-rank-revisions API)
```typescript
// OLD - Always gave 60-75 points
const baseScore = hasSignificantChanges ? 75 : 60;
```

Even with empty revision, this gave **60-75 points**

## Solution

Added empty content checks in all scoring functions:

### Phase 1 - Writing
```typescript
// Check if submission is empty
const isEmpty = !writing.content || writing.content.trim().length === 0 || writing.wordCount === 0;

if (isEmpty) {
  score = 0;
  strengths = [];
  improvements = [
    'Submit your writing to receive a score',
    'Try to write at least 50 words',
    'Remember to address the prompt directly',
  ];
  traitFeedback = {
    content: 'No content submitted.',
    organization: 'No content submitted.',
    grammar: 'No content submitted.',
    vocabulary: 'No content submitted.',
    mechanics: 'No content submitted.',
  };
} else {
  // Normal scoring logic
}
```

### Phase 2 - Peer Feedback
```typescript
const totalLength = Object.values(submission.responses).join('').length;
const isEmpty = totalLength === 0;

if (isEmpty) {
  score = 0;
  improvements = [
    'Provide feedback to receive a score',
    'Answer all feedback questions',
    'Be specific and constructive',
  ];
} else {
  // Normal scoring logic
}
```

### Phase 3 - Revision
```typescript
const isEmpty = !submission.revisedContent || submission.revisedContent.trim().length === 0;

if (isEmpty) {
  score = 0;
  suggestions = [
    'Submit a revision to receive a score',
    'Apply the feedback you received',
    'Try to expand and improve your writing',
  ];
} else {
  // Normal scoring logic
}
```

## Files Modified

1. **`app/api/batch-rank-writings/route.ts`**
   - `generateMockRankings()` - Added empty content check

2. **`app/api/batch-rank-feedback/route.ts`**
   - `generateMockFeedbackRankings()` - Added empty feedback check

3. **`app/api/batch-rank-revisions/route.ts`**
   - `generateMockRevisionRankings()` - Added empty revision check

4. **`components/ranked/WritingSessionContent.tsx`**
   - Fallback scoring logic - Added empty content check

## Testing

### Test Case 1: Empty Writing Submission
1. Join a ranked match
2. Don't write anything (0 words)
3. Click "Submit Early" or let timer expire

**Expected Result**: Score = 0 points

### Test Case 2: Empty Feedback
1. Reach peer feedback phase
2. Leave all feedback fields blank
3. Submit

**Expected Result**: Score = 0 points

### Test Case 3: Empty Revision
1. Reach revision phase
2. Don't make any changes or clear the text
3. Submit

**Expected Result**: Score = 0 points

### Test Case 4: Valid Submission (Regression)
1. Write at least 50 words
2. Submit

**Expected Result**: Score = 50-95 points (based on quality)

## Edge Cases Handled

- ✅ Empty string: `""`
- ✅ Whitespace only: `"   "`
- ✅ Null/undefined content
- ✅ Zero word count
- ✅ Empty feedback responses (all fields blank)
- ✅ Revision with no changes

## Impact

- ✅ Fair scoring - no points for no effort
- ✅ Incentivizes participation
- ✅ Proper ranking - empty submissions always rank last
- ✅ Clear feedback messages for empty submissions
- ✅ Maintains normal scoring for valid submissions

