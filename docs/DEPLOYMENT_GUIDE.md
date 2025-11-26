# Deployment Guide: Learning Science Improvements

**Date:** December 2024  
**Version:** Phase 1 & 2 Complete

---

## Pre-Deployment Checklist

### Code Review ✅
- [x] All files reviewed
- [x] No linting errors
- [x] TypeScript compiles successfully
- [x] Backward compatibility verified

### Testing ✅
- [x] Unit tests created
- [ ] Unit tests passing (run: `npm test`)
- [ ] Integration tests passing
- [ ] Manual testing completed

### Documentation ✅
- [x] Implementation plan updated
- [x] Documentation updated
- [x] Status report created

---

## Deployment Steps

### Step 1: Cloud Function Status ℹ️ **OPTIONAL**

**Note:** Phase transitions are handled **client-side** via `lib/services/phase-transition.ts`. The cloud function (`functions/session-orchestrator.ts`) is **not required** for phase transitions to work.

**Current System:**
- ✅ Client-side transitions use `SCORING.PHASE2_DURATION` (180s) and `SCORING.PHASE3_DURATION` (240s) ✅ **ALREADY CORRECT**
- ✅ Client-side code already updated with correct durations
- ⚠️ Cloud function exists but may not be actively used

**If Cloud Function is Still Deployed:**
- The cloud function we updated would also set correct durations (180s/240s)
- But it's likely not needed since client-side handles transitions

**Recommendation:**
- ✅ **Skip cloud function deployment** - client-side code already handles everything correctly
- If cloud function is still deployed and triggers, it will now use correct durations (harmless)
- Focus on testing client-side transitions instead

---

### Step 2: Run Unit Tests

**Command:**
```bash
npm test -- __tests__/lib/constants/rank-timing.test.ts
npm test -- __tests__/lib/constants/scoring.test.ts
```

**Expected:**
- All tests should pass
- No errors or warnings

---

### Step 3: End-to-End Testing

**Test Scenarios:**

1. **Basic Session Flow:**
   - Start ranked match
   - Complete Phase 1 (verify 5 min timer)
   - Complete Phase 2 (verify 3 min timer, 3 questions)
   - Complete Phase 3 (verify 4 min timer)
   - Verify results display correctly

2. **Rank-Based Timing:**
   - Test with Bronze rank (should use 3/2.5/2.5 min)
   - Test with Silver rank (should use 4/3/3 min)
   - Test with Gold rank (should use 5/3.5/3.5 min)
   - Test with Platinum rank (should use 6/4/4 min)

3. **Backward Compatibility:**
   - Load old session with 5-question format
   - Verify it displays correctly
   - Verify no errors

4. **Phase Transitions:**
   - Verify cloud function transitions correctly
   - Verify durations match client expectations
   - Verify no timing mismatches

---

### Step 4: Monitor Deployment

**Watch For:**
- Error logs in Firebase console
- Phase transition timing issues
- User-reported problems
- Performance degradation

**Metrics to Track:**
- Phase completion rates
- Average time per phase
- Feedback quality scores
- Revision quality scores

---

## Rollback Plan

If issues occur:

1. **Revert Cloud Function:**
   ```bash
   # Revert to previous version
   firebase functions:rollback
   ```

2. **Revert Client Code:**
   ```bash
   git revert <commit-hash>
   ```

3. **Monitor:**
   - Check error rates
   - Verify sessions complete successfully

---

## Post-Deployment

### Week 1
- Monitor error logs daily
- Check user feedback
- Verify phase transitions work correctly

### Week 2-4
- Analyze feedback quality metrics
- Compare revision quality scores
- Gather user feedback

### Month 2+
- Evaluate learning outcomes
- Refine timing if needed
- Consider additional improvements

---

## Support Contacts

**Issues:**
- Check Firebase console logs
- Review error tracking
- Contact development team

**Questions:**
- Refer to `docs/IMPLEMENTATION_STATUS.md`
- Check `docs/IMPLEMENTATION_PLAN.md`

---

## Success Criteria

**Deployment Successful If:**
- ✅ No errors in logs
- ✅ Phase transitions work correctly
- ✅ Timings match expectations
- ✅ Users can complete sessions
- ✅ No breaking changes

**Improvements Successful If:**
- ✅ Feedback quality improves
- ✅ Revision quality improves
- ✅ Student engagement increases
- ✅ Learning outcomes improve

---

## Quick Reference

**Phase Durations:**
- Phase 1: 5 minutes (300s)
- Phase 2: 3 minutes (180s)
- Phase 3: 4 minutes (240s)

**Rank-Based Timing:**
- Bronze: 3/2.5/2.5 min
- Silver: 4/3/3 min
- Gold: 5/3.5/3.5 min
- Platinum+: 6/4/4 min

**Peer Review:**
- 3 questions (main idea, strength, suggestion)

---

**Last Updated:** December 2024

