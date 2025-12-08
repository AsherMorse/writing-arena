# Tutorial Content Implementation Plan

> **Status:** ✅ Implementation Complete  
> **Created:** December 8, 2025  
> **Completed:** December 8, 2025

## Overview

This document outlines the plan for adding tutorial content to the Review phase of practice activities. Tutorials will display before the examples.

---

## Decisions Summary

| Decision | Choice |
|----------|--------|
| Tutorial display | One scrollable view + "Got it" button |
| Transition after "Got it" | Fade/transition to examples (true/false questions) |
| File format | `.md` files (requires webpack raw-loader config) |
| File location | `lib/constants/practice-tutorials/{lesson-id}.md` |
| Component location | `components/practice/tutorials/{lesson-id}.tsx` |
| Audio files | ❌ Skip |
| Placeholders `{{ }}` | ✅ Keep functional (per-activity components) |
| Blockquotes `>` | ✅ Show as styled quotes (blue) |
| Blockquote `> ...` markers | ✅ Keep as-is |
| Skip button | ❌ No - must click "Got it" |
| Sidebar during Write phase | ❌ Skip for now |
| Markdown renderer | `react-markdown` (needs install) |

---

## Architecture

### Flow
```
Review Phase Start
       ↓
┌─────────────────────┐
│   Tutorial View     │  ← Scrollable markdown content
│   (one scroll)      │
│                     │
│   [Got it] button   │
└─────────────────────┘
       ↓ (fade transition)
┌─────────────────────┐
│   Examples View     │  ← True/false evaluation questions
│   (existing flow)   │
└─────────────────────┘
       ↓
Write Phase
```

### Component Architecture

```
TutorialRenderer (shared)
├── Renders markdown via react-markdown
├── Handles blockquote styling (blue)
├── Handles placeholder `{{ }}` replacement
└── "Got it" button

Per-Activity Components (only for lessons with placeholders)
├── Imports tutorial.md
├── Defines placeholder JSX components
└── Passes to TutorialRenderer
```

---

## File Structure

```
lib/constants/practice-tutorials/
├── index.ts                          # Export all tutorials + mapping
├── fragment-or-sentence.md           # Markdown content
├── basic-conjunctions.md
├── ... (23 total .md files)

components/practice/tutorials/
├── TutorialRenderer.tsx              # Shared renderer component
├── index.ts                          # Export mapping
├── fragment-or-sentence.tsx          # Placeholder definitions
├── basic-conjunctions.tsx
├── ... (15 component files - only for lessons WITH placeholders)
```

---

## Lessons Audit

### WITH placeholders (need component file): 15 lessons

| Lesson ID | AlphaWrite | Placeholders |
|-----------|------------|--------------|
| fragment-or-sentence | 02 | `{{example_question}}`, `{{example_solution}}` |
| basic-conjunctions | 11 | `{{example_question}}`, `{{so_example_question}}`, etc. |
| subordinating-conjunctions | 14 | `{{example_question_fill_in}}`, `{{example_question_write}}`, etc. |
| kernel-expansion | 16 | `{{question}}`, `{{expansion}}`, `{{answer}}` |
| identify-topic-sentence | 19 | `{{sample}}` |
| eliminate-irrelevant-sentences | 22 | `{{example}}` |
| make-topic-sentences | 25 | `{{example_question}}`, `{{example_solution}}` |
| writing-spos | 28 | `{{example}}` |
| elaborate-paragraphs | 30 | `{{simple}}`, `{{revised}}` |
| using-transition-words | 31 | `{{timeExample}}`, `{{illustrationExample}}`, etc. (7) |
| finishing-transition-words | 32 | `{{timeExample}}`, `{{illustrationExample}}`, etc. (7) |
| write-freeform-paragraph | 33 | `{{topic}}`, `{{paragraph}}` |
| write-t-from-topic | 39 | `{{example_background}}`, `{{example_input}}`, `{{inspiration_button}}` |
| match-details-pro-con | 40 | `{{pro_con_example}}`, `{{dragging_example}}`, `{{practice_button}}` |
| pre-transition-outline | 50 | `{{Form}}`, `{{Topic}}`, `{{Thesis Statement}}`, etc. (9) |

### WITHOUT placeholders (no component needed): 8 lessons

| Lesson ID | AlphaWrite |
|-----------|------------|
| write-appositives | 13 |
| write-ts-from-details | 23 |
| write-cs-from-details | 24 |
| distinguish-g-s-t | 34 |
| write-s-from-g-t | 35 |
| write-g-s-from-t | 36 |
| craft-conclusion-from-gst | 37 |
| write-introductory-sentences | 38 |

---

## Setup Required

### 1. Install dependencies
```bash
npm install react-markdown raw-loader
```

### 2. Configure webpack for .md imports

In `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
```

### 3. Add TypeScript declaration

Create `types/md.d.ts`:
```typescript
declare module '*.md' {
  const content: string;
  export default content;
}
```

---

## Implementation Steps

### Phase 1: Setup
1. [x] Install `react-markdown`
2. [x] Configure webpack raw-loader in `next.config.js`
3. [x] Add TypeScript declaration for `.md` imports

### Phase 2: Core Components
4. [x] Create `TutorialRenderer.tsx` with:
   - Markdown rendering
   - Blockquote styling (blue)
   - Placeholder `{{ }}` replacement logic
   - "Got it" button

### Phase 3: Tutorial Content
5. [x] Create `lib/constants/practice-tutorials/` folder
6. [x] Copy 23 tutorial.md files from AlphaWrite
7. [x] Create index.ts with lesson ID → tutorial mapping

### Phase 4: Placeholder Components
8. [x] Create 15 component files for lessons with placeholders
9. [x] Define JSX for each placeholder (reference AlphaWrite implementations)

### Phase 5: Integration
10. [x] Modify `buildReviewSequence()` to include tutorial as first item
11. [x] Update `PracticeReviewPhase.tsx` to render tutorial with transition
12. [x] Add state management for tutorial → examples transition

### Phase 6: Testing
13. [ ] Test all 23 lessons render correctly
14. [ ] Test placeholder rendering
15. [ ] Test "Got it" → examples transition

---

## AlphaWrite Source Mapping

| Lesson ID | AlphaWrite Path |
|-----------|-----------------|
| fragment-or-sentence | `02-fragment-or-sentence/data/tutorial.md` |
| basic-conjunctions | `11-basic-conjunctions/data/tutorial.md` |
| write-appositives | `13-write-appositives/data/tutorial.md` |
| subordinating-conjunctions | `14-subordinating-conjunctions/data/tutorial.md` |
| kernel-expansion | `16-kernel-expansion/data/tutorial.md` |
| identify-topic-sentence | `19-identify-topic-sentence/data/tutorial.md` |
| eliminate-irrelevant-sentences | `22-eliminate-irrelevant-sentences/data/tutorial.md` |
| write-ts-from-details | `23-write-ts-from-details/data/tutorial.md` |
| write-cs-from-details | `24-write-cs-from-details/data/tutorial.md` |
| make-topic-sentences | `25-make-topic-sentences/data/tutorial.md` |
| writing-spos | `28-writing-spos/data/tutorial.md` |
| elaborate-paragraphs | `30-elaborate-paragraphs/data/tutorial.md` |
| using-transition-words | `31-using-transition-words/data/tutorial.md` |
| finishing-transition-words | `32-finishing-transition-words/data/tutorial.md` |
| write-freeform-paragraph | `33-write-freeform-paragraph/data/tutorial.md` |
| distinguish-g-s-t | `34-distinguish-g-s-t/data/tutorial.md` |
| write-s-from-g-t | `35-write-s-from-g-t/data/tutorial.md` |
| write-g-s-from-t | `36-write-g-s-from-t/data/tutorial.md` |
| craft-conclusion-from-gst | `37-craft-conclusion-from-gst/data/tutorial.md` |
| write-introductory-sentences | `38-write-introductory-sentences/data/tutorial.md` |
| write-t-from-topic | `39-write-t-from-topic/data/tutorial.md` |
| match-details-pro-con | `40-match-details-pro-con/data/tutorial.md` |
| pre-transition-outline | `50-pre-transition-outline/data/tutorial.md` |

---

## Notes

- **Blockquotes**: AlphaWrite uses `>` for audio-only content. Since we skip audio, we show these as styled blue blockquotes.
- **`> ...` markers**: Some tutorials have `> ...` as ellipsis placeholders for audio. Keep these as-is (will render as blockquotes).
- **Placeholders reference**: Check AlphaWrite's `apps/scribe/app/(practice)/practice/_components/activities/{slug}.tsx` for placeholder JSX examples.
