# Writing Arena - Game Design Specification

**Version**: 2.0  
**Last Updated**: November 30, 2024  
**Status**: Active Design

---

## 🎯 **Executive Summary**

Writing Arena is a **competitive educational writing platform** that combines:
- **Competitive gameplay** (ranked matches with LP/rank system)
- **Educational outcomes** (TWR methodology, skill development)
- **AI-powered evaluation** (Claude AI for fair, consistent grading)

**Core Philosophy**: Maximize player pool while maintaining educational rigor through unified task types and skill-based progression.

---

## 🎮 **Core Game Modes**

### **Ranked Mode** (Competitive)
- **Format**: 3-phase writing competition (Write → Review → Revise)
- **Players**: 5 total (real players + AI fill)
- **Stakes**: LP (League Points) + XP change based on placement
- **Duration**: 10-14 minutes (rank-dependent)
- **Purpose**: Competitive skill validation

### **Practice Mode** (Sub-Lessons)
- **Format**: Skill-specific mini-matches (Write → Review → Revise)
- **Stakes**: LP only (NO XP)
- **Duration**: 5-10 min per lesson
- **Purpose**: Targeted skill practice without competitive pressure
- **Structure**:
  - Sentence Lessons: 5 Bronze-level skill lessons
  - Paragraph Lessons: 5 Silver-level skill lessons
  - Essay Lessons: 5 Gold-level skill lessons

---

## 📝 **The Critical Design Decision: One Task Type**

### **Problem We Solved**
Originally considered:
- Bronze = Sentence-level tasks
- Silver = Paragraph tasks
- Gold = Multi-paragraph essays
- Platinum+ = AP-style responses

**Issue**: With small playerbase (5-10 students), this fragments the player pool:
- Bronze players can only match with Bronze
- Silver players wait for other Silver players
- Result: Long queue times, dead game

### **Solution: Universal Task Type**

**Everyone writes the same thing: Paragraphs** (or multi-paragraph, TBD based on target audience)

**Why This Works:**
1. ✅ **Unified Player Pool**: All players can match together
2. ✅ **Scalable**: Works with 5 players or 500 players
3. ✅ **Fair Competition**: Everyone does same task
4. ✅ **Still Educational**: Skill differentiation through rubric expectations

---

## 🏆 **Tier System: Skill Level, Not Task Type**

### **What Tiers Mean**

**Tiers represent how well you write paragraphs, not what you write.**

```
Bronze → Silver → Gold → Platinum → Diamond → Master

All write paragraphs, but:
- Bronze judged on Bronze expectations (basic structure, connectors)
- Gold judged on Gold expectations (sophisticated organization, depth)
```

### **Tier Expectations (Rubric-Based)**

#### **Bronze Expectations**
- Uses Because/But/So correctly
- Complete sentences (no fragments/run-ons)
- Basic paragraph structure
- Topic sentence present
- 2-3 supporting details

#### **Silver Expectations**
- All Bronze skills + 
- 3-4 supporting details
- Subordinating conjunctions
- Concluding sentence
- Internal paragraph transitions
- Appositives for description

#### **Gold Expectations**
- All Bronze + Silver skills +
- Multi-paragraph organization
- Thesis statement
- Paragraph-to-paragraph transitions
- Effective intro/conclusion
- Multiple ideas developed

#### **Platinum+ Expectations**
- All previous skills +
- AP-level sophistication
- Rhetorical awareness
- Evidence integration
- Commentary depth
- Line of reasoning

---

## 📊 **Progression System**

### **LP (League Points) = Skill Progression Currency**

**Earned From**: Ranked matches AND Practice matches

**How It Works:**
```
Placement → LP Change:
1st place: +35 LP
2nd place: +22 LP
3rd place: +12 LP
4th place: -5 LP
5th place: -15 LP

Promotion: 100+ LP → Rank up (e.g., Silver III → Silver II)
Demotion: <0 LP → Rank down (e.g., Silver III → Silver IV)
```

**Ranked vs Practice:**
- Ranked: Earn LP + XP
- Practice: Earn LP only (no XP)

### **XP (Experience Points) = Competitive Reward**

**Earned From**: Ranked matches ONLY

**Purpose:**
- Character progression
- Shows competitive engagement
- Unlock cosmetics, profile themes
- Tied to ranked performance

**How It Works:**
```
Ranked match: +50-100 XP (score-based)
Practice match: No XP
Skill booster: No XP
```

### **Additional Currencies**

**Badges/Achievements:**
- Individual Skill Badges: "Appositive I/II/III", "Topic Sentence I/II/III" (skill usage tiers)
- Tier Mastery Badges: "Sentence Pro", "Paragraph Pro", "Essay Pro", "AP Pro"
- Streak Badges: "3-Day Streak", "10-Day Streak"
- Shows skill breadth on profile

**Future Currencies** (Not Yet Implemented):
- Cosmetic unlocks - Profile customization rewards
- Seasonal rewards - Limited-time achievements

---

## 🎯 **Evaluation System: Multi-Dimensional Rubrics**

### **Core Principle: Cumulative TWR Checklists**

Based on The Writing Revolution methodology, we use **one rubric per tier** that includes all foundational skills.

#### **Gold Rubric Example** (includes Bronze + Silver skills)
```
✓ Composition Structure:
  ✓ Thesis statement
  ✓ Topic sentences
  ✓ Transitions between paragraphs
  ✓ Effective intro/conclusion

✓ Sentence Strategies (Bronze + Silver):
  ✓ Sentence expansion        [Bronze]
  ✓ Because/But/So usage       [Bronze]
  ✓ Subordinating conjunctions [Silver]
  ✓ Appositives               [Silver]

✓ Grammar (Foundational):
  ✓ No fragments              [Bronze]
  ✓ No run-ons                [Bronze]
  ✓ Spelling/capitalization
  ✓ Tense agreement
```

**Failed Checkboxes → Skill Gaps Detected**

If a Gold player fails "Because/But/So usage" checkbox:
```
Gap Detected: Bronze-level skill weakness
Recommendation: "Sentence Lessons → Because/But/So Lesson"
Tier: Bronze
```

### **Practice Lessons Replace Standalone Drills**

**Design Decision**: Instead of isolated drills, practice uses **mini-matches** focused on specific skills.

**Why:**
- Students learn by writing in context (not isolated exercises)
- Same familiar 3-phase format (lower cognitive load)
- More engaging (real writing vs. fill-in-blanks)
- Better skill transfer to ranked matches

**Each practice lesson:**
- Targets ONE specific skill (e.g., "Appositive Lesson")
- Uses mini-match format (Write → Review → Revise)
- Prompts emphasize the target skill
- Evaluation weights that skill more heavily
- Earns skill-specific badge (Appositive I/II/III)

---

## 🔍 **Skill Gap Detection & Remediation**

### **Detection System**

After each ranked match, evaluate against full rubric:
1. Grade the paragraph/essay normally
2. Check all rubric boxes (Bronze through current tier)
3. If foundational checkboxes fail → Flag as skill gap
4. Recommend appropriate booster

### **Intervention Threshold**

**Pattern Detection:**
```
If last 3 matches show same failed checkbox:
  → Alert after results
  → "Your paragraphs are strong, but let's sharpen your sentence connectors!"
  → Recommend booster
```

**Gating System (Soft Recommendations Only):**
```
If last 3 matches all scored <65:
  → Show strong recommendation for practice lessons
  → "We recommend practicing specific skills"
  → Student can skip and continue to ranked (no hard gate for MVP)
```

### **Practice Lesson Format**

**Duration**: 5-10 minutes
**Format**: Mini-match (Write → Review → Revise) focused on one skill
**Rewards**: Score-based LP (no negatives) + Skill Badge (I/II/III)
**No XP**: Practice mode doesn't award XP
**Examples**:
- Sentence Connector Lesson (Bronze) - Because/But/So practice
- Topic Sentence Lesson (Silver) - Paragraph opening practice
- Transition Lesson (Gold) - Paragraph-to-paragraph flow

### **Practice Lesson → Tier Mapping**

```
Sentence Lessons (Bronze Skills):
- Because/But/So Lesson
- Sentence Expansion Lesson
- Subordinating Conjunction Lesson
- Appositive Lesson
- Fragment/Run-on Lesson

Paragraph Lessons (Silver Skills):
- Topic Sentence Lesson
- Supporting Details Lesson
- Concluding Sentence Lesson
- Internal Transitions Lesson
- Paragraph Coherence Lesson

Essay Lessons (Gold Skills):
- Thesis Development Lesson
- Paragraph Transitions Lesson
- Introduction Structure Lesson
- Conclusion Structure Lesson
- Multi-Idea Development Lesson
```

---

## 🎲 **Matchmaking Philosophy**

### **Current System (Small Playerbase)**

**Priority**: Maximize matches, minimize wait time

```
1. Player enters queue
2. Wait 15 seconds for real players
3. Fill with AI opponents
4. Match starts
```

**Tier Mixing**: Players of different tiers CAN match together
- Same task (paragraphs)
- Same prompt
- Different rubric expectations
- Fair because judged within tier

**Example Match:**
```
Player 1: Bronze II (judged on Bronze rubric)
Player 2: Silver III (judged on Silver rubric)
Player 3: Silver I (judged on Silver rubric)
AI 1: Silver II
AI 2: Gold IV

All write same paragraph, ranked by tier-appropriate standards.
```

### **Future System (Large Playerbase)**

When playerbase grows (100+ active players):

**Tier-Locked Matchmaking:**
```
Bronze queue → Only Bronze players
Silver queue → Only Silver players
Gold queue → Only Gold players
```

**Benefits**:
- More similar skill levels
- Fairer perceived competition
- Appropriate AI opponent levels

**Implementation Trigger**: When 90% of matches find same-tier players within 30 seconds

---

## 🏅 **Rank Structure & Sub-Tiers**

### **Current Implementation**

```
Bronze:  I, II, III, IV (4 divisions)
Silver:  I, II, III, IV
Gold:    I, II, III, IV
Platinum: I, II, III, IV
Diamond:  I, II, III, IV
Master:   (single tier)
```

### **Future Enhancement: Skill-Based Sub-Tiers**

**Concept**: Each rank division focuses on mastering one skill

```
Bronze Progression:
V → IV → III → II → I (promote to Silver)
│    │     │     │    │
│    │     │     │    └─ Mixed Strategies (all Bronze skills)
│    │     │     └────── Appositives
│    │     └──────────── Subordinating Conjunctions
│    └────────────────── Sentence Expansion
└─────────────────────── Because/But/So

Each sub-tier: Win 3 matches at 75+ showing that skill
Final tier (I): Win 2-3 matches at 85+ showing ALL tier skills
```

**Why This Works:**
- Clear goals ("Master Because/But/So to rank up")
- Progressive skill building
- Can't skip fundamentals
- Visible achievement

**Implementation Priority**: Post-MVP, after skill booster system proven

---

## 📈 **Timing System**

### **Rank-Based Durations**

Phase timing scales with skill level (from Noel's recommendations):

| Rank | Phase 1 | Phase 2 | Phase 3 | Total |
|------|---------|---------|---------|-------|
| Bronze | 3 min | 1 min | 1 min | 5 min |
| Silver | 5 min | 3 min | 3 min | 11 min |
| Gold | 6 min | 4 min | 4 min | 14 min |
| Platinum | 8 min | 4 min | 5 min | 17 min |
| Diamond+ | 10 min | 6 min | 7 min | 23 min |

**Rationale:**
- Lower tiers need more time to organize thoughts
- Higher tiers handle complexity faster
- Matches TWR scaffolding principles

### **Peer Review Format**

**3 Targeted Questions** (all tiers):
1. What is the main idea?
2. What is one strength?
3. What is one specific suggestion?

**Why 3 (not 5)?**
- Reduces cognitive load
- Maintains quality feedback
- Appropriate for timed environment
- Aligns with TWR principles

---

## 🎓 **Learning Science Principles**

### **TWR (The Writing Revolution) Alignment**

**Core TWR Practices Embedded:**
1. Sentence-level strategies (Because/But/So, appositives, subordination)
2. Paragraph structure (topic sentence, details, conclusion)
3. Planning before writing
4. Revision based on feedback

**Progressive Scaffolding:**
- Bronze focuses on foundational sentence skills
- Silver adds paragraph coherence
- Gold introduces multi-paragraph organization
- Platinum approaches AP-level sophistication

### **Cognitive Load Management**

**Peer Review Simplification:**
- 3 questions (not 5) reduces working memory demand
- Clear, focused prompts
- Appropriate time allocation

**Skill Remediation:**
- Detect gaps early
- Targeted 5-min boosters (not overwhelming)
- Practice outside competitive pressure
- Build foundation before advancing

### **Motivation Design (Yeager's Research)**

**Balance Belief + Pressure:**
- Tiers provide clear progression path (belief: "I can improve")
- Competition creates healthy pressure
- Skill boosters prevent "impossibility feeling"
- Multiple reward types (LP, XP, badges) sustain engagement

---

## 🛠️ **Implementation Priorities**

### **Phase 1: MVP (Current)**
- ✅ Ranked mode with 3 phases
- ✅ Tier-based timing
- ✅ Batch ranking with Claude AI
- ✅ LP/XP systems
- ✅ 3 targeted feedback questions

### **Phase 2: Skill Detection**
- ⏳ Multi-dimensional rubric evaluation
- ⏳ Failed checkbox detection
- ⏳ Skill gap alerts on results screen
- ⏳ Booster recommendations

### **Phase 3: Practice Mode**
- ⏳ Sub-lesson system (sentence/paragraph/essay)
- ⏳ 15-20 focused mini-matches
- ⏳ Score-based LP rewards (no negatives)
- ⏳ Badge progression system (I/II/III → Pro)
- ⏳ Tier-locked lesson unlocks

### **Phase 4: Intervention**
- ⏳ Soft recommendations for struggling players
- ⏳ Gap detection points to specific lessons
- ⏳ Progress tracking per skill
- ⏳ Badge tier progression (I/II/III)

### **Phase 5: Advanced Features**
- ⏳ Sub-tier skill progression (Bronze V → I)
- ⏳ Tier-locked matchmaking (when playerbase large)
- ⏳ Seasonal resets
- ⏳ Mentor system (high-rank coaches)

---

## 🎯 **Success Metrics**

### **Engagement Metrics**
- Match completion rate >80%
- Daily active users retention
- Average matches per student per week >3

### **Learning Metrics**
- Score improvement over 10 matches >5 points
- Practice lesson completion rate >60%
- Badge progression (I → II → III) demonstrates skill mastery
- Promotion rate (Bronze → Silver) appropriate for skill gain

### **Technical Metrics**
- Match start time <30 seconds
- AI evaluation accuracy (vs. human grader) >85% agreement
- System uptime >99%

---

## 🚀 **Design Evolution**

### **What Changed From V1**

**V1 Design** (Initial):
- Different task types per tier (sentence → paragraph → essay)
- Separate queues per tier
- Complex skill tree within each tier

**V2 Design** (Current):
- One task type for all (paragraphs)
- Unified player pool
- Tier = rubric expectations, not task complexity

**Why We Changed:**
- Small playerbase fragmentation issue
- Simpler to implement and maintain
- Still achieves learning outcomes
- Better scales from 10 to 10,000 players

### **Future Considerations**

**When Playerbase >100 Active:**
- Introduce tier-locked matchmaking
- Add sub-tier skill progression system
- Consider task complexity scaling (optional mode)

**When TWR Integration Proven:**
- Partner with schools for curriculum alignment
- Add teacher dashboard
- Export progress reports

---

## 📚 **Related Documents**

- `RANKED_MATCH_FLOW_V2.md` - Detailed technical implementation
- `noel-feedback.md` - Learning science recommendations
- `noel-implementation-status.md` - Implementation tracking
- `writing-assessment-checklists.md` - TWR rubrics

---

**Document Maintainer**: Development Team  
**Review Cycle**: Monthly or after major design decisions  
**Next Review**: December 2024

