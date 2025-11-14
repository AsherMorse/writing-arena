# Writing Arena - UI Design System

## 🎨 Design Principles

**Visual Style**: Dark, competitive, clean  
**Color Palette**: Dark slate background with emerald/purple accents  
**Typography**: Clean, modern, legible  
**Components**: Rounded, bordered cards with subtle glass-morphism

---

## 🎨 Color System

### Background Colors:
- **Primary BG**: `bg-[#0c141d]` - Deep dark slate
- **Card BG**: `bg-[#141e27]` - Slightly lighter slate
- **Accent BG**: `bg-[#192430]` - Card variation
- **Overlay**: `bg-black/70` - Modal backgrounds

### Accent Colors:
- **Primary**: Emerald (`emerald-200`, `emerald-300`, `emerald-400`)
- **Secondary**: Purple (`purple-400`, `purple-500`, `purple-600`)
- **Success**: Green (`green-400`, `green-500`)
- **Warning**: Yellow (`yellow-300`, `yellow-400`)
- **Error**: Red (`red-400`, `red-500`)

### Text Colors:
- **Primary**: `text-white`
- **Secondary**: `text-white/70`, `text-white/60`
- **Muted**: `text-white/50`, `text-white/40`
- **Accent**: `text-emerald-200`, `text-emerald-300`

---

## 📦 Component Patterns

### Cards:
```tsx
<div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
  {/* Content */}
</div>
```

### Buttons:

**Primary (Call-to-Action):**
```tsx
<button className="rounded-xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-[#0c141d] font-semibold hover:bg-emerald-400">
  Button Text
</button>
```

**Secondary:**
```tsx
<button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 hover:bg-white/10">
  Button Text
</button>
```

**Disabled:**
```tsx
<button disabled className="rounded-xl border border-white/10 px-4 py-3 text-white/40 cursor-not-allowed">
  Button Text
</button>
```

### Badges:

**Coming Soon:**
```tsx
<span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
  Coming Soon
</span>
```

**Status:**
```tsx
<span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
  Status Text
</span>
```

### Section Headers:
```tsx
<div>
  <div className="text-xs uppercase tracking-[0.3em] text-white/50">
    Section Label
  </div>
  <h2 className="mt-2 text-2xl font-semibold">
    Section Title
  </h2>
</div>
```

### Modals:
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
  <div className="w-full max-w-4xl rounded-3xl bg-[#141e27] p-10 border border-white/10 max-h-[90vh] overflow-y-auto">
    {/* Content */}
  </div>
</div>
```

---

## 📏 Spacing System

- **Section gaps**: `space-y-8` or `gap-8`
- **Card padding**: `p-8` (large cards), `p-6` (medium), `p-4` (small)
- **Grid gaps**: `gap-4` or `gap-6`
- **Element spacing**: `space-y-3`, `space-y-4`, `space-y-6`

---

## 🔤 Typography

### Headers:
- **Page Title**: `text-4xl font-semibold`
- **Section Title**: `text-2xl font-semibold`
- **Card Title**: `text-lg font-semibold`
- **Labels**: `text-xs uppercase tracking-[0.3em] text-white/50`

### Body Text:
- **Primary**: `text-sm text-white/70`
- **Secondary**: `text-xs text-white/60`
- **Muted**: `text-xs text-white/50`

---

## 🎯 Interactive States

### Hover:
- Cards: `hover:border-emerald-300/40`
- Buttons: `hover:bg-emerald-400`, `hover:bg-white/10`
- Scale: `hover:scale-105`, `hover:scale-110`

### Active/Selected:
- Border: `border-purple-400` or `border-emerald-400`
- Background: `bg-purple-500/20` or `bg-emerald-500/20`
- Scale: `scale-105`

### Disabled:
- Opacity: `opacity-60` (section), `opacity-40` (element)
- Cursor: `cursor-not-allowed`
- Colors: `text-white/40`, `bg-gray-600`

---

## 🌊 Transitions

- **Default**: `transition-all`
- **Hover effects**: `transition hover:scale-105`
- **Color changes**: `transition-colors`
- **Transform**: `transition-transform`

---

## 📱 Responsive Design

- **Grid Breakpoints**:
  - Mobile: Single column
  - `sm:` - 2 columns
  - `md:` - 2-3 columns
  - `lg:` - 3-4 columns
  - `xl:` - 4+ columns

- **Padding Adjustments**:
  - Mobile: `px-4`, `py-6`
  - Desktop: `px-6`, `py-10`

---

## 🎮 Page-Specific Patterns

### Dashboard Pattern:
- Dark slate background (`bg-[#0c141d]`)
- Two-column layout: `grid lg:grid-cols-[1.4fr,1fr]`
- Rounded cards (`rounded-3xl`)
- Emerald accents for CTAs

### Battle/Match Pages:
- Gradient backgrounds: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`
- Purple/blue accents
- Larger text for readability
- Timer prominently displayed

### Modal Pattern:
- Dark backdrop: `bg-black/70 backdrop-blur-sm`
- Centered: `flex items-center justify-center`
- Max height: `max-h-[90vh]`
- Overflow: `overflow-y-auto`
- Gradient headers

---

## ✅ Consistency Checklist

When creating/updating pages, ensure:
- [ ] Background color matches pattern (dashboard vs battle)
- [ ] Cards use `rounded-3xl` or `rounded-2xl`
- [ ] Borders are `border-white/10` or `border-white/20`
- [ ] Text hierarchy follows typography system
- [ ] Interactive elements have proper hover states
- [ ] Disabled states are clearly marked
- [ ] Spacing is consistent (p-8, gap-6, etc.)
- [ ] Labels use uppercase tracking
- [ ] Modals follow modal pattern
- [ ] Responsive breakpoints are used

---

## 🎯 Component Organization

### By Feature:
```
components/
├── dashboard/
│   ├── MatchReadinessCard.tsx
│   ├── ObjectivesSection.tsx
│   ├── TraitCard.tsx
│   └── StatsSnapshot.tsx
├── ranked/
│   ├── MatchmakingScreen.tsx
│   ├── WritingSession.tsx
│   ├── PeerFeedbackForm.tsx
│   ├── RevisionEditor.tsx
│   └── PhaseRankings.tsx
├── shared/
│   ├── ProfileSettingsModal.tsx
│   ├── WritingTipsModal.tsx
│   ├── WaitingForPlayers.tsx
│   └── Header.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Badge.tsx
    └── Modal.tsx
```

---

## 🚀 Implementation Priority

1. **Extract shared components** (Header, Modal, Button patterns)
2. **Refactor dashboard** (already mostly clean)
3. **Refactor ranked flow** (7 pages - highest priority)
4. **Refactor quick-match** (4 pages)
5. **Refactor practice** (3 pages)
6. **Refactor auth & landing** (2 pages)

---

This design system ensures consistency across the entire Writing Arena platform.

