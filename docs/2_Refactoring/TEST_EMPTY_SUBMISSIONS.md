# Testing Empty Submissions

## Quick Test Script

A test script has been created to simulate empty submissions across all phases and verify they get scored as 0.

### Running the Test

**Prerequisites:**
1. Start your dev server: `npm run dev`
2. Make sure the server is running on `http://localhost:3000` (or set `BASE_URL` env var)

**Run the test:**
```bash
npm run test:empty-submissions
```

Or directly:
```bash
node scripts/test-empty-submission-flow.js
```

### What It Tests

The script simulates a complete ranked match with **empty submissions** for all 3 phases:

1. **Phase 1 - Empty Writing:**
   - Submits empty content (`content: ''`, `wordCount: 0`)
   - Should get score: **0**

2. **Phase 2 - Empty Feedback:**
   - Submits empty feedback responses (all fields empty)
   - Should get score: **0**

3. **Phase 3 - Empty Revision:**
   - Submits empty revised content (`revisedContent: ''`, `wordCount: 0`)
   - Should get score: **0**

### Expected Output

```
🚀 Starting Empty Submission Flow Tests
================================================================================
Base URL: http://localhost:3000
================================================================================

================================================================================
📝 TEST 1: Phase 1 - Empty Writing Submission
================================================================================

📊 Submitting batch ranking request:
  - User writing: { content: '(EMPTY)', contentLength: 0, wordCount: 0 }
  - AI writings: 4
  - Total submissions: 5

📊 Response received:
  - Status: 200
  - Rankings count: 5

🎯 User Ranking:
  - Score: 0
  - Rank: 5
  ✅ CORRECT: Empty submission scored as 0

[... similar for Phase 2 and 3 ...]

📊 TEST SUMMARY
================================================================================

Phase 1 (Empty Writing): ✅ PASS (score: 0)
Phase 2 (Empty Feedback): ✅ PASS (score: 0)
Phase 3 (Empty Revision): ✅ PASS (score: 0)

================================================================================
✅ ALL TESTS PASSED - Empty submissions correctly scored as 0
================================================================================
```

### What to Look For

1. **All scores should be 0** for empty submissions
2. **Check server logs** for:
   - `⚠️ VALIDATION - Empty writing detected`
   - `⚠️ MOCK GENERATOR - Detected empty submission`
   - `⚠️ API key missing` warnings
   - Validation result logs

3. **If tests fail:**
   - Check server console for validation logs
   - Verify API key is configured (or mock data is working correctly)
   - Check what content is actually being submitted

### Debugging

The script logs:
- What's being submitted (content length, word count)
- API response status
- User's ranking and score
- Whether mock or real AI was used

Check the server console for additional logs from:
- Validation functions
- Batch ranking handler
- Mock generator

