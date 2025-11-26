# New Refactoring Opportunities - 2024

## 🔴 HIGH PRIORITY

### 1. AP Lang Score Validation Duplication

**Problem:**
Score validation logic in `app/api/ap-lang/grade/route.ts` (lines 76-85) uses repetitive `Math.max(0, Math.min(max, value))` pattern for each component score.

**Current Code:**
```typescript
if (result.thesisScore < 0 || result.thesisScore > 1) {
  result.thesisScore = Math.max(0, Math.min(1, result.thesisScore));
}
if (result.evidenceScore < 0 || result.evidenceScore > 4) {
  result.evidenceScore = Math.max(0, Math.min(4, result.evidenceScore));
}
if (result.sophisticationScore < 0 || result.sophisticationScore > 1) {
  result.sophisticationScore = Math.max(0, Math.min(1, result.sophisticationScore));
}
```

**Solution:**
Create a reusable validation utility:
```typescript
// lib/utils/score-validation.ts
export function clampScoreComponent(score: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, score));
}

export function validateAPLangScores(result: any): void {
  result.thesisScore = clampScoreComponent(result.thesisScore, 0, 1);
  result.evidenceScore = clampScoreComponent(result.evidenceScore, 0, 4);
  result.sophisticationScore = clampScoreComponent(result.sophisticationScore, 0, 1);
}
```

**Impact:** 
- Remove ~9 lines of repetitive code
- Consistent validation logic
- Easier to add new score components

---

### 2. Grade Level Parsing Logic Duplication

**Problem:**
Long if-else chain in `app/api/improve/chat/route.ts` (lines 72-82) and `app/api/improve/analyze/route.ts` (lines 100+) for parsing grade level strings. Note: `lib/utils/skill-level.ts` has `getGradeLevelNumber()` but it's designed for rank strings, not grade level strings.

**Current Code:**
```typescript
let gradeNum = 7; // Default to 7th grade
if (gradeLevel.includes('3rd')) gradeNum = 3;
else if (gradeLevel.includes('4th')) gradeNum = 4;
else if (gradeLevel.includes('5th')) gradeNum = 5;
// ... continues for all grades
```

**Solution:**
Create a utility function (or enhance existing `skill-level.ts`):
```typescript
// lib/utils/grade-parser.ts
export function parseGradeLevel(gradeLevel: string): number {
  // Handle ranges like "7th-8th" by taking the first number
  const gradeMatch = gradeLevel.match(/(\d+)(?:st|nd|rd|th)/);
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1], 10);
    // Validate range
    if (gradeNum >= 3 && gradeNum <= 12) {
      return gradeNum;
    }
  }
  return 7; // Default to 7th grade
}

export function getGradeLevelCategory(gradeNum: number): 'elementary' | 'middle' | 'high' {
  if (gradeNum >= 3 && gradeNum <= 5) return 'elementary';
  if (gradeNum >= 6 && gradeNum <= 8) return 'middle';
  if (gradeNum >= 9 && gradeNum <= 12) return 'high';
  return 'middle'; // Default
}
```

**Impact:**
- Remove ~12 lines of repetitive code per file (2+ files affected)
- More maintainable (handles edge cases better)
- Reusable across codebase
- Note: Consider consolidating with `skill-level.ts` if appropriate

---

### 3. AP Lang Score Descriptor Mapping

**Problem:**
Hardcoded descriptor mapping in `app/api/ap-lang/grade/route.ts` (lines 92-101) could be extracted to constants.

**Current Code:**
```typescript
const descriptors: Record<number, string> = {
  6: 'Excellent',
  5: 'Strong',
  4: 'Adequate',
  3: 'Developing',
  2: 'Weak',
  1: 'Very Weak',
  0: 'Insufficient',
};
result.scoreDescriptor = descriptors[result.score] || 'Adequate';
```

**Solution:**
Move to constants file:
```typescript
// lib/constants/ap-lang-scoring.ts
export const AP_LANG_SCORE_DESCRIPTORS: Record<number, string> = {
  6: 'Excellent',
  5: 'Strong',
  4: 'Adequate',
  3: 'Developing',
  2: 'Weak',
  1: 'Very Weak',
  0: 'Insufficient',
} as const;

export function getAPLangScoreDescriptor(score: number): string {
  return AP_LANG_SCORE_DESCRIPTORS[score] || 'Adequate';
}
```

**Impact:**
- Centralized constants
- Easier to update descriptors
- Reusable if needed elsewhere

---

## 🟡 MEDIUM PRIORITY

### 4. Console Logging Pattern Standardization

**Problem:**
Inconsistent console logging patterns across 61+ files:
- Some use emoji prefixes (`✅`, `❌`, `⚠️`)
- Some use context prefixes (`BATCH RANK FEEDBACK`, `AP LANG GRADE`)
- Some use both, some use neither
- No structured logging format

**Current Examples:**
```typescript
console.log('⏰ AUTO-SUBMIT - Time expired, auto-submitting...');
console.error('❌ AUTO-SUBMIT - Error during submission:', err);
console.warn('⚠️ BATCH RANK FEEDBACK - Falling back to mock rankings');
console.log('✅ BATCH RANK FEEDBACK - Successfully parsed AI response');
```

**Solution:**
Create a logging utility:
```typescript
// lib/utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  module: string;
  action?: string;
}

export function createLogger(context: LogContext) {
  const prefix = `[${context.module}${context.action ? ` - ${context.action}` : ''}]`;
  
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`✅ ${prefix} ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`⚠️ ${prefix} ${message}`, ...args);
    },
    error: (message: string, error?: Error | unknown, ...args: any[]) => {
      console.error(`❌ ${prefix} ${message}`, error, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`🔍 ${prefix} ${message}`, ...args);
      }
    },
  };
}

// Usage:
const logger = createLogger({ module: 'AUTO-SUBMIT' });
logger.info('Time expired, auto-submitting...');
logger.error('Error during submission', err);
```

**Impact:**
- Consistent logging format
- Easier to filter/search logs
- Can add log levels, file output, etc. later
- Better debugging experience

---

### 5. JSON Parsing Pattern Duplication

**Problem:**
`app/api/ap-lang/grade/route.ts` (lines 68-74) has custom JSON parsing logic, but `lib/utils/claude-parser.ts` already has `parseClaudeJSON()` that does the same thing! The AP Lang route should use the existing utility.

**Current Code:**
```typescript
// app/api/ap-lang/grade/route.ts
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('Could not parse AI response');
}
const result = JSON.parse(jsonMatch[0]);
```

**Existing Utility:**
```typescript
// lib/utils/claude-parser.ts (already exists!)
export function parseClaudeJSON<T>(claudeResponse: string): T | null {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Claude response');
      return null;
    }
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('❌ Error parsing Claude JSON:', error);
    return null;
  }
}
```

**Solution:**
Use the existing utility:
```typescript
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

const result = parseClaudeJSON<APLangScoreResult>(responseText);
if (!result) {
  throw new Error('Could not parse AI response');
}
```

**Impact:**
- Remove duplicate code
- Consistent error handling
- Better error messages (already logged)
- Type-safe parsing

---

### 6. Essay Type Validation Duplication

**Problem:**
Essay type validation in `app/api/ap-lang/grade/route.ts` (lines 33-38) uses hardcoded array. This validation pattern may be duplicated.

**Current Code:**
```typescript
if (!['argument', 'rhetorical-analysis', 'synthesis'].includes(essayType)) {
  return NextResponse.json(
    { error: 'Invalid essay type. Must be argument, rhetorical-analysis, or synthesis' },
    { status: 400 }
  );
}
```

**Solution:**
Create constants and validation utility:
```typescript
// lib/constants/ap-lang-types.ts
export const AP_LANG_ESSAY_TYPES = ['argument', 'rhetorical-analysis', 'synthesis'] as const;
export type APLangEssayType = typeof AP_LANG_ESSAY_TYPES[number];

export function isValidEssayType(type: string): type is APLangEssayType {
  return AP_LANG_ESSAY_TYPES.includes(type as APLangEssayType);
}
```

**Impact:**
- Type-safe essay types
- Single source of truth
- Easier to add new types

---

### 7. Switch Statement to Map Pattern

**Problem:**
Switch statement in `app/api/ap-lang/grade/route.ts` (lines 51-63) for selecting prompt function could use a map pattern.

**Current Code:**
```typescript
let scoringPrompt: string;
switch (essayType as EssayType) {
  case 'rhetorical-analysis':
    scoringPrompt = getAPLangRhetoricalAnalysisPrompt(prompt, essay);
    break;
  case 'synthesis':
    scoringPrompt = getAPLangSynthesisPrompt(prompt, essay);
    break;
  case 'argument':
  default:
    scoringPrompt = getAPLangArgumentPrompt(prompt, essay);
    break;
}
```

**Solution:**
Use a map pattern:
```typescript
// lib/prompts/grading-prompts.ts
export const AP_LANG_PROMPT_FUNCTIONS: Record<APLangEssayType, (prompt: string, essay: string) => string> = {
  'argument': getAPLangArgumentPrompt,
  'rhetorical-analysis': getAPLangRhetoricalAnalysisPrompt,
  'synthesis': getAPLangSynthesisPrompt,
};

// Usage:
const promptFunction = AP_LANG_PROMPT_FUNCTIONS[essayType] || AP_LANG_PROMPT_FUNCTIONS['argument'];
const scoringPrompt = promptFunction(prompt, essay);
```

**Impact:**
- More declarative
- Easier to add new essay types
- No need for switch/default

---

## 🟢 LOW PRIORITY

### 8. Hardcoded Color Values in Phase Colors

**Problem:**
Hardcoded hex colors in `lib/utils/phase-colors.ts` (lines 24-26) instead of using constants from `lib/constants/colors.ts`.

**Current Code:**
```typescript
const colors = {
  1: { green: PHASE_COLORS[1], yellow: '#ff9030', red: '#ff5f8f' },
  2: { green: PHASE_COLORS[2], yellow: '#ff9030', red: PHASE_COLORS[2] },
  3: { green: PHASE_COLORS[3], yellow: '#ff9030', red: '#ff5f8f' },
};
```

**Solution:**
Use constants:
```typescript
import { COLORS, PHASE_COLORS } from '@/lib/constants/colors';

const colors = {
  1: { green: PHASE_COLORS[1], yellow: COLORS.primary.orange, red: COLORS.primary.pink },
  2: { green: PHASE_COLORS[2], yellow: COLORS.primary.orange, red: PHASE_COLORS[2] },
  3: { green: PHASE_COLORS[3], yellow: COLORS.primary.orange, red: COLORS.primary.pink },
};
```

**Impact:**
- Consistent color usage
- Easier theme changes
- Single source of truth

---

### 9. Magic Number: Max Tokens

**Problem:**
Hardcoded `maxTokens` values scattered across API routes:
- `app/api/ap-lang/grade/route.ts`: `2500`
- `app/api/batch-rank-feedback/route.ts`: `2500`
- `app/api/batch-rank-revisions/route.ts`: `3500`
- `app/api/batch-rank-writings/route.ts`: `3000`

**Solution:**
Create constants:
```typescript
// lib/constants/api-config.ts
export const API_MAX_TOKENS = {
  AP_LANG_GRADE: 2500,
  BATCH_RANK_FEEDBACK: 2500,
  BATCH_RANK_REVISIONS: 3500,
  BATCH_RANK_WRITINGS: 3000,
} as const;
```

**Impact:**
- Easier to adjust token limits
- Single source of truth
- Better documentation

---

### 10. Error Response Pattern Standardization

**Problem:**
Inconsistent error response patterns across API routes:
- Some return `{ error: string }`
- Some include status codes
- Some have different error message formats

**Solution:**
Create error response utility:
```typescript
// lib/utils/api-responses.ts
import { NextResponse } from 'next/server';

export function createErrorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
```

**Impact:**
- Consistent error responses
- Easier to update error format
- Better type safety

---

## 📊 Summary

| Priority | Opportunity | Impact | Effort | Files Affected |
|----------|------------|--------|--------|----------------|
| 🔴 High | AP Lang Score Validation | Medium | Low | 1 |
| 🔴 High | Grade Level Parsing | Medium | Low | 2+ |
| 🔴 High | AP Lang Descriptors | Low | Low | 1 |
| 🟡 Medium | Console Logging | High | Medium | 61+ |
| 🟡 Medium | JSON Parsing (Use Existing) | Medium | Low | 1 |
| 🟡 Medium | Essay Type Validation | Low | Low | 1 |
| 🟡 Medium | Switch to Map Pattern | Low | Low | 1 |
| 🟢 Low | Hardcoded Colors | Low | Low | 1 |
| 🟢 Low | Max Tokens Constants | Low | Low | 4 |
| 🟢 Low | Error Response Pattern | Medium | Low | Multiple |

---

## 🎯 Recommended Implementation Order

1. **Start with High Priority items** - Quick wins with immediate impact
2. **Console Logging** - High impact but requires careful migration
3. **Medium Priority utilities** - Improve code quality incrementally
4. **Low Priority** - Polish and consistency improvements

---

## 📝 Notes

- Some opportunities may already be partially addressed (check existing utilities first)
- Consider creating a shared utilities file for API route helpers
- Look for similar patterns in other API routes not yet examined
- Consider adding TypeScript strict mode checks for better type safety

