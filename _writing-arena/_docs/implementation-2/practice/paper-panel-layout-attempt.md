# Paper Panel Layout Attempt

**Date:** December 8, 2025  
**Status:** Reverted (not shipped)

## Goal

Redesign the `/practice/paragraph` write phase to use a paper texture aesthetic similar to the fantasy home page (`app/fantasy/home/page.tsx`).

## Design Specifications

### Layout Structure (CSS Grid)

```
┌─────────────────────────┬──────────────┐
│   YOUR QUEST            │   TIMER      │
│   (prompt text)         │   (6:43)     │
└─────────────────────────┴──────────────┘
┌──────────────────────────────────────────┐
│   WRITING AREA                           │
│   (spans full width)                     │
│   textarea + word count                  │
└──────────────────────────────────────────┘
┌─────────────────────────┬──────────────┐
│   INSPIRATION           │   SUBMIT     │
│   (placeholder)         │   EARLY      │
└─────────────────────────┴──────────────┘
```

- Grid columns: `2fr 1fr` (~65% / ~35%)
- Horizontal gap: 24px
- Vertical gap: 16px
- Writing area spans both columns (`col-span-2`)

### Panel Styling

All panels use:
- Border radius: 12px (`rounded-xl`)
- Border: `3px solid #3a2010`
- Background: `linear-gradient(to bottom, #f5e6c8, #e8d4a8)`
- Paper texture overlay: `/textures/paper-1.png` (opacity 0.6, tiled 200x200px)
- Padding: 16px
- No box shadows

### Typography

- Panel headers: `font-dutch809`, uppercase, color `#2a1a0f`
- Body text: `font-memento`, color `#2a1a0f`
- Timer: Large (`text-5xl`), dark text on paper

### Custom Scrollbar (for textarea)

```css
.paper-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.paper-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.paper-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(58, 32, 16, 0.4);
  border-radius: 4px;
}
.paper-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 32, 16, 0.6);
}
```

## Components Created/Modified

### 1. PaperPanel Component (NEW)

**File:** `app/fantasy/_components/PaperPanel.tsx`

```tsx
interface PaperPanelProps {
  children: ReactNode;
  header?: string;
  className?: string;
}

function PaperTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-xl"
      style={{
        backgroundImage: 'url(/textures/paper-1.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.6,
      }}
    />
  );
}

export function PaperPanel({ children, header, className = '' }: PaperPanelProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom, #f5e6c8, #e8d4a8)',
        border: '3px solid #3a2010',
      }}
    >
      <PaperTexture />
      <div className="relative p-4">
        {header && (
          <div
            className="font-dutch809 text-sm uppercase tracking-wider mb-3"
            style={{ color: '#2a1a0f' }}
          >
            {header}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

### 2. Timer Component (MODIFIED)

Added `variant?: 'default' | 'paper'` prop:
- Default: Light text on dark background
- Paper: Dark text (`#2a1a0f`) on light paper background

### 3. WritingEditor Component (MODIFIED)

Added `variant?: 'default' | 'paper'` prop:
- Paper variant renders the editor inside a paper-styled container
- Custom scrollbar styling
- Word count inside panel at bottom

### 4. FantasyButton Component (MODIFIED)

Added `variant: 'paper'` option:
- Paper gradient background
- Dark border (`3px solid #3a2010`)
- Dark text color
- Paper texture overlay
- No shadows, flat style

## Issues Encountered

1. **Submit button looked odd** - The old FantasyButton (dark style) sitting on top of a paper panel created visual clash. Solution was to add a `paper` variant to FantasyButton.

2. **Design may need more iteration** - The overall look wasn't quite right with the existing component library. May need a more holistic approach to the paper aesthetic.

## Reference Files

- Paper texture used: `/textures/paper-1.png`
- Fantasy home page with similar paper aesthetic: `components/fantasy/FantasyHomeContent.tsx`
- Background image: `/images/backgrounds/bg.webp`

## Future Considerations

- Consider creating a dedicated `PaperTheme` context or set of components
- May need to rethink the color contrast for accessibility (dark text on paper)
- Inspiration panel was left as placeholder ("Coming soon...")
- The Hints panel (same location as "Things to Fix") was deferred
