# Latest Refactoring Opportunities

> Additional refactoring opportunities identified after comprehensive analysis

## 🔍 Analysis Summary

After analyzing the codebase more deeply, we've identified **10 new refactoring opportunities** that would further improve code quality and consistency.

---

## 1. 🎨 Button Component Adoption (MEDIUM PRIORITY)

### Problem
`Button` component exists (`components/ui/Button.tsx`) but **many components still use inline button styles**:
- `LandingContent.tsx` - Multiple inline button styles
- `RankedLanding.tsx` - Inline button styles
- `PracticeLanding.tsx` - Inline button styles
- `QuickMatchLanding.tsx` - Inline button styles
- `DashboardContent.tsx` - Inline button styles
- `ErrorState.tsx` - Inline button style

### Current Code
```typescript
// Repeated button patterns
<Link className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
  Button Text
</Link>

<button className="rounded-full border border-emerald-200/40 bg-emerald-400 px-8 py-3 text-center text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300">
  Button Text
</button>
```

### Solution
**Update:** Components to use `Button` component from `components/ui/Button.tsx`
**Enhance:** `Button` component to support `as` prop for Link compatibility

```typescript
// Enhanced Button component
interface ButtonProps {
  as?: 'button' | 'a' | typeof Link;
  href?: string;
  // ... existing props
}

// Usage
<Button variant="secondary" as={Link} href="/dashboard">
  Return to Dashboard
</Button>
```

**Impact:** Remove ~10 lines per component, **10+ components** simplified, consistent button styling

---

## 2. 📦 Card Component Adoption (MEDIUM PRIORITY)

### Problem
`Card` component exists (`components/ui/Card.tsx`) but **many components still use inline card styles**:
- `LandingContent.tsx` - Multiple inline card styles
- `ResultsContent.tsx` - Inline card styles
- `PracticeLanding.tsx` - Inline card styles
- `RankedLanding.tsx` - Inline card styles
- `DashboardContent.tsx` - Inline card styles

### Current Code
```typescript
// Repeated card patterns
<div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
  {/* Content */}
</div>

<div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
  {/* Content */}
</div>
```

### Solution
**Update:** Components to use `Card` component from `components/ui/Card.tsx`

```typescript
// Usage
<Card variant="default" size="lg">
  {/* Content */}
</Card>

<Card variant="muted" size="sm">
  {/* Content */}
</Card>
```

**Impact:** Remove ~5 lines per usage, **15+ components** simplified, consistent card styling

---

## 3. 🎯 PlayerCard Component Adoption (MEDIUM PRIORITY)

### Problem
`PlayerCard` component exists but **not fully adopted**:
- `WaitingForPlayers.tsx` - Still uses inline player card rendering (lines 246-268)
- `MatchmakingContent.tsx` - Still uses inline player card rendering (lines 628-663)
- `ranked/ResultsContent.tsx` - Could use PlayerCard for default variant

### Current Code
```typescript
// WaitingForPlayers.tsx - Inline player card
<div className={`rounded-2xl border px-3 py-4 text-center text-xs font-semibold transition ${
  isSubmitted
    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
    : 'border-white/10 bg-white/5 text-white/40'
}`}>
  <div className="text-2xl mb-2">
    {isSubmitted ? '✅' : member.avatar || '⌛'}
  </div>
  <div className="truncate text-sm text-white/80">
    {member.name || `Slot ${index + 1}`}
  </div>
  <div className="text-[11px] text-white/40">{member.rank}</div>
</div>
```

### Solution
**Update:** Components to use `PlayerCard` with appropriate variants

```typescript
// WaitingForPlayers.tsx
<PlayerCard
  player={member}
  variant="waiting"
  isSubmitted={isSubmitted}
  showRank
/>

// MatchmakingContent.tsx
<PlayerCard
  player={player}
  variant="compact"
  showPosition
/>
```

**Impact:** Remove ~20 lines per component, **3+ components** simplified

---

## 4. 🔄 Navigation Hook (LOW PRIORITY)

### Problem
Similar navigation patterns with `router.push()` repeated in **15+ components**:
- `PhaseRankingsContent.tsx` - Complex URL building
- `WritingSessionContent.tsx` - Navigation patterns
- `PeerFeedbackContent.tsx` - Navigation patterns
- `RevisionContent.tsx` - Navigation patterns
- Various landing pages

### Current Code
```typescript
// Repeated navigation pattern
router.push(
  `/ranked/peer-feedback?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&content=${content}&wordCount=${wordCount}&aiScores=${aiScores}&yourScore=${yourScore}`
);
```

### Solution
**Create:** `lib/hooks/useNavigation.ts`
```typescript
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useNavigation() {
  const router = useRouter();
  
  const navigateToResults = useCallback((params: ResultsURLParams) => {
    router.push(buildResultsURL(params));
  }, [router]);
  
  const navigateToPhase = useCallback((phase: 1 | 2 | 3, params: PhaseParams) => {
    // Build phase URL
  }, [router]);
  
  const navigateToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);
  
  return {
    navigateToResults,
    navigateToPhase,
    navigateToDashboard,
    router,
  };
}
```

**Impact:** Cleaner navigation, type-safe URLs, **15+ components** simplified

---

## 5. 🎨 Badge Component (LOW PRIORITY)

### Problem
Similar badge/pill patterns repeated across components:
- Status badges
- Rank badges
- Trait badges
- "Coming Soon" badges

### Current Code
```typescript
// Repeated badge patterns
<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
  Trait focus: {trait || 'all'}
</span>

<span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
  Coming Soon
</span>
```

### Solution
**Create:** `components/ui/Badge.tsx`
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'muted';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  // Standardized badge styles
}
```

**Impact:** Consistent badges, **10+ components** simplified

---

## 6. 📊 Section Header Component (LOW PRIORITY)

### Problem
Similar section header patterns repeated:
- Uppercase tracking labels
- Title + description patterns
- Consistent spacing

### Current Code
```typescript
// Repeated section header pattern
<div>
  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Section Title</div>
  <h2 className="mt-2 text-2xl font-semibold">Main Heading</h2>
  <p className="mt-1 text-xs text-white/50">Description text</p>
</div>
```

### Solution
**Create:** `components/shared/SectionHeader.tsx`
```typescript
interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ label, title, description, className }: SectionHeaderProps) {
  // Standardized section header
}
```

**Impact:** Consistent headers, **20+ components** simplified

---

## 7. 🎯 LinkButton Component (LOW PRIORITY)

### Problem
Many components use `Link` with button styling - could be unified:
- Landing pages
- Dashboard
- Results pages

### Current Code
```typescript
// Repeated Link + button pattern
<Link
  href="/dashboard"
  className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
>
  Return to Dashboard
</Link>
```

### Solution
**Create:** `components/ui/LinkButton.tsx`
```typescript
import Link from 'next/link';
import { ButtonProps } from './Button';

interface LinkButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string;
}

export function LinkButton({ href, ...buttonProps }: LinkButtonProps) {
  return (
    <Link href={href}>
      <Button {...buttonProps} />
    </Link>
  );
}
```

**Impact:** Consistent link buttons, **15+ components** simplified

---

## 8. 🔄 Array Transformation Utilities (LOW PRIORITY)

### Problem
Similar array transformation patterns repeated:
- Filtering players by AI status
- Mapping players to display format
- Finding player by userId

### Current Code
```typescript
// Repeated patterns
const realPlayers = allPlayers.filter((p: any) => !p.isAI);
const submittedPlayers = realPlayers.filter((p: any) => p.phases.phase1?.submitted);
const yourPlayer = players.find(p => p.userId === user?.uid);
```

### Solution
**Create:** `lib/utils/array-utils.ts`
```typescript
export function filterRealPlayers<T extends { isAI?: boolean }>(players: T[]): T[] {
  return players.filter(p => !p.isAI);
}

export function filterAIPlayers<T extends { isAI?: boolean }>(players: T[]): T[] {
  return players.filter(p => p.isAI);
}

export function findPlayerByUserId<T extends { userId?: string }>(
  players: T[],
  userId: string
): T | undefined {
  return players.find(p => p.userId === userId);
}

export function filterSubmittedPlayers<T extends { phases?: any }>(
  players: T[],
  phase: 1 | 2 | 3
): T[] {
  return players.filter(p => p.phases?.[`phase${phase}`]?.submitted);
}
```

**Impact:** More readable code, **10+ components** simplified

---

## 9. 🎨 Typography Utilities (LOW PRIORITY)

### Problem
Similar text styling patterns repeated:
- Uppercase tracking labels
- Score displays
- Section titles

### Current Code
```typescript
// Repeated typography patterns
<div className="text-xs uppercase tracking-[0.3em] text-white/50">Label</div>
<div className="text-2xl font-semibold">Title</div>
<div className="text-sm text-white/60">Description</div>
```

### Solution
**Create:** `lib/utils/typography.ts` or use Tailwind classes consistently
**Create:** `components/shared/Typography.tsx` for common text patterns

```typescript
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-xs uppercase tracking-[0.3em] text-white/50 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl font-semibold ${className}`}>
      {children}
    </h2>
  );
}
```

**Impact:** Consistent typography, **20+ components** simplified

---

## 10. 🔄 Conditional Rendering Utilities (LOW PRIORITY)

### Problem
Similar conditional rendering patterns:
- Show/hide based on state
- Loading/error/data states
- Empty state handling

### Current Code
```typescript
// Repeated conditional patterns
if (isLoading || !data) {
  return <LoadingState />;
}

if (error) {
  return <ErrorState error={error} />;
}

if (items.length === 0) {
  return <EmptyState />;
}
```

### Solution
**Create:** `lib/utils/conditional-render.ts` or `components/shared/ConditionalRender.tsx`
```typescript
interface ConditionalRenderProps {
  condition: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ConditionalRender({ condition, fallback, children }: ConditionalRenderProps) {
  if (!condition) return fallback || null;
  return <>{children}</>;
}

// Usage
<ConditionalRender condition={!isLoading && !!data} fallback={<LoadingState />}>
  <Results data={data} />
</ConditionalRender>
```

**Impact:** Cleaner conditional rendering, **10+ components** simplified

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Button Component Adoption | 10+ | ~100 | MEDIUM | 🔴 Not Started |
| Card Component Adoption | 15+ | ~75 | MEDIUM | 🔴 Not Started |
| PlayerCard Component Adoption | 3+ | ~60 | MEDIUM | 🔴 Not Started |
| Navigation Hook | 15+ | ~75 | LOW | 🔴 Not Started |
| Badge Component | 10+ | ~50 | LOW | 🔴 Not Started |
| Section Header Component | 20+ | ~100 | LOW | 🔴 Not Started |
| LinkButton Component | 15+ | ~75 | LOW | 🔴 Not Started |
| Array Transformation Utilities | 10+ | ~50 | LOW | 🔴 Not Started |
| Typography Utilities | 20+ | ~100 | LOW | 🔴 Not Started |
| Conditional Rendering Utilities | 10+ | ~50 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~735+ lines** of duplicate code removed
- **~128+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and theme updates

---

## 🚀 Recommended Implementation Order

1. **Adopt Button Component** (High impact, affects 10+ files)
2. **Adopt Card Component** (High impact, affects 15+ files)
3. **Adopt PlayerCard Component** (Medium impact, affects 3+ files)
4. **Create Navigation Hook** (Medium impact, affects 15+ files)
5. **Create Badge Component** (Quick win)
6. **Create Section Header Component** (Quick win)
7. **Create LinkButton Component** (Quick win)
8. **Create Array Utilities** (Polish)
9. **Create Typography Utilities** (Polish)
10. **Create Conditional Rendering Utilities** (Polish)

---

## ✅ Next Steps

1. Audit which components are NOT using `Button` component
2. Audit which components are NOT using `Card` component
3. Update `WaitingForPlayers.tsx` to use `PlayerCard` with `waiting` variant
4. Update `MatchmakingContent.tsx` to use `PlayerCard` with `compact` variant
5. Create `Badge` component
6. Create `SectionHeader` component
7. Create `LinkButton` component
8. Create navigation hook
9. Create array transformation utilities
10. Create typography utilities

---

*Last updated: After comprehensive codebase analysis*

