# Writing Arena - AI-Powered Competitive Writing Platform

> Transform K-12 writing skills through competitive matches and AI-powered feedback

## 🎮 Current Version: V1.0 - Core Platform ✅

A fully functional competitive writing platform with three game modes, AI feedback, and character progression. Students compete in 4-minute writing battles, earn XP and ranks, and receive instant formative feedback from Claude AI.

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Optional: Configure Claude AI
See `docs/5_Setup/SETUP_API.md` for instructions on enabling real AI feedback.
The app works with mock feedback if no API key is configured!

---

## ✨ V1 Features (Completed)

### 🎯 Three Game Modes
1. **Practice Mode** - Solo training with AI feedback
2. **Quick Match** - Casual 6-player competitive matches
3. **Ranked Match** - Competitive play with LP and rank progression

### 🤖 AI-Powered Feedback
- Claude Sonnet 4 integration
- Trait-by-trait scoring (Content, Organization, Grammar, Vocabulary, Mechanics)
- Specific strengths and improvement suggestions
- Next steps recommendations
- Mock fallback for testing without API key

### 🎨 Complete User Experience
- Beautiful landing page with hero section
- Dashboard with stats and character display
- Mode selection modal
- Progressive setup wizards
- Live timers and word counters
- Matchmaking with party formation
- Real-time AI opponent simulation
- Competitive rankings and medals
- Victory celebrations and rewards

### 🌳 Character Progression
- 6 mastery levels: Seedling → Sapling → Young Oak → Mature Oak → Ancient Oak → Legendary Redwood
- XP and points system
- Trait-specific leveling
- Visual progress tracking

### 🏆 Competitive Systems
- Rankings and medals (🥇🥈🥉)
- League Points (LP) system for ranked play
- Victory bonuses
- Placement rewards
- Rank tiers (Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster)

### 🛡️ Quality Features
- Paste prevention (ensures original work)
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Loading states and error handling
- Professional UI with glassmorphism

---

## 📁 Project Structure

```
writing-app/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── dashboard/                    # Main dashboard
│   ├── practice/                     # Solo training mode
│   ├── quick-match/                  # Casual competitive
│   ├── ranked/                       # Ranked competitive
│   │   ├── matchmaking/              # Matchmaking UI
│   │   ├── session/                 # Phase 1: Writing
│   │   ├── peer-feedback/           # Phase 2: Peer Feedback
│   │   ├── revision/                # Phase 3: Revision
│   │   ├── phase-rankings/          # Phase rankings display
│   │   └── results/                 # Final results
│   └── api/                         # API routes
│       ├── batch-rank-writings/     # Phase 1 batch ranking
│       ├── batch-rank-feedback/     # Phase 2 batch ranking
│       ├── batch-rank-revisions/    # Phase 3 batch ranking
│       └── generate-ai-*/           # AI content generation
├── components/
│   ├── ranked/                      # Ranked mode components
│   ├── shared/                      # Shared UI components
│   └── ui/                          # Base UI components
├── lib/
│   ├── prompts/
│   │   └── grading-prompts.ts      # ⭐ Centralized grading prompts
│   ├── utils/
│   │   ├── time-utils.ts           # ⭐ Time formatting utilities
│   │   ├── api-helpers.ts          # ⭐ API helper functions
│   │   └── claude-parser.ts        # ⭐ Claude response parsing
│   ├── constants/
│   │   └── scoring.ts              # ⭐ Scoring constants
│   ├── hooks/
│   │   └── useSession.ts           # Session management hook
│   └── services/                   # Firestore services
├── FEATURE_CATALOG.md              # V1 vs PRD comparison
├── V1_SUMMARY.md                   # Implementation achievements
├── V2_ROADMAP.md                   # Future development plan
├── SETUP_API.md                    # Claude API configuration
└── PRD*.md                         # Product requirements
```

**⭐ = Recently refactored for maintainability**

---

## 🔧 Recent Refactoring (2024)

### Code Organization Improvements

We've recently refactored the codebase to improve maintainability and consistency:

#### 1. **Centralized Grading Prompts** (`lib/prompts/grading-prompts.ts`)
- All AI evaluation prompts in one place
- Easy to edit and maintain
- Consistent evaluation across all phases
- See [Editing Prompts](#-editing-prompts) section below

#### 2. **Utility Functions** (`lib/utils/`)
- **`time-utils.ts`**: Time formatting and color utilities
- **`api-helpers.ts`**: API key management and Claude API calls
- **`claude-parser.ts`**: Standardized JSON parsing from Claude responses

#### 3. **Scoring Constants** (`lib/constants/scoring.ts`)
- All magic numbers centralized (phase durations, score ranges, thresholds)
- Single source of truth for scoring configuration
- Easy to adjust scoring parameters

#### 4. **Improved Error Handling**
- Consistent API error handling across all routes
- Better logging and debugging
- Graceful fallbacks to mock data

**Impact**: ~500+ lines of duplicate code removed, better maintainability, easier to extend

---

## 👨‍💻 Developer Guide

### 📝 Editing Prompts

All AI grading prompts are centralized in **`lib/prompts/grading-prompts.ts`**. This is the **single source of truth** for how AI evaluates student work.

#### File Structure

```typescript
lib/prompts/grading-prompts.ts
├── getPhase1WritingPrompt()      // Phase 1: Writing evaluation
├── getPhase2PeerFeedbackPrompt() // Phase 2: Peer feedback evaluation
└── getPhase3RevisionPrompt()     // Phase 3: Revision evaluation
```

#### How to Edit a Prompt

1. **Open** `lib/prompts/grading-prompts.ts`
2. **Find** the prompt function you want to edit (e.g., `getPhase1WritingPrompt`)
3. **Edit** the prompt string directly
4. **Save** - Changes apply automatically to all API routes

#### Example: Adjusting Phase 1 Evaluation Criteria

```typescript
// In lib/prompts/grading-prompts.ts

export function getPhase1WritingPrompt(...) {
  return `You are a writing instructor...
  
  // Edit these criteria:
  SCORING CRITERIA:
  
  **Rank 1 (90-100)**: Mastery of 5+ TWR strategies...
  **Rank 2-3 (80-89)**: Strong use of 3-4 TWR strategies...
  // ... modify as needed
  `;
}
```

#### What Each Prompt Evaluates

- **Phase 1 (Writing)**: Initial writing quality, TWR strategies, content development
- **Phase 2 (Peer Feedback)**: Specificity, constructiveness, completeness, TWR references
- **Phase 3 (Revision)**: Application of feedback, meaningful improvements, TWR strategies

#### Testing Prompt Changes

1. Make your changes to `grading-prompts.ts`
2. Restart dev server: `npm run dev`
3. Run a test match in ranked mode
4. Check server logs for AI responses
5. Verify scores reflect your changes

---

### 🔄 Understanding the Flow

#### Ranked Mode: Three-Phase Battle System

```
┌─────────────────────────────────────────┐
│  MATCHMAKING                            │
│  - Join queue or play against AI        │
│  - Fast-track button fills with AI      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PHASE 1: WRITING (5 min)              │
│  - Write response to prompt             │
│  - AI generates 4 opponent writings     │
│  - Batch ranking: All 5 evaluated       │
│  - Weight: 40%                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PHASE 2: PEER FEEDBACK (3 min)        │
│  - Review assigned peer's writing       │
│  - Answer 3 feedback questions          │
│  - AI generates 4 opponent feedbacks    │
│  - Batch ranking: All 5 evaluated       │
│  - Weight: 30%                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  PHASE 3: REVISION (4 min)             │
│  - View original writing                │
│  - See AI & peer feedback               │
│  - Revise and improve                   │
│  - AI generates 4 opponent revisions    │
│  - Batch ranking: All 5 evaluated       │
│  - Weight: 30%                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  RESULTS                                │
│  - Composite score (weighted average)    │
│  - Rankings (1-5)                       │
│  - LP changes                           │
│  - XP rewards                           │
└─────────────────────────────────────────┘
```

#### Key Components

**Session Management** (`lib/hooks/useSession.ts`)
- Centralized session state management
- Real-time Firestore synchronization
- Phase transitions and coordination
- Time remaining calculations

**Match Sync** (`lib/services/match-sync.ts`)
- Firestore operations for match state
- Peer assignment logic
- Feedback retrieval
- Rankings storage

**Batch Ranking APIs** (`app/api/batch-rank-*/`)
- Phase 1: `batch-rank-writings/route.ts`
- Phase 2: `batch-rank-feedback/route.ts`
- Phase 3: `batch-rank-revisions/route.ts`

All three routes:
1. Receive submissions from all players
2. Call centralized prompt functions
3. Send to Claude API for batch evaluation
4. Parse and return ranked results

#### Data Flow

```
Component (e.g., WritingSessionContent.tsx)
    ↓ submits writing
API Route (batch-rank-writings/route.ts)
    ↓ calls getPhase1WritingPrompt()
Centralized Prompt (grading-prompts.ts)
    ↓ returns prompt string
API Route
    ↓ sends to Claude API
Claude API
    ↓ returns JSON rankings
API Route
    ↓ parses with claude-parser.ts
Component
    ↓ displays results
```

---

### 🆕 Adding New Features

#### 1. Adding a New Phase

**Step 1: Create Component**
```typescript
// components/ranked/NewPhaseContent.tsx
export default function NewPhaseContent() {
  const { session, timeRemaining, submitPhase } = useSession();
  // ... component logic
}
```

**Step 2: Create API Route**
```typescript
// app/api/batch-rank-new-phase/route.ts
import { getNewPhasePrompt } from '@/lib/prompts/grading-prompts';

export async function POST(request: NextRequest) {
  const { submissions } = await request.json();
  const prompt = getNewPhasePrompt(submissions);
  // ... API logic
}
```

**Step 3: Add Prompt Function**
```typescript
// lib/prompts/grading-prompts.ts
export function getNewPhasePrompt(submissions: any[]): string {
  return `Your evaluation prompt here...`;
}
```

**Step 4: Update Routing**
- Add route in `app/ranked/new-phase/page.tsx`
- Update phase transitions in `useSession.ts`
- Add phase duration to `lib/constants/scoring.ts`

#### 2. Modifying Scoring Logic

**Edit Constants** (`lib/constants/scoring.ts`):
```typescript
export const SCORING = {
  PHASE1_DURATION: 120,  // Change duration
  DEFAULT_WRITING_SCORE: 75,  // Change default
  // ... other constants
};
```

**Edit Prompts** (`lib/prompts/grading-prompts.ts`):
- Modify scoring criteria in prompt strings
- Adjust evaluation rubrics
- Change feedback requirements

#### 3. Adding New UI Components

**Shared Components** (`components/shared/`):
- Reusable across all modes
- Examples: `PhaseInstructions.tsx`, `WritingTipsModal.tsx`

**Mode-Specific Components** (`components/ranked/`, `components/practice/`):
- Specific to one game mode
- Examples: `WritingSessionContent.tsx`, `PeerFeedbackContent.tsx`

**Base UI Components** (`components/ui/`):
- Low-level UI primitives
- Examples: `Button.tsx`, `Modal.tsx`, `Card.tsx`

#### 4. Adding New API Endpoints

**Pattern to Follow**:
```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { data } = requestBody;
  
  try {
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }
    
    const prompt = `Your prompt here...`;
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 2000);
    const parsed = parseClaudeJSON(aiResponse.content[0].text);
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 🎓 Learning Science Foundation

### Currently Implemented
✅ **4-minute timed sessions** (Cognitive Load Theory)  
✅ **Visual prompts** (Dual coding theory)  
✅ **Formative AI feedback** (Immediate assessment)  
✅ **Trait-based rubrics** (Diagnostic evaluation)  
✅ **Growth mindset messaging** (Effort-based feedback)  
✅ **Peer feedback** (TAG protocol, ES=0.75)  
✅ **Three-phase battle system** (Comprehensive assessment)

### Planned for V2
🔲 **Spaced repetition** (10-20% retention interval)  
🔲 **Metacognitive scaffolding** (Self-regulation)  
🔲 **Mastery classification** (Cognitive diagnostic modeling)  
🔲 **Enhanced scaffolding** (Expertise reversal effect)

---

## 🎯 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic Claude Sonnet 4
- **Database:** Firebase Firestore
- **State:** React hooks + Firestore real-time listeners
- **Future:** PostgreSQL, Prisma, NextAuth, WebSockets

---

## 📚 Documentation

### For Users
- `docs/0_Prototype/V1_SUMMARY.md` - What we built and how to use it
- `docs/5_Setup/SETUP_API.md` - Configure Claude AI feedback

### For Developers
- `DEVELOPER_GUIDE.md` - Comprehensive developer guide (start here!)
- `docs/0_Prototype/FEATURE_CATALOG.md` - Feature comparison with PRD
- `docs/0_Prototype/V2_ROADMAP.md` - Future development plan
- `docs/0_Prototype/PRD.md` - Complete product requirements
- `docs/0_Prototype/PRD_Technical.md` - Technical architecture details
- `docs/2_Refactoring/REFACTORING_OPPORTUNITIES.md` - Additional refactoring ideas
- `docs/README.md` - Complete documentation index

### Design & Research
- `docs/0_Prototype/DESIGN_SCHEMA.md` - Visual design philosophy
- `docs/0_Prototype/PRD_Motivation.md` - Motivation and rewards system
- `docs/0_Prototype/PRD_Assessment.md` - AI evaluation approach
- `docs/0_Prototype/PRD_Risks_Metrics.md` - Risk analysis and metrics

---

## 🌟 Key Innovations

1. **Counterstrike-Style Matchmaking** - Students form writing "parties" like gaming
2. **AI Player Integration** - AI fills empty slots instantly
3. **Character Evolution** - Visual growth representation (tree growing)
4. **Multi-Mode Strategy** - Practice, Quick, and Ranked for different goals
5. **Instant AI Feedback** - No waiting for teacher grading
6. **Competitive Learning** - Gamification that maintains educational rigor
7. **Batch Ranking System** - Fair comparative evaluation of all submissions
8. **Three-Phase Assessment** - Comprehensive writing skill evaluation

---

## 🎮 Live Demo Flow

1. Visit landing page: http://localhost:3000
2. Click "Start Writing Now"
3. Choose a game mode (try Practice first!)
4. Follow the setup wizard
5. Write for 4 minutes
6. Get instant AI feedback
7. See your scores and progression

---

## 🔄 Version Control

### Branches
- **`main`** - V1 stable release (current)
- **`v2-features`** - Future development (database, peer feedback, etc.)

### Latest Updates
- ✅ Centralized grading prompts system
- ✅ Refactored utilities and constants
- ✅ Improved error handling and logging
- ✅ Better code organization and maintainability

---

## 📊 Current Status

**V1 Status:** ✅ **COMPLETE & FUNCTIONAL**

- 45+ features implemented
- 13 pages/routes created
- 3 game modes working
- AI feedback operational
- Three-phase ranked battles
- Batch ranking system
- ~25% of full PRD vision

**Ready for:**
- Demos and presentations
- User testing
- Feedback collection
- Pilot programs (with manual tracking)

**Not ready for:**
- Large-scale deployment (no database)
- Long-term usage (no persistence)
- Classroom management (no teacher tools)

---

## 🚀 Next Steps

### Try It Out
```bash
npm run dev
# Visit http://localhost:3000
```

### Configure AI (Optional)
```bash
cp .env.local.example .env.local
# Add your Anthropic API key (see docs/5_Setup/SETUP_API.md)
npm run dev
```

### Start V2 Development
```bash
git checkout v2-features
# Start building database integration!
```

---

## 🎉 Achievements

✅ Complete user journey from landing to results  
✅ Three fully functional game modes  
✅ AI-powered writing assessment  
✅ Competitive mechanics (rankings, LP, XP)  
✅ Beautiful, responsive UI  
✅ Anti-cheating measures  
✅ Professional polish ready to demo  
✅ Centralized prompt system for easy editing  
✅ Refactored codebase for maintainability  

**V1 is a success!** Ready to show stakeholders and gather feedback for V2 priorities.

See `FEATURE_CATALOG.md` for detailed feature inventory and `V2_ROADMAP.md` for future development plans.

---

*Built with Learning Science principles and competitive gaming mechanics to transform K-12 writing instruction.*
