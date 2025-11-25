# Implementation Plan Summary

**Quick Reference for Addressing Learning Science Concerns**

---

## 🎯 Three Main Changes

### 1. Increase Phase Durations ⏱️
- **Phase 1:** 2 min → **4 min**
- **Phase 2:** 1.5 min → **3 min**
- **Phase 3:** 1.5 min → **3 min**
- **Total:** 5 min → **10 min**

### 2. Reduce Peer Review Questions 📝
- **From:** 5 questions (clarity, strengths, improvements, organization, engagement)
- **To:** 3 questions (main idea, one strength, one suggestion)

### 3. Implement Rank-Based Difficulty 🎖️
- **Bronze:** 3 min writing (sentence-level)
- **Silver:** 4 min writing (paragraphs)
- **Gold:** 5 min writing (micro-essays)
- **Platinum+:** 6 min writing (AP-level FRQ)

---

## 📋 Implementation Phases

### Phase 1: Critical Changes (Week 1-2)
**Priority:** 🔴 Critical  
**Focus:** Timing and peer review questions

**Key Tasks:**
1. Update `lib/constants/scoring.ts` - Change durations to 240/180/180
2. Update `functions/session-orchestrator.ts` - Change hardcoded 90s to 180s
3. Update `components/ranked/PeerFeedbackContent.tsx` - Change 5 questions to 3
4. Update all API endpoints - Handle new 3-question format
5. Update validation logic - Check 3 fields instead of 5
6. Implement backward compatibility - Support old format during transition

**Files Changed:** ~10 files  
**Estimated Time:** 1-2 weeks

---

### Phase 2: Rank-Based Scaling (Week 3-4)
**Priority:** 🟡 Medium  
**Focus:** Dynamic timing based on student rank

**Key Tasks:**
1. Create `lib/constants/rank-timing.ts` - Rank-based timing configuration
2. Update session creation - Pass rank and use rank-based durations
3. Update session orchestrator - Use rank for phase transitions
4. Create prompt complexity system - Rank-based guidance (optional)

**Files Changed:** ~5 files  
**Estimated Time:** 1-2 weeks

---

### Phase 3: Testing & Validation (Week 4)
**Priority:** 🟡 Medium  
**Focus:** Ensure quality and reliability

**Key Tasks:**
1. Unit tests - Rank timing, migration, validation
2. Integration tests - Full session flow, API endpoints
3. User acceptance testing - Real scenarios, edge cases

**Files Changed:** ~5 test files  
**Estimated Time:** 1 week

---

## 🚀 Quick Start Guide

### Step 1: Update Constants (30 min)
```typescript
// lib/constants/scoring.ts
PHASE1_DURATION: 240,  // Was 120
PHASE2_DURATION: 180,  // Was 90
PHASE3_DURATION: 180,  // Was 90
```

### Step 2: Update Peer Feedback (2-3 hours)
```typescript
// components/ranked/PeerFeedbackContent.tsx
const [responses, setResponses] = useState({
  mainIdea: '',      // Was clarity
  strength: '',      // Was strengths
  suggestion: ''     // Was improvements (removed organization, engagement)
});
```

### Step 3: Update APIs (2-3 hours)
- Update `/api/evaluate-peer-feedback`
- Update `/api/batch-rank-feedback`
- Update `/api/generate-ai-feedback`
- Update prompt functions

### Step 4: Test Everything (1-2 days)
- Run existing tests
- Test full session flow
- Verify backward compatibility

---

## 📊 Impact Assessment

### Before Changes:
- ⚠️ 5-minute cycle = cognitive overload
- ⚠️ 5 questions in 90 seconds = shallow feedback
- ⚠️ 90-second revision = cosmetic edits only
- ⚠️ No rank-based scaffolding

### After Changes:
- ✅ 10-minute cycle = adequate time for learning
- ✅ 3 questions in 3 minutes = quality feedback possible
- ✅ 3-minute revision = meaningful changes possible
- ✅ Rank-based timing = proper scaffolding

---

## ⚠️ Critical Considerations

### Backward Compatibility
- **Issue:** Existing sessions may have old 5-question format
- **Solution:** Migration utility converts old → new format
- **Timeline:** Support both formats for 2-4 weeks, then deprecate

### Rank-Based Timing
- **Issue:** How to handle mixed-rank groups?
- **Solution:** Use median/average rank of group
- **Fallback:** Default to Silver tier timing if rank unavailable

### Testing Strategy
- **Unit Tests:** All new utilities and functions
- **Integration Tests:** Full session flow with new timings
- **E2E Tests:** User scenarios with different ranks
- **Backward Compatibility:** Test with old format data

---

## 📈 Success Metrics

### Immediate (Week 1-2):
- [ ] All phases use new durations
- [ ] Peer review uses 3 questions
- [ ] No breaking changes
- [ ] All tests pass

### Short-term (Week 3-4):
- [ ] Rank-based timing works
- [ ] No performance issues
- [ ] User feedback positive

### Long-term (Month 2+):
- [ ] Improved feedback quality metrics
- [ ] Better revision quality scores
- [ ] Increased student engagement
- [ ] Alignment with TWR principles validated

---

## 🔗 Related Documents

- **Full Implementation Plan:** `docs/IMPLEMENTATION_PLAN.md`
- **Feedback Analysis:** `docs/REVIEW_FEEDBACK_ANALYSIS.md`
- **Three Phase System:** `docs/7_Features/THREE_PHASE_BATTLE_SYSTEM.md`

---

## 💡 Key Decisions Needed

1. **Backward Compatibility Timeline:** How long to support old format?
2. **Rank Calculation:** Average vs. median vs. leader's rank?
3. **Feature Rollout:** All at once or gradual with feature flags?
4. **Prompt Complexity:** Full filtering or just guidance?

---

## 📞 Next Steps

1. ✅ Review implementation plan
2. ⏳ Get team approval
3. ⏳ Create GitHub issues
4. ⏳ Assign tasks
5. ⏳ Begin Phase 1 implementation

---

**Last Updated:** December 2024  
**Status:** Ready for Implementation


