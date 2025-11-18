# Developer Guide - Writing Arena

> Comprehensive guide for developers working on the Writing Arena platform

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [Editing Prompts](#editing-prompts)
4. [Understanding the Flow](#understanding-the-flow)
5. [Adding New Features](#adding-new-features)
6. [API Development](#api-development)
7. [Testing](#testing)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Components  │  │    Hooks     │  │   Services   │  │
│  │  (UI Layer)  │→ │ (State Mgmt) │→ │ (Firestore)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP Requests
┌─────────────────────────────────────────────────────────┐
│                  API ROUTES (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Prompts    │  │  API Helpers  │  │   Parsers    │  │
│  │ (Centralized)│→ │ (Claude API)  │→ │ (JSON Parse) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  ┌──────────────┐              ┌──────────────┐        │
│  │ Claude API   │              │  Firestore   │        │
│  │ (Anthropic)  │              │  (Firebase)  │        │
│  └──────────────┘              └──────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Centralized Prompts**: All AI evaluation prompts in one file for easy editing
2. **Batch Ranking**: All submissions evaluated together for fair comparison
3. **Real-time Sync**: Firestore listeners for live updates
4. **Utility Functions**: Reusable helpers for common operations
5. **Constants**: Magic numbers centralized for easy configuration

---

## 📁 Code Organization

### Directory Structure

```
lib/
├── prompts/
│   └── grading-prompts.ts      # ⭐ All AI evaluation prompts
├── utils/
│   ├── time-utils.ts          # Time formatting & colors
│   ├── api-helpers.ts         # API key & Claude calls
│   └── claude-parser.ts       # JSON parsing utilities
├── constants/
│   └── scoring.ts             # Scoring constants & config
├── hooks/
│   └── useSession.ts          # Session state management
└── services/
    ├── match-sync.ts          # Firestore match operations
    ├── matchmaking-queue.ts  # Queue management
    └── ai-students.ts        # AI student management

app/
├── api/
│   ├── batch-rank-writings/   # Phase 1 ranking
│   ├── batch-rank-feedback/   # Phase 2 ranking
│   └── batch-rank-revisions/  # Phase 3 ranking
└── ranked/
    ├── matchmaking/           # Matchmaking UI
    ├── session/               # Phase 1: Writing
    ├── peer-feedback/         # Phase 2: Peer Feedback
    ├── revision/              # Phase 3: Revision
    ├── phase-rankings/        # Rankings display
    └── results/               # Final results

components/
├── ranked/                    # Ranked mode components
├── shared/                    # Shared UI components
└── ui/                        # Base UI primitives
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `WritingSessionContent.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSession.ts`)
- **Utilities**: camelCase (e.g., `time-utils.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SCORING`)
- **API Routes**: kebab-case folders (e.g., `batch-rank-writings/`)

---

## 📝 Editing Prompts

### Location

**All prompts are in**: `lib/prompts/grading-prompts.ts`

### Prompt Functions

```typescript
// Phase 1: Writing Evaluation
getPhase1WritingPrompt(
  writings: Array<{ playerName: string; content: string }>,
  prompt: string,
  promptType: string,
  trait: string
): string

// Phase 2: Peer Feedback Evaluation
getPhase2PeerFeedbackPrompt(
  feedbackSubmissions: Array<{
    playerName: string;
    peerWriting: string;
    responses: { clarity, strengths, improvements, organization, engagement };
  }>
): string

// Phase 3: Revision Evaluation
getPhase3RevisionPrompt(
  revisionSubmissions: Array<{
    playerName: string;
    originalContent: string;
    revisedContent: string;
    feedback: any;
  }>
): string
```

### How to Edit

1. **Open** `lib/prompts/grading-prompts.ts`
2. **Find** the function you want to modify
3. **Edit** the prompt string (the text inside the backticks)
4. **Save** - Changes apply immediately (no restart needed for API routes)

### Example: Changing Scoring Criteria

```typescript
// Before
**Rank 1 (90-100)**: Mastery of 5+ TWR strategies...

// After
**Rank 1 (95-100)**: Exceptional mastery of 6+ TWR strategies...
**Rank 2 (85-94)**: Strong mastery of 4-5 TWR strategies...
```

### Example: Adding New Evaluation Criteria

```typescript
export function getPhase1WritingPrompt(...) {
  return `You are a writing instructor...
  
  EVALUATE USING THE WRITING REVOLUTION FRAMEWORK:
  
  **SENTENCE-LEVEL SKILLS**:
  1. Sentence Expansion (because/but/so)
  2. Appositives
  // ... existing criteria
  
  **NEW CRITERIA**:
  11. Dialogue Integration - Natural conversation flow
  12. Figurative Language - Metaphors and similes
  
  // ... rest of prompt
  `;
}
```

### Testing Prompt Changes

1. Make your edits
2. Restart dev server: `npm run dev`
3. Run a test match
4. Check server console logs for:
   - `✅ BATCH RANK WRITINGS - Using real AI evaluation`
   - `✅ BATCH RANK WRITINGS - Successfully parsed AI response`
5. Verify scores in UI match your expectations

### Common Prompt Modifications

**Adjusting Strictness**:
- Modify score ranges (e.g., `90-100` → `85-100`)
- Change "Mastery" thresholds (e.g., `5+ strategies` → `4+ strategies`)

**Adding Feedback Requirements**:
- Add new sections to the prompt
- Modify JSON response structure
- Update example outputs

**Changing Evaluation Focus**:
- Emphasize different TWR strategies
- Adjust trait weights
- Modify feedback specificity requirements

---

## 🔄 Understanding the Flow

### Ranked Mode: Complete Flow

```
1. MATCHMAKING
   ├─ User joins queue OR clicks "Play Against AI Now"
   ├─ Match fills to 5 players (human + AI)
   └─ Session created in Firestore

2. PHASE 1: WRITING (2 minutes)
   ├─ User writes response
   ├─ AI generates 4 opponent writings (parallel)
   ├─ User submits → triggers batch ranking
   ├─ All 5 writings sent to Claude API
   ├─ Rankings returned and stored
   └─ Transition to Phase 2

3. PHASE 2: PEER FEEDBACK (1.5 minutes)
   ├─ User assigned a peer's writing (round-robin)
   ├─ User answers 5 feedback questions
   ├─ AI generates 4 opponent feedbacks (parallel)
   ├─ User submits → triggers batch ranking
   ├─ All 5 feedbacks sent to Claude API
   ├─ Rankings returned and stored
   └─ Transition to Phase 3

4. PHASE 3: REVISION (1.5 minutes)
   ├─ User sees original writing + feedback
   ├─ User revises writing
   ├─ AI generates 4 opponent revisions (parallel)
   ├─ User submits → triggers batch ranking
   ├─ All 5 revisions sent to Claude API
   ├─ Rankings returned and stored
   └─ Transition to Results

5. RESULTS
   ├─ Composite score calculated (40% + 30% + 30%)
   ├─ Final rankings displayed
   ├─ LP changes applied
   ├─ XP rewards granted
   └─ Return to dashboard
```

### Component Flow

```
MatchmakingContent.tsx
    ↓ creates session
WritingSessionContent.tsx (Phase 1)
    ↓ submits writing
    ↓ calls /api/batch-rank-writings
    ↓ receives rankings
    ↓ transitions to Phase 2
PeerFeedbackContent.tsx (Phase 2)
    ↓ submits feedback
    ↓ calls /api/batch-rank-feedback
    ↓ receives rankings
    ↓ transitions to Phase 3
RevisionContent.tsx (Phase 3)
    ↓ submits revision
    ↓ calls /api/batch-rank-revisions
    ↓ receives rankings
    ↓ transitions to Results
ResultsContent.tsx
    ↓ displays final scores
```

### Data Flow: Batch Ranking

```
Component
    ↓ prepareSubmissions()
    ↓ fetch('/api/batch-rank-writings', {
        writings: [
          { playerId, playerName, content, wordCount },
          ...
        ],
        prompt, promptType, trait
      })
    ↓
API Route (batch-rank-writings/route.ts)
    ↓ getPhase1WritingPrompt(writings, prompt, promptType, trait)
    ↓ callAnthropicAPI(apiKey, prompt, 3000)
    ↓ parseClaudeJSON(response)
    ↓ return { rankings: [...] }
    ↓
Component
    ↓ receives rankings
    ↓ stores in Firestore
    ↓ displays results
```

### Session State Management

**`useSession` Hook** (`lib/hooks/useSession.ts`):
- Manages real-time Firestore listeners
- Tracks phase, time remaining, player states
- Handles phase transitions
- Provides `submitPhase()` function

**Key State**:
```typescript
{
  session: {
    config: { phase, phaseDuration, promptId, ... },
    players: { [userId]: { phases: { phase1, phase2, phase3 } } },
    coordination: { allPlayersReady, readyCount },
    timing: { phase1StartTime, phase2StartTime, ... }
  },
  timeRemaining: number,
  hasSubmitted: boolean
}
```

---

## 🆕 Adding New Features

### 1. Adding a New Phase

#### Step 1: Create Component

```typescript
// components/ranked/NewPhaseContent.tsx
'use client';

import { useSession } from '@/lib/hooks/useSession';
import { formatTime, getTimeColor } from '@/lib/utils/time-utils';
import { SCORING } from '@/lib/constants/scoring';

export default function NewPhaseContent() {
  const { session, timeRemaining, submitPhase, hasSubmitted } = useSession();
  
  const handleSubmit = async () => {
    await submitPhase(4, { // phase number
      // your submission data
    });
  };
  
  return (
    <div>
      <div className={getTimeColor(timeRemaining)}>
        {formatTime(timeRemaining)}
      </div>
      {/* Your UI */}
    </div>
  );
}
```

#### Step 2: Create API Route

```typescript
// app/api/batch-rank-new-phase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getNewPhasePrompt } from '@/lib/prompts/grading-prompts';
import { getAnthropicApiKey, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

export async function POST(request: NextRequest) {
  const { submissions } = await request.json();
  
  try {
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json(generateMockRankings(submissions));
    }
    
    const prompt = getNewPhasePrompt(submissions);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 3000);
    const parsed = parseClaudeJSON(aiResponse.content[0].text);
    
    return NextResponse.json({ rankings: parsed.rankings });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(generateMockRankings(submissions));
  }
}
```

#### Step 3: Add Prompt Function

```typescript
// lib/prompts/grading-prompts.ts

export function getNewPhasePrompt(submissions: any[]): string {
  return `You are evaluating...
  
  ${submissions.map((s, i) => 
    `SUBMISSION ${i + 1}: ${s.playerName}\n${s.content}\n---`
  ).join('\n\n')}
  
  TASK:
  Evaluate each submission based on...
  
  Return JSON:
  {
    "rankings": [
      {
        "playerId": "writer_index_0",
        "score": 85,
        "rank": 1,
        ...
      }
    ]
  }
  `;
}
```

#### Step 4: Update Constants

```typescript
// lib/constants/scoring.ts

export const SCORING = {
  // ... existing
  PHASE4_DURATION: 90, // Add new phase duration
  DEFAULT_PHASE4_SCORE: 80, // Add default score
} as const;
```

#### Step 5: Update Routing

```typescript
// app/ranked/new-phase/page.tsx
import NewPhaseContent from '@/components/ranked/NewPhaseContent';

export default function NewPhasePage() {
  return <NewPhaseContent />;
}
```

#### Step 6: Update Session Hook

```typescript
// lib/hooks/useSession.ts
// Add phase 4 transition logic
// Update phase duration handling
```

### 2. Modifying Scoring Logic

#### Change Phase Durations

```typescript
// lib/constants/scoring.ts
export const SCORING = {
  PHASE1_DURATION: 180, // Changed from 120
  PHASE2_DURATION: 120,  // Changed from 90
  // ...
};
```

#### Change Score Ranges

```typescript
// lib/prompts/grading-prompts.ts
export function getPhase1WritingPrompt(...) {
  return `...
  **Rank 1 (95-100)**: Exceptional mastery... // Changed from 90-100
  **Rank 2-3 (85-94)**: Strong use...         // Changed from 80-89
  `;
}
```

#### Change Weight Distribution

```typescript
// components/ranked/ResultsContent.tsx
const compositeScore = 
  (phase1Score * 0.5) +  // Changed from 0.4
  (phase2Score * 0.25) + // Changed from 0.3
  (phase3Score * 0.25);  // Changed from 0.3
```

### 3. Adding New UI Components

#### Shared Component (Reusable)

```typescript
// components/shared/YourComponent.tsx
'use client';

interface YourComponentProps {
  // props
}

export default function YourComponent({ ...props }: YourComponentProps) {
  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

#### Mode-Specific Component

```typescript
// components/ranked/YourRankedComponent.tsx
'use client';

import { useSession } from '@/lib/hooks/useSession';

export default function YourRankedComponent() {
  const { session } = useSession();
  // Component logic
}
```

---

## 🔌 API Development

### Standard API Route Pattern

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { SCORING } from '@/lib/constants/scoring';

export async function POST(request: NextRequest) {
  // 1. Read request body once
  const requestBody = await request.json();
  const { data } = requestBody;
  
  try {
    // 2. Log API key status
    logApiKeyStatus('YOUR ENDPOINT');
    
    // 3. Get API key
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ API key missing, using fallback');
      return NextResponse.json(generateMockData(data));
    }
    
    // 4. Get prompt from centralized prompts
    const prompt = getYourPrompt(data);
    
    // 5. Call Claude API
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 3000);
    
    // 6. Parse response
    const parsed = parseClaudeJSON(aiResponse.content[0].text);
    
    // 7. Return results
    return NextResponse.json(parsed);
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(generateMockData(data));
  }
}

function generateMockData(data: any): any {
  // Fallback mock data
  return { /* ... */ };
}
```

### Error Handling Best Practices

1. **Always read request body once** at the top
2. **Log API key status** for debugging
3. **Provide fallback mock data** if API fails
4. **Log errors** with context
5. **Return consistent response format**

### Testing API Routes

```bash
# Test locally
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Check server logs
npm run dev
# Look for: ✅ or ❌ emoji logs
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Build check
npm run build
```

### Test Structure

```
__tests__/
├── api/              # API endpoint tests
├── integration/      # Integration tests
├── lib/              # Utility function tests
└── stress/           # Stress tests
```

### Writing Tests

```typescript
// __tests__/api/your-endpoint.test.ts
import { POST } from '@/app/api/your-endpoint/route';

describe('Your Endpoint', () => {
  it('should handle valid requests', async () => {
    const request = new Request('http://localhost/api/your-endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('rankings');
  });
});
```

---

## 🎯 Common Patterns

### Pattern 1: Time Display

```typescript
import { formatTime, getTimeColor } from '@/lib/utils/time-utils';

<div className={getTimeColor(timeRemaining)}>
  {formatTime(timeRemaining)}
</div>
```

### Pattern 2: Score Clamping

```typescript
import { clampScore } from '@/lib/constants/scoring';

const score = clampScore(rawScore); // Ensures 0-100 range
```

### Pattern 3: Default Scores

```typescript
import { getDefaultScore } from '@/lib/constants/scoring';

const score = data.score || getDefaultScore(1); // Phase 1 default
```

### Pattern 4: API Key Check

```typescript
import { getAnthropicApiKey, logApiKeyStatus } from '@/lib/utils/api-helpers';

logApiKeyStatus('CONTEXT');
const apiKey = getAnthropicApiKey();
if (!apiKey) {
  // Use fallback
}
```

### Pattern 5: Phase Submission

```typescript
const { submitPhase } = useSession();

await submitPhase(phaseNumber, {
  content: writing,
  wordCount: count,
  score: calculatedScore,
});
```

---

## 🐛 Troubleshooting

### Issue: Prompts Not Updating

**Solution**: 
- Restart dev server: `npm run dev`
- Check that you edited `lib/prompts/grading-prompts.ts`
- Verify API route imports the correct function

### Issue: API Key Not Working

**Check**:
1. `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...`
2. Server logs show: `✅ API Key Check: { hasKey: true }`
3. Not using placeholder: `your_api_key_here`

**Debug**:
```typescript
// Check logs for:
logApiKeyStatus('YOUR CONTEXT');
// Should show: hasKey: true, keyLength: > 0
```

### Issue: Scores Seem Wrong

**Check**:
1. Are you using mock scoring? (Check logs for `⚠️ MOCK RANKINGS`)
2. Is API key configured correctly?
3. Are prompts evaluating what you expect?
4. Check `lib/constants/scoring.ts` for default values

### Issue: Phase Not Transitioning

**Check**:
1. `useSession` hook is being used correctly
2. `submitPhase()` is called
3. Firestore has correct phase state
4. All players submitted (check `coordination.allPlayersReady`)

### Issue: Batch Ranking Failing

**Check**:
1. All submissions have required fields (`playerId`, `playerName`, `content`)
2. Prompt function receives correct parameters
3. Claude API response is valid JSON
4. Parser handles response correctly

---

## 📚 Additional Resources

- **Prompts**: `lib/prompts/grading-prompts.ts`
- **Constants**: `lib/constants/scoring.ts`
- **Utilities**: `lib/utils/`
- **Session Management**: `lib/hooks/useSession.ts`
- **API Routes**: `app/api/`

---

## 🤝 Contributing

1. Follow existing code patterns
2. Use centralized utilities and constants
3. Add appropriate error handling
4. Update this guide if adding new patterns
5. Test your changes thoroughly

---

*Last updated: 2024 - After major refactoring*

