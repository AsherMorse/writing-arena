# Ranked Match Flow V2 - Complete Technical Explanation

**Version**: 2.0  
**Last Updated**: November 30, 2024  
**Status**: Active Implementation

> **What's New in V2**: Updated to reflect unified task type design (all players write paragraphs), multi-dimensional skill evaluation, and practice mode integration.

---

## 🎯 **TL;DR - The Absolute Basics**

A ranked match is a **competitive 3-phase writing competition** where 5 players (real + AI) compete:
1. **Phase 1** (3-10 min): Everyone writes a paragraph on the same prompt
2. **Phase 2** (1-6 min): Everyone reviews another player's paragraph
3. **Phase 3** (1-7 min): Everyone revises their original paragraph based on feedback

**Key Update**: All players write the **same type of task** (paragraphs), judged against **tier-appropriate rubrics**.

After each phase, **Claude AI ranks all submissions** to determine scores. At the end, players are ranked by composite score and earn/lose LP (League Points) based on placement.

---

## 📊 **HIGH-LEVEL OVERVIEW**

### **The Journey**

```
User Flow:
┌─────────────────┐
│  Dashboard      │ User clicks "Ranked Match"
└────────┬────────┘
         ↓
┌─────────────────┐
│  Matchmaking    │ Choose: Wait for players OR Play with AI
└────────┬────────┘
         ↓
┌─────────────────┐
│  Lobby          │ 5 players gather (can be mixed tiers)
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 1        │ Writing (3-10 min, rank-dependent)
│  [Session]      │ → Auto-submit → Batch Ranking (Claude AI)
│                 │ → Multi-dimensional evaluation
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 2        │ Peer Feedback (1-6 min)
│  [Session]      │ → Auto-submit → Batch Ranking
└────────┬────────┘
         ↓
┌─────────────────┐
│  Phase 3        │ Revision (1-7 min)
│  [Session]      │ → Auto-submit → Batch Ranking
└────────┬────────┘
         ↓
┌─────────────────┐
│  Results        │ Rankings, LP change, XP earned
│  [Evaluation]   │ → Skill gap detection
│                 │ → Booster recommendations (if needed)
└─────────────────┘
```

### **Key Architectural Principles**

1. **Unified Task Type**: All players write paragraphs (maximizes player pool)
2. **Tier-Based Rubrics**: Bronze, Silver, Gold judged on different expectations
3. **Batch Ranking**: Claude evaluates all submissions together for fairness
4. **Multi-Dimensional Evaluation**: Check Bronze + Silver + Gold skills simultaneously
5. **Skill Gap Detection**: Failed rubric checkboxes trigger booster recommendations

---

## 🔍 **TIER SYSTEM EXPLAINED**

### **What's Different from V1**

**V1 Approach** (Scrapped):
- Bronze = Sentence tasks
- Silver = Paragraph tasks  
- Gold = Essay tasks
- Problem: Fragments player pool, long queue times

**V2 Approach** (Current):
- ALL tiers = Paragraph tasks
- Tiers represent skill level, not task type
- Judged against appropriate rubric for tier
- Everyone can match together

### **How Tier Evaluation Works**

**Example: Mixed-Tier Match**

```
Match Participants:
- Player 1: Bronze II
- Player 2: Silver III
- Player 3: Gold I
- AI 1: Silver II
- AI 2: Silver IV

All receive same prompt:
"Write a paragraph about a character who discovers something unexpected."

Phase 1 Evaluation:
┌─────────────────────────────────────────────────────┐
│ Player 1 (Bronze II):                               │
│ Judged against Bronze Rubric:                       │
│ ✓ Uses Because/But/So?                              │
│ ✓ Complete sentences?                               │
│ ✓ Basic paragraph structure?                        │
│ Score: 78/100 (good for Bronze)                     │
├─────────────────────────────────────────────────────┤
│ Player 2 (Silver III):                              │
│ Judged against Silver Rubric:                       │
│ ✓ All Bronze skills?                                │
│ ✓ 3-4 supporting details?                           │
│ ✓ Subordinating conjunctions?                       │
│ ✓ Concluding sentence?                              │
│ Score: 82/100 (good for Silver)                     │
├─────────────────────────────────────────────────────┤
│ Player 3 (Gold I):                                  │
│ Judged against Gold Rubric:                         │
│ ✓ All Bronze + Silver skills?                       │
│ ✓ Sophisticated organization?                       │
│ ✓ Depth of ideas?                                   │
│ Score: 85/100 (excellent for Gold)                  │
└─────────────────────────────────────────────────────┘

Rankings (within match):
1. Player 3 (85) - +35 LP
2. Player 2 (82) - +22 LP
3. Player 1 (78) - +12 LP
4. AI 1 (75) - -5 LP
5. AI 2 (70) - -15 LP
```

**Why This Works:**
- Bronze player scored 78 (great for their level) → +12 LP
- They're improving within their tier
- When consistent 80+ scores, they'll promote to Silver
- Fair competition because judged on appropriate expectations

---

## 📋 **EVALUATION SYSTEM: MULTI-DIMENSIONAL RUBRICS**

### **Core Innovation: Cumulative Skill Checking**

Each tier's rubric includes ALL lower-tier skills:

```typescript
// Gold Evaluation (includes Bronze + Silver skills)
GoldRubric = {
  // Gold-Specific Skills
  thesisStatement: true/false,
  multiParagraphOrganization: true/false,
  paragraphTransitions: true/false,
  effectiveIntroConclusion: true/false,
  
  // Silver Skills (should be mastered by now)
  topicSentences: true/false,
  supportingDetails: true/false,
  subordinatingConjunctions: true/false,
  appositives: true/false,
  concludingSentences: true/false,
  
  // Bronze Skills (foundational - should be automatic)
  sentenceExpansion: true/false,      // ⚠️ If FALSE → Flag
  becauseButSo: true/false,           // ⚠️ If FALSE → Flag
  noFragments: true/false,
  noRunOns: true/false,
}
```

**Skill Gap Detection:**

```typescript
// After Gold match evaluation:
if (rubric.becauseButSo === false) {
  skillGaps.push({
    skill: 'Sentence Connectors',
    tier: 'bronze',                    // Bronze-level skill
    severity: 'high',
    booster: 'Sentence Connector Booster (5 min)',
    message: 'Your paragraphs are strong, but sentence connectors need work!'
  });
}
```

### **Failed Checkbox → Booster Mapping**

```typescript
const SKILL_TIER_MAP = {
  // Bronze-level skills
  'becauseButSo': { tier: 'bronze', booster: 'Sentence Connector Booster' },
  'sentenceExpansion': { tier: 'bronze', booster: 'Sentence Expansion Booster' },
  'noFragments': { tier: 'bronze', booster: 'Fragment/Run-on Fixer' },
  
  // Silver-level skills
  'subordinatingConjunctions': { tier: 'silver', booster: 'Subordination Booster' },
  'appositives': { tier: 'silver', booster: 'Appositive Booster' },
  'topicSentences': { tier: 'silver', booster: 'Topic Sentence Booster' },
  
  // Gold-level skills
  'paragraphTransitions': { tier: 'gold', booster: 'Transition Booster' },
  'thesisStatement': { tier: 'gold', booster: 'Thesis Development Booster' },
};
```

---

## 🎯 **RESULTS SCREEN: SKILL GAP ALERTS**

### **Standard Results Display**

```
┌─────────────────────────────────────────────────────┐
│             🏅 GOLD MATCH RESULTS                   │
│                                                     │
│  Your Score: 82/100  (#2 of 5)                     │
│  Rank: Gold II  (+22 LP)                           │
└─────────────────────────────────────────────────────┘

✨ YOUR STRENGTHS:
✓ Paragraph organization: Excellent structure
✓ Topic sentences: Clear and focused
✓ Transitions: Smooth paragraph connections

────────────────────────────────────────────────────

⚠️  SKILLS TO STRENGTHEN:

❌ Sentence Connectors (Bronze-level)
   Your paragraphs lack because/but/so
   This makes sentences feel choppy.
   
   [Take 5-min Booster] → Earn +25 XP, badge

❌ Appositives (Silver-level)
   Add descriptive details with commas
   Makes writing more sophisticated.
   
   [Take 5-min Booster] → Earn +25 XP, badge

────────────────────────────────────────────────────

💡 RECOMMENDED: Complete boosters before next match
   Strengthening foundation = higher scores!
   
[Continue to Next Match] [Practice Boosters]
```

### **Gating System** (After 3 Consecutive Low Scores)

```
┌─────────────────────────────────────────────────────┐
│             ⚠️  SKILL DEVELOPMENT NEEDED            │
│                                                     │
│  We noticed your last 3 matches scored under 65.   │
│  Let's build your foundation before continuing!    │
└─────────────────────────────────────────────────────┘

🎯 COMPLETE THESE TO UNLOCK RANKED:

☐ Sentence Connector Booster (5 min)
  Fix choppy sentences, add because/but/so

☐ Paragraph Structure Booster (5 min)
  Practice topic sentences + details

────────────────────────────────────────────────────

Why This Helps:
These 10 minutes will strengthen your foundation
and help you compete more successfully!

[Start Boosters] (No LP risk, just learning)
```

---

## ⏱️ **TIMING SYSTEM**

### **Rank-Based Durations** (Noel's Recommendations)

| Rank | Phase 1 | Phase 2 | Phase 3 | Total | Rationale |
|------|---------|---------|---------|-------|-----------|
| **Bronze** | 3 min | 1 min | 1 min | 5 min | Sentence-level expectations, quick tasks |
| **Silver** | 5 min | 3 min | 3 min | 11 min | Paragraph development needs thought time |
| **Gold** | 6 min | 4 min | 4 min | 14 min | Multi-paragraph organization complexity |
| **Platinum** | 8 min | 4 min | 5 min | 17 min | AP-level sophistication requires depth |
| **Diamond+** | 10 min | 6 min | 7 min | 23 min | Compressed AP FRQ format |

**Implementation**: `lib/constants/rank-timing.ts`

```typescript
export const RANK_TIMING = {
  bronze: { phase1: 180, phase2: 60, phase3: 60 },
  silver: { phase1: 300, phase2: 180, phase3: 180 },
  gold: { phase1: 360, phase2: 240, phase3: 240 },
  platinum: { phase1: 480, phase2: 240, phase3: 300 },
  diamond: { phase1: 600, phase2: 360, phase3: 420 },
  master: { phase1: 600, phase2: 360, phase3: 420 },
};
```

---

## 🔄 **COMPLETE MATCH FLOW WITH SKILL DETECTION**

```
T=0s:     Enter matchmaking queue
T=3s:     Session created, 5 players gathered
T=8s:     Match starts → Phase 1

--- PHASE 1: WRITING ---
T=8-308s:   Write paragraph (5 min for Silver)
T=308s:     Auto-submit
T=309-367s: Claude batch ranking (58 sec)
            ├─ Evaluate all 5 paragraphs
            ├─ Rank by composite score
            └─ CHECK RUBRIC: ✓ Gold rubric applied
                             ❌ becauseButSo: false
                             ❌ appositives: false
T=367s:     Store rankings + skill gaps
T=368s:     Set phase2StartTime
T=369s:     Transition to Phase 2

--- PHASE 2: PEER FEEDBACK ---
T=370-550s: Review peer's paragraph (3 min)
T=550s:     Auto-submit
T=551-609s: Claude batch ranking
T=609s:     Transition to Phase 3

--- PHASE 3: REVISION ---
T=610-790s: Revise with feedback (3 min)
T=790s:     Auto-submit
T=791-849s: Claude batch ranking
T=849s:     Match complete

--- RESULTS & SKILL DETECTION ---
T=850s:     Calculate composite score
T=851s:     Determine placement (#2)
T=852s:     Calculate LP change (+22)
T=853s:     ⚠️ DETECT SKILL GAPS:
            └─ 2 failed checkboxes found
               - becauseButSo (Bronze)
               - appositives (Silver)
T=854s:     Display results + booster recommendations
T=855s:     Update user profile (LP, XP, stats)
```

---

## 🎮 **PRACTICE MODE INTEGRATION**

### **Two Practice Paths**

#### **Path A: Free Practice Match**
- Same 3-phase format as ranked
- Same evaluation/scoring
- NO LP change (just XP)
- Purpose: Safe practice without stakes

#### **Path B: Skill Booster Drills**
- 5-minute focused exercises
- 3 targeted questions
- Immediate feedback
- Rewards: XP + Badge + Practice Tokens

### **When Boosters Are Triggered**

```typescript
// After ranked match results
if (skillGaps.length > 0) {
  displayBoosterRecommendations(skillGaps);
  
  // Pattern detection
  if (lastThreeMatchesAllHaveSameGap('becauseButSo')) {
    urgency = 'high';
    message = 'This skill has appeared in 3 consecutive matches';
  }
  
  // Gating
  if (lastThreeMatchesUnder65()) {
    gateRankedMode = true;
    requireBoosters = getTopTwoGaps(skillGaps);
  }
}
```

---

## 📚 **KEY FILES & ARCHITECTURE**

### **New/Updated Files for V2**

#### **Evaluation System**
- `lib/prompts/grading-prompts.ts` - **UPDATE**: Multi-dimensional rubric prompts
- `lib/utils/skill-gap-detector.ts` - **NEW**: Detect failed checkboxes
- `lib/constants/skill-tier-map.ts` - **NEW**: Map skills to tiers/boosters

#### **Results Display**
- `components/ranked/ResultsContent.tsx` - **UPDATE**: Add skill gap alerts
- `components/ranked/SkillGapAlert.tsx` - **NEW**: Booster recommendation UI
- `components/ranked/BoosterButton.tsx` - **NEW**: CTA to practice mode

#### **Practice Mode** (Future)
- `app/practice/boosters/[boosterId]/page.tsx` - **NEW**: Booster drill pages
- `components/practice/BoosterDrill.tsx` - **NEW**: 5-min drill format
- `lib/services/booster-manager.ts` - **NEW**: Track booster completion

---

## 🎓 **LEARNING SCIENCE RATIONALE**

### **Why Multi-Dimensional Evaluation?**

**Problem**: Student could be Gold-level at organization but Bronze-level at sentence construction. Single score hides this.

**Solution**: Check all skills simultaneously, flag gaps.

**Benefit**: 
- Targeted remediation (fix exact weakness)
- Prevents "fake" progression (can't reach Gold with weak foundation)
- Students understand specific improvements needed

### **Why Same Task Type?**

**Pedagogical**: 
- Mastery through repetition (write many paragraphs, not one of each type)
- Clear skill progression (get better at paragraphs over time)
- Reduces cognitive overwhelm (familiar format)

**Practical**:
- Unified player pool (everyone can match)
- Scalable (works with 5 or 500 players)
- Simpler to evaluate fairly

### **Why Booster Remediation?**

**Based on TWR Principles**:
- Scaffolded practice (one skill at a time)
- Immediate feedback (5-min drill, instant results)
- Non-punitive (XP/badges, not LP loss)
- Builds belief (achievable, shows improvement)

**Based on Motivation Research (Yeager)**:
- Avoids "impossibility feeling" (can fix gaps)
- Maintains belief + pressure balance
- Shows clear path forward

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Phase 2A: Sub-Tier Progression**

```
Bronze V → IV → III → II → I → Silver V
│        │     │      │    │
└─ Because/But/So focus
     └─ Sentence Expansion focus
          └─ Subordinating Conjunction focus
               └─ Appositive focus
                    └─ Mixed Strategy mastery
                         └─ Promote to Silver
```

### **Phase 2B: Tier-Locked Matchmaking**

When playerbase >100 active:
- Separate queues per tier
- More balanced competition
- Appropriate AI opponent levels

### **Phase 3: Advanced Analytics**

- Skill progression over time graphs
- Heatmap of strengths/weaknesses
- Predictive promotion timeline
- Teacher/parent dashboard

---

## 📊 **Comparison: V1 vs V2**

| Aspect | V1 (Original) | V2 (Current) |
|--------|--------------|--------------|
| **Task Type** | Varies by tier (sentence/paragraph/essay) | Same for all (paragraphs) |
| **Matchmaking** | Tier-locked | Mixed tiers allowed |
| **Evaluation** | Single score | Multi-dimensional rubric |
| **Skill Gaps** | Not detected | Detected + remediation |
| **Practice Mode** | Not planned | Integrated with boosters |
| **Player Pool** | Fragmented | Unified |
| **Scalability** | Poor (small playerbase) | Excellent |
| **Learning Outcomes** | Good | Better (targeted gaps) |

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core V2 Features** ⏳
- [ ] Update grading prompts for multi-dimensional evaluation
- [ ] Build skill gap detection system
- [ ] Add booster recommendations to results screen
- [ ] Create skill-tier mapping

### **Phase 2: Practice Mode** ⏳
- [ ] Build booster drill format
- [ ] Create 5-10 boosters (Bronze + Silver skills)
- [ ] Implement practice token system
- [ ] Add achievement badges

### **Phase 3: Intervention** ⏳
- [ ] Implement gating system
- [ ] Build booster completion tracking
- [ ] Create "unlock ranked" flow
- [ ] Pattern detection (3 consecutive gaps)

### **Phase 4: Polish** ⏳
- [ ] Sub-tier progression system
- [ ] Tier-locked matchmaking (when ready)
- [ ] Advanced analytics dashboard
- [ ] Teacher/parent views

---

**Document Version**: 2.0  
**Supersedes**: RANKED_MATCH_FLOW.md (V1)  
**Last Updated**: November 30, 2024  
**Maintained By**: Development Team

**Related Documents**:
- `GAME_DESIGN_SPEC.md` - High-level design decisions
- `noel-feedback.md` - Learning science recommendations
- `noel-implementation-status.md` - Implementation tracking
- `writing-assessment-checklists.md` - TWR rubrics

