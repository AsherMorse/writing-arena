# 🔍 DEBUGGING GUIDE - Phase Timing Issues

## ✅ What I've Verified:

### Cloud Function Code (session-orchestrator.ts):
```typescript
// Phase 1 → 2:
updates['config.phase'] = 2;
updates['config.phaseDuration'] = 60;  ✅ SETS TO 60
updates['timing.phase2StartTime'] = serverTimestamp();  ✅ SETS START TIME

// Phase 2 → 3:
updates['config.phase'] = 3;
updates['config.phaseDuration'] = 60;  ✅ SETS TO 60
updates['timing.phase3StartTime'] = serverTimestamp();  ✅ SETS START TIME
```

### Timer Calculation Logic:
```typescript
getPhaseTimeRemaining() {
  if (phase === 2) startTime = timing.phase2StartTime;  ✅ USES CORRECT START
  elapsed = NOW - startTime.toMillis();
  remaining = phaseDuration - elapsed;  ✅ USES CONFIG DURATION
  return Math.max(0, remaining);
}
```

### Grace Periods:
```typescript
Phase 1: 5 seconds  ✅
Phase 2: 3 seconds  ✅
Phase 3: 3 seconds  ✅
```

---

## 🔥 WHAT TO CHECK IN CONSOLE:

When you run a fresh session, look for these EXACT logs:

### **Phase 1 → 2 Transition:**
```
✅ CLIENT COORDINATOR - Phase 1 submitted
[Wait for AI submissions]
🔍 SESSION ORCHESTRATOR - Checking submissions
📊 SESSION ORCHESTRATOR - Submissions: {phase: 1, submitted: 1, total: 1}
✅ SESSION ORCHESTRATOR - All players submitted!
🔄 SESSION ORCHESTRATOR - Transitioning to phase 2 (60 seconds)...
✅ SESSION ORCHESTRATOR - Transitioned to phase 2
```

### **Phase 2 Loads - Check These:**
```
🔍 PHASE 2 AUTO-SUBMIT CHECK: {
  timeRemaining: 60,  ← SHOULD START AT ~60
  hasSubmitted: false,
  phaseAge: 100,  ← Should be small (just loaded)
  willSubmit: false,  ← SHOULD BE FALSE
  session: {
    phase: 2,  ← CORRECT
    phaseDuration: 60,  ← MUST BE 60, NOT 120
    phase2StartTime: 'SET'  ← MUST BE SET
  }
}

⏱️ SESSION MANAGER - Time calculation: {
  elapsed: 0,  ← Should be near 0
  remaining: 60,  ← SHOULD BE ~60
  duration: 60  ← MUST BE 60
}
```

---

## ❌ IF YOU SEE THIS, IT'S BROKEN:

### **Bad Timer Calculation:**
```
⏱️ SESSION MANAGER - Time calculation: {
  elapsed: 150,  ← WRONG: Using Phase 1's elapsed time
  remaining: -30,  ← NEGATIVE!
  duration: 120  ← WRONG: Still using Phase 1 duration
}
```

This means:
- phaseDuration NOT updating to 60
- OR phase2StartTime NOT being set
- OR using wrong start time in calculation

---

## 🎯 SPECIFIC THINGS TO VERIFY:

1. **When Phase 2 loads, what is `session.config.phaseDuration`?**
   - Should be: 60
   - If it's: 120 → Cloud Function not setting it

2. **When Phase 2 loads, is `session.timing.phase2StartTime` set?**
   - Should be: SET (Timestamp object)
   - If it's: MISSING → Cloud Function not setting it

3. **When Phase 2 loads, what is `timeRemaining`?**
   - Should be: ~58-60 seconds
   - If it's: 0 or negative → Timer calculation broken

4. **How long before auto-submit fires?**
   - Should be: ~60 seconds
   - If it's: 5-10 seconds → Something triggering early

---

## 🔧 POSSIBLE ISSUES:

### Issue A: Cloud Function Not Setting phaseDuration
**Symptom**: phaseDuration stays at 120
**Fix**: Check Firebase Function logs, may need to redeploy

### Issue B: Timing Not Propagating
**Symptom**: phase2StartTime is MISSING
**Fix**: Increase grace period, or check Firestore rules

### Issue C: Using Wrong Start Time
**Symptom**: elapsed time way too high
**Fix**: Timer calculation using wrong timestamp

### Issue D: Multiple Components Rendering
**Symptom**: useState(Date.now()) running multiple times
**Fix**: Use useRef instead of useState for phaseLoadTime

---

## 🚀 NEXT STEPS:

1. **Hard refresh** (Cmd+Shift+R)
2. **Start FRESH session**
3. **Open console** BEFORE starting
4. **Complete Phase 1**
5. **When Phase 2 loads, IMMEDIATELY look for:**
   - `🔍 PHASE 2 AUTO-SUBMIT CHECK` log
   - `⏱️ SESSION MANAGER - Time calculation` log
6. **Screenshot or copy those logs and send them**

I need to see the ACTUAL VALUES to diagnose the exact issue!

