# Practice Mode Flow - Complete Specification

**Version**: 1.0  
**Last Updated**: November 30, 2024  
**Status**: Design Specification (Pre-Implementation)

---

## 🎯 **TL;DR**

Practice Mode provides **targeted skill development** through sub-lessons focused on specific writing skills. Students earn LP (no XP) while practicing sentence, paragraph, or essay skills in a low-pressure environment.

**Key Features:**
- 15-20 sub-lessons (sentence/paragraph/essay skills)
- 5-10 min mini-match format per lesson
- Solo practice (AI reference examples)
- Score-based LP rewards (no negatives)
- Badge progression (I/II/III → Pro)
- Gap detection guides students to specific lessons

---

## 📚 **Practice Mode Structure**

### **Three Lesson Categories**

```
PRACTICE MODE
│
├─ 📝 SENTENCE LESSONS (Bronze-Level Skills)
│  ├─ Because/But/So Lesson
│  ├─ Sentence Expansion Lesson
│  ├─ Subordinating Conjunction Lesson
│  ├─ Appositive Lesson
│  └─ Fragment/Run-on Lesson
│  
├─ 📄 PARAGRAPH LESSONS (Silver-Level Skills)
│  ├─ Topic Sentence Lesson
│  ├─ Supporting Details Lesson
│  ├─ Concluding Sentence Lesson
│  ├─ Internal Transitions Lesson
│  └─ Paragraph Coherence Lesson
│
└─ 📚 ESSAY LESSONS (Gold-Level Skills)
   ├─ Thesis Development Lesson
   ├─ Paragraph Transitions Lesson
   ├─ Introduction Structure Lesson
   ├─ Conclusion Structure Lesson
   └─ Multi-Idea Development Lesson
```

---

## 🎮 **Sub-Lesson Format**

Each sub-lesson is a **focused mini-match** (5-10 min):

### **Phase 1: Writing** (2-5 min)
- Focused prompt targeting specific skill
- Example text in sidebar (annotated)
- Individual AI scoring (no ranking)
- Skill-specific feedback

### **Phase 2: Async Peer Review** (1-3 min)
- Review historical submission (anonymous)
- Focus on identifying that specific skill
- Individual AI scoring on feedback quality

### **Phase 3: Revision** (2-4 min)
- Revise based on AI feedback
- Emphasis on applying the target skill
- Scored on: 70% final quality + 30% improvement

### **Results**
- Composite score (average of 3 phases)
- LP award (score-based, no negatives)
- Badge tier progress (I/II/III)
- Skill gap tracking

---

## 📝 **Example: Appositive Lesson (Sentence)**

### **Entry Screen**

```
┌─────────────────────────────────────────────────────┐
│  APPOSITIVE LESSON                                  │
│  Sentence Lessons • 6 minutes • Earn LP             │
└─────────────────────────────────────────────────────┘

📚 WHAT YOU'LL LEARN:
Using appositives (descriptive phrases with commas)
to add detail and sophistication to your sentences.

📊 YOUR PROGRESS:
Current: Appositive II ⭐⭐ (2/3)
Next: Practice with 3/3 usage → Appositive III!

[Start Lesson]
```

---

### **Phase 1: Writing (3 min)**

```
┌─────────────────────┬──────────────────────────────┐
│ APPOSITIVE LESSON   │  📌 EXAMPLE (90/100):       │
│ Time: 3:00          │                              │
├─────────────────────┤  "Sarah, a curious student, ←│
│                     │   opened the mysterious      │
│ ✏️ YOUR TASK:       │   book."                     │
│                     │                              │
│ Write 3 sentences   │  Notice:                     │
│ using appositives   │  • Comma before & after      │
│ to describe:        │  • Adds detail about Sarah   │
│                     │  • Makes sentence richer     │
│ 1. A character      │                              │
│ 2. A place          │  Toggle: [Hide Example]      │
│ 3. An object        │                              │
│                     │                              │
│ Remember:           │                              │
│ Use commas to set   │                              │
│ off descriptive     │                              │
│ phrases!            │                              │
│                     │                              │
│ [Write here...]     │                              │
│                     │                              │
│                     │                              │
│                     │                              │
│                     │                              │
└─────────────────────┴──────────────────────────────┘

[Submit]
```

---

### **Phase 2: Peer Review (1 min)**

```
┌─────────────────────────────────────────────────────┐
│  REVIEW PEER'S SENTENCES                            │
│  Time: 1:00                                         │
└─────────────────────────────────────────────────────┘

📖 PEER'S WRITING (Anonymous, from past match):

1. "The lighthouse, a towering structure built in 1872,
    guided ships to safety."

2. "She discovered a door that was hidden behind 
    the bookshelf."

3. "The book contained secrets."

────────────────────────────────────────────────────

🎯 EVALUATE APPOSITIVE USAGE:

Which sentences use appositives correctly?
☑ Sentence 1  ☐ Sentence 2  ☐ Sentence 3

What could be improved?
[Your feedback: "Sentence 2 could add appositive: 
'She discovered a door, a secret passage, hidden...'"]

[Submit]
```

---

### **Phase 3: Revision (2 min)**

```
┌─────────────────────────────────────────────────────┐
│  REVISE YOUR SENTENCES                              │
│  Time: 2:00                                         │
└─────────────────────────────────────────────────────┘

YOUR ORIGINAL SENTENCES:

1. "Sarah opened the mysterious book."
2. "The lighthouse stood on the cliff."
3. "The door led to a secret room."

────────────────────────────────────────────────────

🤖 AI FEEDBACK:

✅ Good start! Now add appositives:

Sentence 1: Add detail about Sarah
Try: "Sarah, a curious student, opened..."

Sentence 2: Describe the lighthouse
Try: "The lighthouse, a century-old beacon, stood..."

Sentence 3: What kind of room?
Try: "The door, hidden for years, led to..."

────────────────────────────────────────────────────

[Revise your sentences:]

1. Sarah, a curious student, opened the mysterious book.
2. The lighthouse, a weathered beacon, stood on the cliff.
3. The door, covered in dust, led to a secret room.

[Submit Final]
```

---

### **Results**

```
┌─────────────────────────────────────────────────────┐
│             APPOSITIVE LESSON COMPLETE              │
└─────────────────────────────────────────────────────┘

YOUR SCORES:
Phase 1 (Writing):      85/100  ✅ 3/3 appositives used!
Phase 2 (Review):       78/100  Good identification
Phase 3 (Revision):     88/100  Excellent improvement

Composite Score: 83.67 → 84

────────────────────────────────────────────────────

🏆 REWARDS:

LP Earned: +11
Badge Earned: Appositive III ⭐⭐⭐

✨ MASTERY UNLOCKED!
You've mastered appositives. This skill will strengthen
your sentences in ranked matches!

────────────────────────────────────────────────────

[Practice Another Skill] [Return to Ranked]
```

---

## 🎯 **Gap Detection → Sub-Lesson Flow**

```
Ranked Match (Gold tier)
  ↓
Evaluation detects: "appositive" checkbox = FALSE
  ↓
Results Screen Alert:
  "⚠️ Appositives (Sentence Skill)
   Add descriptive details with commas
   
   [Practice: Appositive Lesson]"
  ↓
Click button → Navigate to /practice/sentence/appositive
  ↓
Complete Appositive Lesson
  ↓
Earn badge: Appositive III ⭐⭐⭐
  ↓
Gap marked as "practiced" (won't alert for 3 matches)
  ↓
If still fails appositive checkbox in next 3 matches:
  → Alert reappears
```

---

## 📊 **LP Reward System (Practice)**

### **Score-Based LP** (No Placement, No Negatives)

```
Composite Score → LP Earned:

95-100 = +15 LP  (exceptional)
90-94  = +13 LP  (excellent)
85-89  = +11 LP  (very good)
80-84  = +9 LP   (good)
75-79  = +7 LP   (solid)
70-74  = +5 LP   (okay)
65-69  = +3 LP   (below average)
60-64  = +1 LP   (weak)
<60    = +0 LP   (no penalty, just no reward)
```

**Why No Negatives:**
- Practice is for learning
- No punishment for struggling
- Encourages trying new skills
- Still get minimal LP for effort (+1 even at 60)

---

## 🏅 **Badge Progression System**

### **Individual Skill Badges**

Each sub-lesson has 3 badge tiers based on skill usage/accuracy:

```
Appositive Lesson:
├─ Appositive I ⭐        (1/3 correct usage)
├─ Appositive II ⭐⭐     (2/3 correct usage)
└─ Appositive III ⭐⭐⭐  (3/3 correct usage)
```

**Badge earned based on performance in that lesson.**

**Unlimited retakes** - Can replay lesson to improve badge tier.

### **Tier Mastery Badges**

When ALL skills in a tier reach III:

```
All Bronze Lessons at III → "Sentence Pro" 🎓

All Silver Lessons at III → "Paragraph Pro" 🎓

All Gold Lessons at III → "Essay Pro" 🎓

All Platinum Lessons at III → "AP Pro" 🎓
```

**Profile Display:**
```
┌─────────────────────────────────────────────┐
│  YOUR RANK: Gold II                         │
├─────────────────────────────────────────────┤
│  MASTERY BADGES:                            │
│  🎓 Sentence Pro     (All Bronze skills)    │
│  🎓 Paragraph Pro    (All Silver skills)    │
│  ⚪ Essay Pro         (4/5 Gold skills)     │
└─────────────────────────────────────────────┘
```

**Shows:** Rank ≠ Skill Mastery
- Can be Gold rank without "Sentence Pro" (weak foundation)
- Can be Silver rank WITH "Sentence Pro" (well-rounded)

---

## 🔄 **Practice vs Ranked Comparison**

| Feature | Ranked | Practice Sub-Lessons |
|---------|--------|---------------------|
| **Task Type** | Paragraph/Essay (one type) | Sentence/Paragraph/Essay (choose) |
| **Focus** | General writing | Specific skill (appositive, topic sentence, etc.) |
| **Format** | Write → Review → Revise | Write → Review → Revise (same) |
| **Duration** | 10-17 min (rank-based) | 5-10 min (skill-based) |
| **Matchmaking** | Real + AI opponents | Solo + AI examples |
| **Evaluation** | Batch ranking (placement) | Individual scoring (absolute) |
| **LP Rewards** | Placement-based (±35 to ±15) | Score-based (+15 to 0) |
| **XP Rewards** | ✅ Yes (50-100 XP) | ❌ No XP |
| **Purpose** | Competitive validation | Targeted skill practice |
| **Badges** | None | Skill-specific (I/II/III) |
| **Can Quit** | Penalty (-15 LP abandon) | No penalty (it's practice) |
| **Frequency** | Unlimited | Unlimited |

---

## 🎯 **Sub-Lesson Types**

### **Sentence Lessons** (5-6 min each, Bronze Skills)

**1. Because/But/So Lesson**
- Write 3 sentences using connectors
- Focus: Causal/contrastive/consequential thinking
- Badge: Because/But/So I/II/III

**2. Sentence Expansion Lesson**
- Write 3 sentences combining ideas (and, or, yet)
- Focus: Avoiding choppy writing
- Badge: Sentence Expansion I/II/III

**3. Subordinating Conjunction Lesson**
- Write 3 sentences using when/although/since/while/if/unless
- Focus: Complex sentence structure
- Badge: Subordination I/II/III

**4. Appositive Lesson**
- Write 3 sentences with descriptive appositive phrases
- Focus: Adding detail with commas
- Badge: Appositive I/II/III

**5. Fragment/Run-on Lesson**
- Write 3 complete sentences (avoiding common errors)
- Focus: Sentence completeness and boundaries
- Badge: Grammar Fundamentals I/II/III

---

### **Paragraph Lessons** (8-10 min each, Silver Skills)

**1. Topic Sentence Lesson**
- Write paragraph with strong topic sentence
- Focus: Clear, focused opening statement
- Badge: Topic Sentence I/II/III

**2. Supporting Details Lesson**
- Write paragraph with 3-4 distinct supporting details
- Focus: Evidence and elaboration
- Badge: Supporting Details I/II/III

**3. Concluding Sentence Lesson**
- Write paragraph with effective conclusion
- Focus: Wrapping up ideas, not just repeating
- Badge: Conclusion I/II/III

**4. Internal Transitions Lesson**
- Write paragraph using transition words between sentences
- Focus: Flow and coherence (First, Additionally, Finally)
- Badge: Transitions I/II/III

**5. Paragraph Coherence Lesson**
- Write paragraph where every sentence supports topic
- Focus: Unity and relevance
- Badge: Coherence I/II/III

---

### **Essay Lessons** (10-12 min each, Gold Skills)

**1. Thesis Development Lesson**
- Write 2-paragraph essay with clear thesis
- Focus: Arguable, focused thesis statement
- Badge: Thesis I/II/III

**2. Paragraph Transitions Lesson**
- Write 3-paragraph essay with smooth transitions
- Focus: Connections between body paragraphs
- Badge: Essay Transitions I/II/III

**3. Introduction Structure Lesson**
- Write essay with effective intro (general → specific → thesis)
- Focus: Engaging opening, clear progression
- Badge: Introduction I/II/III

**4. Conclusion Structure Lesson**
- Write essay with effective conclusion (restate → synthesis → impact)
- Focus: Powerful closing, not just summary
- Badge: Conclusion I/II/III

**5. Multi-Idea Development Lesson**
- Write essay developing 2-3 distinct ideas
- Focus: Depth and breadth of analysis
- Badge: Development I/II/III

---

## 🔄 **Complete Sub-Lesson Flow**

### **Example: Because/But/So Lesson**

#### **Entry (From Dashboard)**

```
┌─────────────────────────────────────────────────────┐
│  📝 SENTENCE LESSONS                                │
├─────────────────────────────────────────────────────┤
│  ⚠️ RECOMMENDED: Because/But/So                     │
│     Gap detected in last ranked match               │
│                                                     │
│  Because/But/So Lesson                              │
│  Current: Level II ⭐⭐                              │
│  Best Score: 2/3 usage                              │
│  Last Attempt: 3 days ago                           │
│                                                     │
│  Duration: ~6 minutes                               │
│  Earn: Up to +15 LP                                 │
│                                                     │
│  [Start Lesson] [View Other Lessons]                │
└─────────────────────────────────────────────────────┘
```

---

#### **Phase 1: Writing (3 min)**

```
┌─────────────────────┬──────────────────────────────┐
│ BECAUSE/BUT/SO      │  📌 EXAMPLE (Score: 90):    │
│ Time: 3:00          │                              │
│                     │  "The character opened the   │
│ 📚 QUICK GUIDE:     │   door because curiosity     │
│                     │   overcame her fear."        │
│ BECAUSE = reason    │                              │
│ "...because X"      │  Notice:                     │
│                     │  • 'because' shows REASON    │
│ BUT = contrast      │  • Clear cause-effect        │
│ "...but Y"          │  • Complete thought          │
│                     │                              │
│ SO = result         │  "She was tired but          │
│ "...so Z"           │   determined to finish."     │
│                     │                              │
│ ────────────────    │  Notice:                     │
│                     │  • 'but' shows CONTRAST      │
│ ✏️ YOUR TASK:       │  • Opposing ideas            │
│                     │                              │
│ Write 3 analytical  │  Toggle: [Hide Example]      │
│ sentences using     │                              │
│ Because, But, or So │                              │
│                     │                              │
│ [Your sentences:]   │                              │
│                     │                              │
│ 1. The character    │                              │
│    left because the │                              │
│    danger was       │                              │
│    overwhelming.    │                              │
│                     │                              │
│ 2. [Write here...]  │                              │
│                     │                              │
│ 3. [Write here...]  │                              │
└─────────────────────┴──────────────────────────────┘

[Submit]
```

**Individual AI Evaluation:**
```
Analyzes:
- Did they use Because/But/So? (count each)
- Used correctly (causal/contrastive/consequential)?
- Complete sentences?
- Logical reasoning?

Returns:
- Score: 85/100
- Connector usage: 2/3 sentences ⭐⭐
- Feedback: "Great use of 'because'! Add 'but' or 'so' to sentence 3"
```

---

#### **Phase 2: Peer Review (1 min)**

```
┌─────────────────────────────────────────────────────┐
│  IDENTIFY CONNECTOR USAGE                           │
│  Time: 1:00                                         │
└─────────────────────────────────────────────────────┘

📖 PEER'S SENTENCES (Anonymous):

1. "The storm approached quickly."
2. "The sailors were worried but prepared for danger."
3. "They secured the boat so it wouldn't drift away."

────────────────────────────────────────────────────

🎯 QUICK FEEDBACK:

Which connectors were used?
☐ Because  ☑ But  ☑ So

Rate the connector usage (1-5):
Quality: ⭐⭐⭐⭐⚪ (4/5)

One suggestion for sentence 1:
[Add 'because' to explain why the storm matters]

[Submit]
```

**Individual AI Scoring:**
```
Feedback Quality: 82/100

What you did well:
✅ Correctly identified both connectors
✅ Specific suggestion for improvement

How to improve:
• Explain WHY adding 'because' would help
```

---

#### **Phase 3: Revision (2 min)**

```
┌─────────────────────────────────────────────────────┐
│  REVISE FOR STRONGER CONNECTORS                     │
│  Time: 2:00                                         │
└─────────────────────────────────────────────────────┘

YOUR ORIGINAL:

1. "The character left because the danger was 
    overwhelming."
2. "She wanted to explore."
3. "The door remained closed."

────────────────────────────────────────────────────

🤖 AI SUGGESTIONS:

Sentence 2: Add 'but' to show contrast with sentence 1
Try: "She wanted to explore, but the danger was too great."

Sentence 3: Add 'so' to show result
Try: "The door remained closed, so she searched for a key."

────────────────────────────────────────────────────

[Revised sentences:]

1. The character left because the danger was overwhelming.
2. She wanted to explore, but fear held her back.
3. The door remained closed, so she tried the window instead.

[Submit Final]
```

**Revision Scoring:**
```
Final Quality: 88/100
Improvement: +8 points from original
Connector Usage: 3/3 ⭐⭐⭐

Revision Score = (0.7 × 88) + (0.3 × improvement bonus)
              = 61.6 + 24
              = 85.6 → 86
```

---

#### **Final Results**

```
┌─────────────────────────────────────────────────────┐
│  ✨ BECAUSE/BUT/SO LESSON COMPLETE                  │
└─────────────────────────────────────────────────────┘

SCORES:
Writing:   85/100  (2/3 connectors)
Review:    82/100  (good identification)
Revision:  86/100  (3/3 connectors! +8 improvement)

Composite: 84.33 → 84

────────────────────────────────────────────────────

🏆 REWARDS:

LP Earned: +11
XP Earned: 0 (practice mode)

🎖️ BADGE EARNED: Because/But/So III ⭐⭐⭐

✨ MASTERY ACHIEVED!
You successfully used connectors in all 3 sentences
during revision. This skill is now mastered!

────────────────────────────────────────────────────

📊 SENTENCE PRO PROGRESS:

✅ Because/But/So      III ⭐⭐⭐
⚠️ Sentence Expansion  II ⭐⭐
✅ Subordinating       III ⭐⭐⭐
⚠️ Appositive          I ⭐
🔒 Fragment Fixer      (locked)

Complete 2 more skills → Earn "Sentence Pro" 🎓

────────────────────────────────────────────────────

[Practice Another Skill] [Return to Ranked]
```

---

## 🎯 **Does This Capture What You Mean?**

**Practice Mode = Library of sub-lessons**

Each sub-lesson:
- Targets ONE specific skill
- Mini-match format (6-10 min)
- Focused prompting + evaluation
- Earn skill-specific badges (I/II/III)
- Accumulate toward tier mastery (Sentence Pro, etc.)

**Gap detection points to the exact sub-lesson needed.**

**Ready to finalize the full doc, or want to adjust anything?**
