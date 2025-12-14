# Rank System

**Status**: Design Complete  
**Date**: December 11, 2025

---

## Overview

A skill-based progression system with 3 levels (Scribe, Scholar, Loremaster) and 3 tiers each. Players unlock harder writing modes as they demonstrate mastery.

---

## Levels & Modes

| Level | Mode | Unlocked At |
|-------|------|-------------|
| **Scribe** | Paragraph | Start (everyone) |
| **Scholar** | Essay | Scribe I → Scholar III |
| **Loremaster** | Essay + Passage | Scholar I → Loremaster III |

---

## Tiers & Thresholds

| Tier | Threshold | To Promote |
|------|-----------|------------|
| **T3** | 70% | → T2 |
| **T2** | 80% | → T1 |
| **T1** | 90% | → Next Level |

---

## Full Progression Path

```
Scribe III → Scribe II → Scribe I → Scholar III → Scholar II → Scholar I → Loremaster III → Loremaster II → Loremaster I
  (70%)       (80%)       (90%)       (70%)        (80%)        (90%)        (70%)          (80%)          (90%)
  
  └─────── Paragraph ───────────┘    └─────── Essay ──────────────┘    └─────── Essay + Passage ─────────┘
```

---

## Mode Access

| Mode | Ranked | Practice |
|------|--------|----------|
| Paragraph | Everyone | ✅ |
| Essay | Scholar+ only | ✅ |
| Essay + Passage | Loremaster+ only | ✅ |

---

## LP System

| Setting | Value |
|---------|-------|
| Tier LP cap | **100** |
| Start LP (new tier) | **65** |
| LP to promote | **+35** |
| LP to demote | **−65** |

---

## Score Calculation (with Revision)

**Revision is required** to earn tier LP. Effective score is weighted: 90% original, 10% revised.

```typescript
function getEffectiveScore(originalScore: number, revisedScore?: number): number {
  const revised = revisedScore ?? originalScore;
  return (originalScore * 0.9) + (revised * 0.1);
}
```

| Original | Revised | Effective Score | Notes |
|----------|---------|-----------------|-------|
| 70% | 90% | **72%** | +2% boost from revision |
| 80% | 95% | **81.5%** | +1.5% boost |
| 60% | 85% | **62.5%** | +2.5% boost |

**How it works:**
1. Submit original writing → get feedback (no LP yet)
2. Revise with feedback → tier LP awarded using effective score
3. **Both ranked and practice modes require revision** to earn LP
4. Revision encourages engagement with feedback (worst case: no changes, same score)

---

## LP Calculation

```typescript
function getThreshold(tier: 1 | 2 | 3): number {
  if (tier === 3) return 70;
  if (tier === 2) return 80;
  return 90;
}

function calculateTierLP(effectiveScore: number, threshold: number): number {
  const delta = effectiveScore - threshold;
  const lp = 10 + delta;  // +10 base at threshold
  return Math.max(-15, Math.min(20, lp));
}

function calculatePracticeLP(effectiveScore: number, threshold: number): number {
  const rankedLP = calculateTierLP(effectiveScore, threshold);
  if (rankedLP <= 0) return 0;        // No negative LP in practice
  return Math.round(rankedLP * 0.25); // Quarter LP for gains
}
```

---

## LP by Effective Score (Ranked)

| Effective Score | T3 (70%) | T2 (80%) | T1 (90%) |
|-----------------|----------|----------|----------|
| 100% | +20 | +20 | +20 |
| 90% | +20 | +20 | +10 |
| 80% | +20 | +10 | 0 |
| 70% | +10 | 0 | −10 |
| 60% | 0 | −10 | −15 |
| 50% | −10 | −15 | −15 |

---

## LP by Effective Score (Practice)

| Effective Score | T3 (70%) | T2 (80%) | T1 (90%) |
|-----------------|----------|----------|----------|
| 100% | +5 | +5 | +5 |
| 90% | +5 | +5 | +3 |
| 80% | +5 | +3 | 0 |
| 70% | +3 | 0 | 0 |
| 60% | 0 | 0 | 0 |
| 50% | 0 | 0 | 0 |

---

## LP Sources Summary

| Activity | Tier LP | Total LP | Notes |
|----------|---------|----------|-------|
| **Ranked** | Full (−15 to +20) | Full | Main progression mode |
| **Lesson mastery** | +5 flat | +5 | Rewards learning |
| **Practice** | Quarter, no negative (0 to +5) | Same | Safe experimentation |

---

## Promotion & Demotion

| Current Rank | Promote To | Demote To |
|--------------|------------|-----------|
| Scribe III | Scribe II | *(floor)* |
| Scribe II | Scribe I | Scribe III |
| Scribe I | **Scholar III** | Scribe II |
| Scholar III | Scholar II | **Scribe I** ← re-locks essay |
| Scholar II | Scholar I | Scholar III |
| Scholar I | **Loremaster III** | Scholar II |
| Loremaster III | Loremaster II | **Scholar I** ← re-locks passage |
| Loremaster II | Loremaster I | Loremaster III |
| Loremaster I | *(max rank)* | Loremaster II |

---

## Pace

| Scenario | Submissions per Tier |
|----------|----------------------|
| Crushing (+20 LP) | **2** |
| Solid (+10 LP) | **4** |
| Demote (−10 LP) | **7** |
| Demote (−15 LP) | **5** |

---

## Time to Max Rank (Happy Path)

- ~2 submissions per tier × 9 tiers = **18 submissions**
- Scribe: 6 subs × 7.5 min = **45 min**
- Scholar: 6 subs × 17.5 min = **105 min**
- Loremaster: 6 subs × 25 min = **150 min**
- **Total: ~5 hours**

---

## Schema

```typescript
type SkillLevel = 'scribe' | 'scholar' | 'loremaster';
type SkillTier = 1 | 2 | 3;
type SubmissionLevel = 'paragraph' | 'essay' | 'essay_passage';

interface UserProfile {
  skillLevel: SkillLevel;
  skillTier: SkillTier;
  tierLP: number;        // 0-100, current progress
  totalLP: number;       // Lifetime LP (for leaderboards)
}
```

---

## Starting Point

Everyone begins at **Scribe III** with **65 LP**.

---

## Related Files

- `lib/types/index.ts` - Type definitions
- `lib/utils/score-calculator.ts` - LP calculation
- `lib/services/user-profile.ts` - User profile management
- `app/fantasy/ranked/page.tsx` - Ranked battle flow
