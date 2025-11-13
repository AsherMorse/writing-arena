# Prompt Library System

## ✅ Implemented: Random Prompt Selection

Replaced the 4 hardcoded prompts with a **library of 20 diverse prompts** that ensures variety in ranked matches.

## 📚 Prompt Library

**Location:** `/lib/prompts.ts`

### Total Prompts: 20 (5 per type)

#### Narrative (5 prompts)
1. An Unexpected Adventure 🌄
2. The Mysterious Door 🚪
3. Time Traveler for a Day ⏰
4. The Found Object 🎒
5. When Everything Changed 🌙

#### Descriptive (5 prompts)
1. A Mysterious Place 🏰
2. Sensory Experience 🌊
3. Before and After 🎨
4. A Place of Peace 🏔️
5. City at Night 🌃

#### Informational (5 prompts)
1. How Things Work 🔬
2. Growth and Change 🌱
3. Step by Step ⚙️
4. Why It Matters 🎯
5. Compare and Contrast 🔍

#### Argumentative (5 prompts)
1. Take a Stand 💭
2. Technology in Schools 📱
3. Homework Debate 🏠
4. Make a Change 🌍
5. Time Management ⏱️

## 🎲 How Selection Works

### Before (Old System):
```typescript
// Only 4 prompts total, one per type
const promptType = ['narrative', 'descriptive', 'informational', 'argumentative'][random];
// Same prompt every time for that type!
```

### After (New System):
```typescript
// 20 prompts total, 5 per type
const randomPrompt = getRandomPrompt();
// Could get any of 20 different prompts!
```

## 🔄 Selection Process

**Matchmaking Phase:**
1. When party is full, select random prompt from library (1 of 20)
2. Pass `promptId` to session page
3. Console logs: `📝 MATCHMAKING - Selected prompt: narrative-3 Time Traveler for a Day`

**Session Phase:**
1. Look up prompt by ID from library
2. If not found, get random as fallback
3. Display prompt image, title, description, and type
4. Console logs: `📝 SESSION - Using prompt: narrative-3 Time Traveler for a Day`

## 📊 Variety Statistics

**Old System:**
- 4 total prompts
- 25% chance of each
- Seeing same prompt frequently

**New System:**
- 20 total prompts
- 5% chance of each specific prompt
- 25% chance of each type
- Much more variety!

**Probability of seeing same prompt twice in a row:**
- Old: 25% (1 in 4)
- New: 5% (1 in 20)

## 🎯 Prompt Structure

Each prompt has:
```typescript
{
  id: string;              // Unique identifier (e.g., "narrative-3")
  type: string;            // narrative | descriptive | informational | argumentative
  image: string;           // Emoji icon (e.g., "🌄")
  title: string;           // Display title
  description: string;     // Writing instructions
  gradeLevel?: string;     // Optional grade level indicator
}
```

## 🔧 Helper Functions

**`getRandomPrompt(type?)`**
- Get random prompt, optionally filtered by type
- Example: `getRandomPrompt('narrative')` returns 1 of 5 narrative prompts

**`getRandomPromptExcluding(excludeIds)`**
- Get random prompt excluding specific IDs
- Useful for: "Don't show prompts they've already done"
- Falls back to any prompt if all excluded

**`getPromptById(id)`**
- Look up specific prompt by ID
- Returns undefined if not found
- Used when prompt ID passed in URL

## 🚀 Future Enhancements

**Easy to Add More Prompts:**
Just add to `PROMPT_LIBRARY` array:
```typescript
{
  id: 'narrative-6',
  type: 'narrative',
  image: '🎭',
  title: 'Your New Prompt',
  description: 'Write about...',
}
```

**Planned Features:**
- [ ] Grade-level filtering (show age-appropriate prompts)
- [ ] User prompt history (never repeat for 10+ matches)
- [ ] Seasonal/holiday prompts
- [ ] User-submitted prompts (community)
- [ ] Difficulty ratings
- [ ] Prompt voting/favoriting

## 📝 URL Parameter Flow

**Matchmaking → Session:**
```
?trait=all&promptId=narrative-3
```

**Session → Peer Feedback:**
```
?trait=all&promptId=narrative-3&promptType=narrative&content=...
```

Both `promptId` and `promptType` are passed for compatibility.

## ✅ Implementation Complete

- ✅ 20-prompt library created
- ✅ Random selection from full library
- ✅ Prompt ID tracking through flow
- ✅ Console logging for debugging
- ✅ Fallback to random if ID not found
- ✅ Type displayed in session UI

## 🧪 Testing

**Try multiple matches** - you should see different prompts:
1. Start ranked match → Note the prompt
2. Complete or quit
3. Start another ranked match → Should be different!
4. Check console for: `📝 MATCHMAKING - Selected prompt: [id] [title]`

**Expected variety:**
- ~75% chance of different type
- ~95% chance of different prompt overall

Much more engaging than the old 4-prompt system! 🎉

