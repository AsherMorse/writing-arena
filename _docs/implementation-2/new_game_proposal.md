# New Game Proposal

**📖 READ FIRST**: [`NEW_GAME_PROPOSAL_GUIDE.md`](./NEW_GAME_PROPOSAL_GUIDE.md) - Essential context and benchmarks before filling this out

---

**Game Name**: WritingArena

**Developer(s)**: Asher, Roger, Tom

**Date**: December 6, 2025

---

## 0. TL;DR

**Two sentence pitch**: WritingArena builds real writing skill through quick daily paragraph and essay battles, combining instant AI feedback with competitive leaderboards kids love. Students write, revise, and compete—no multiple choice, just actual writing.

**Target**: Grade **6-8**, **Writing**

**Learning outcome**: Students will improve their paragraph and essay writing ability, measured by passing the Alpha Standardized Writing G8 test.

**Test**: Alpha Standardized Writing G8

**Time to mastery**: **4-8** hours

**Better than**: **WeWillWrite** because it actually teaches writing with learning science—WeWillWrite is just a fun game with no measurable outcomes.

---

## 1. Grade Level & Standards

**Target Grade(s)**: 6-8

**Subject/Topic**: Writing (paragraphs and essays)

**Curriculum Standard** (CCSS/AP/etc):
- [CCSS ELA-Literacy W.8](https://www.thecorestandards.org/ELA-Literacy/W/8/)
- [CCSS ELA-Literacy L.8](https://www.thecorestandards.org/ELA-Literacy/L/8/)

**Specific Skills Covered**:
- Paragraph writing ability (topic sentences, detail sentences, concluding sentences)
- Essay writing ability (5-paragraph structure, thesis, evidence, organization)
- Writing conventions (grammar, spelling, punctuation)

---

## 2. Student Activities

**What do students actually DO in your game/app?**

List all activity types:

1. Write paragraphs/essays based on fun prompts under time pressure
2. Revise a peer's writing (pick favorites, give feedback)
3. Revise their own writing based on AI feedback

**Roughly what % of time in each activity?**

| Activity | % Time |
|----------|--------|
| Write based on prompt | 40% |
| Revise peer's writing | 20% |
| Revise own writing | 40% |

**Prompt Type Progression:**

| Level | Prompt Type |
|-------|-------------|
| Paragraphs | Fun prompts (no passage) |
| Essays (early) | Fun prompts (no passage) |
| Essays (advanced) | Text-dependent with reading passage (matches G8 test format) |

---

## 3. Testing Strategy

**Pre-test (placement/baseline test)**: Student writes a paragraph graded by the AlphaWrite grader (~10 minutes)

**Post-test (mastery test)**: Alpha Standardized Writing G8 (essay with document review)

**Success Criteria** (what score = mastery?): **90% (18/20)** on the AlphaWrite grader

**Are these tests served inside the app or outside of it?**: Option for both inside and outside the app

---

## 4. Learning Science & Engine

**Which learning mechanisms is your game/app built on?**

**Tier 0 - Foundational** (pick all that apply):

- [ ] Faultless communication (clear examples, non-examples, minimal confusion)
- [x] Retrieval practice (not re-study)
- [x] Mastery gating (90% accuracy before advancing)
- [x] Immediate error correction

**Tier 1 - Amplifiers** (pick all that apply):

- [ ] Spaced repetition (expanding intervals)
- [ ] Interleaving (mixing problem types)
- [ ] Example variation (diverse instantiations)
- [ ] Worked examples → faded practice
- [x] Elaborated feedback (why, not just right/wrong)

**Tier 2 - Context-Dependent** (pick if applicable):

- [ ] Dual coding (visual + verbal when both add value)
- [ ] Segmenting (breaking complex tasks into chunks)
- [ ] Pre-training on component concepts
- [ ] Metacognitive prompts

**How do you decide which content to serve when?**: Based on performance—if AI detects a gap, we fill it with targeted activities.

**Spaced repetition approach** (Leitner/SM-2/custom/none): None—if you show a gap, we fill it immediately.

**Mastery criteria** (when does a student "pass" a concept?): 
- 90% (18/20) on paragraphs → unlocks Essay mode (fun prompts)
- 90% on essays (fun prompts) → unlocks Essay mode with passages (text-dependent, matches G8 test format)
- 90% on G8-style essay with passage → full mastery

**How are wrong answers handled?**: AI tells them what they did wrong with specific examples, then directs them to necessary remedial activity (Alphawrite lessons).

---

## 5. Time to Mastery & Learning Rate

**Total learning units** (facts/words/concepts): ~4 core skills (topic sentences, detail sentences, concluding sentences, conventions)

**Exposures per unit**: Multiple daily attempts with revision loops

**Time per exposure**: 10-15 minutes per writing session (write + revise)

**Fundamental metric**: _"It takes **4 hours** to move a student from **10/20 to 16/20** on paragraph writing"_

**Total time to mastery**: **4-8 hours** (3-6 weeks at 10-20 min/day)

**Compared to existing solutions**: WeWillWrite does not produce measurable learning outcomes

**XP Calculation Approach**: Based on AI score—higher score = more XP. Bonus XP for revision improvement and peer favorites.

---

## 6. Question/Fact Bank

**Total unique questions/facts**: ~30 AI-generated prompts at launch

**Content source**: AI-generated by team, reviewed by team and Alpha School writing DRI

**Example question/fact**: "Your town is building a new community center. Write a paragraph explaining what features it should include and why those features would benefit the community."

---

## 7. Competitive Analysis

**Existing solution you're competing with**: WeWillWrite

**Why yours is better**:
- No teacher required in front of a classroom
- Gamification with ranks and leaderboards
- Actual learning science (retrieval practice, elaborated feedback)
- Leaderboard shows best performers for day and week (with their work visible)
- Students can see "YOU ARE a top performer"
- **WeWillWrite doesn't produce outcomes**—it's just a fun game with no learning science or teaching

**Time comparison** (yours vs theirs): WeWillWrite doesn't measure outcomes or time to mastery. WritingArena: 4-8 hours to measurable improvement.

---

## 8. Pilot/MVP

**What is the minimal product that can be tested with students?**: Daily paragraph battles with AI grading, revision loop, and basic leaderboard

**Number of students**: 10 students, grade 6 writing level (able to pass Sentences I.3 test)

**Duration**: 8 weeks

**Measurable outcome**: Average paragraph score improves by **4+ points** (e.g., 10/20 → 14/20)

**Success looks like**: Grade 6 students can write grade 8 level paragraphs/essays with 90% success rate on the Alpha Standardized Writing G8 test.

---

## 9. Anti-Pattern Prevention

**How do you prevent students from:**

- **Skipping content**: Can't skip ranks—must hit 90% on paragraphs before unlocking Essays, then 90% on essays before unlocking text-dependent essays with passages

- **Rushing/clicking through**: Minimum word/sentence counts enforced; AI detects low-effort submissions

- **Guessing randomly**: N/A for writing—students must produce original text

- **Idle time**: No penalty for running down the clock currently (natural time limits on sessions)

---

## 10. Content Quality Control

**Where does content come from?**

- [x] AI-generated (describe QC process): Prompts generated by AI, reviewed before release
- [x] Expert-created: Team creates and curates prompts
- [ ] Question banks (which ones):
- [ ] Licensed content
- [ ] Other:

**Who reviews for correctness?**: Team + Noel Pilkington (Writing DRI at Alpha School)

**How do you catch errors before students see them?**: Manual review of all prompts before launch. AI moderation on student submissions.

---

## 11. Stakeholders & Research

**Academic team contacts** (who you're working with): Noel Pilkington (Writing DRI at Alpha School)

**External collaborators** (BRI, content partners, etc): Alpha School

**Target students/guides** (who will use this): 10 grade-6 students at Alpha School who can pass the Sentences I.3 test

**Research sources** (which brain lifts/documents informed this):

- [ ] Brain lift: N/A
- [ ] Workflow: N/A
- [x] Stakeholder interview: Noel Pilkington (ongoing)
- [x] Existing game analysis: WeWillWrite, NoRedInk, Quill, Alphawrite

---

## 12. Andy's Critical Questions (Real Quotes from Past Demos)

**"Is this all multiple choice? Do they have to produce anything?"**

_Andy cares about production vs recognition. Students must speak/write/draw, not just click._

Your answer: **Not multiple choice. All writing-based—students write paragraphs and essays from scratch every day.**

---

**"I have a new student. How do I make sure they don't waste their time on stuff they already know?"**

_Andy needs diagnostic efficiency. If a student already knows it, how many minutes do they waste proving that?_

Your answer: **Pre-test paragraph takes ~10 minutes. AI detects skill gaps and routes them to appropriate level. If they're already strong, they skip remedial content and compete immediately.**

---

**"You should not limit them to one learning session a day. That's completely unaligned with alpha school. No cap. They can work 24 straight hours if they want."**

_Andy hates artificial time/session limits. Natural limits from content availability are fine, arbitrary caps are not._

Your answer: **No limits. One ranked attempt per day, but unlimited practice mode. Kids can cycle through additional prompts as much as they want.**

---

---

## Pre-Build Checklist

- [ ] I've read relevant brain lifts in academics root
- [x] I've chosen a relevant curriculum standard to align with (CCSS W.8, L.8)
- [x] I've identified the specific test to prove student improvement (Alpha Standardized Writing G8)
- [x] I've chose an appropriate learning engine (Retrieval + Elaborated Feedback)
- [x] I've calculated theoretical time to mastery (4-8 hours)
- [x] I know what existing solution I'm competing with (WeWillWrite)
- [x] I can answer all of Andy's questions above
