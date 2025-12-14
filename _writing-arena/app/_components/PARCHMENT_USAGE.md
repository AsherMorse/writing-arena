# Parchment Styling System

Centralized, extensible styling system for fantasy-themed parchment UI components.

## Quick Start

```tsx
import { ParchmentCard, ParchmentButton } from '@/app/fantasy/_components';

// Basic usage
<ParchmentCard title="My Card">
  Content here
</ParchmentCard>

// Golden button variant
<ParchmentButton variant="golden">Submit</ParchmentButton>
```

## Variants

### Available Color Variants

- **`default`** - Standard parchment beige (`#f3ce83` → `#e1bc72`)
- **`golden`** - Rich gold for buttons/CTAs (`#ffd54f` → `#d4a42a`)
- **`light`** - Lighter cream (`#f5e6c8` → `#e8d9b5`)

### Border Radius Options

- **`sm`** - `rounded-md`
- **`md`** - `rounded-lg`
- **`lg`** - `rounded-xl` (default)
- **`xl`** - `rounded-2xl`

## Components

### ParchmentCard
```tsx
<ParchmentCard 
  title="Optional Title"
  variant="default"  // 'default' | 'golden' | 'light'
  borderRadius="lg"  // 'sm' | 'md' | 'lg' | 'xl'
>
  Content
</ParchmentCard>
```

### ParchmentButton
```tsx
<ParchmentButton
  variant="golden"   // 'default' | 'golden' | 'light'
  onClick={handleClick}
  disabled={false}
  type="submit"
>
  Button Text
</ParchmentButton>
```

### WritingEditor
```tsx
<WritingEditor
  value={text}
  onChange={setText}
  variant="default"
  maxWords={150}
/>
```

### Timer
```tsx
<Timer
  seconds={420}
  onComplete={handleComplete}
  parchmentStyle={true}
  variant="default"
/>
```

### PromptCard / HintsCard
```tsx
<PromptCard prompt="Your quest..." variant="default" />
<HintsCard hints={['Tip 1', 'Tip 2']} variant="default" />
```

## Style Functions

For custom components, use the style generator functions:

```tsx
import { 
  getParchmentContainerStyle, 
  getParchmentTextStyle,
  PaperTexture 
} from './parchment-styles';

function CustomComponent() {
  return (
    <div style={getParchmentContainerStyle({ 
      variant: 'golden',
      insetTop: 3,
      insetBottom: 3,
      insetTopOpacity: 0.4,
      insetBottomOpacity: 0.4,
    })}>
      <PaperTexture borderRadius="lg" />
      <span style={getParchmentTextStyle('golden')}>
        Custom content
      </span>
    </div>
  );
}
```

## Customization Options

### getParchmentContainerStyle()

```tsx
getParchmentContainerStyle({
  variant: 'default',        // Color scheme
  insetTop: 3,              // Top inset shadow px
  insetBottom: 3,           // Bottom inset shadow px  
  insetTopOpacity: 0.4,     // Light highlight opacity
  insetBottomOpacity: 0.4,  // Dark shadow opacity
})
```

### PaperTexture Component

```tsx
<PaperTexture 
  borderRadius="lg"  // Match parent border radius
  className=""       // Additional classes
/>
```

## Scrollbar Styling

Custom scrollbar styles are defined in `globals.css` with the `.parchment-scrollbar` class:
- Transparent track
- Brown/amber thumb with rounded edges
- Automatically applied to `WritingEditor`

## Adding New Variants

To add a new color variant, edit `parchment-styles.tsx`:

```tsx
export const PARCHMENT_COLORS = {
  // ... existing variants
  yourVariant: {
    backgroundStart: '#hexcode',
    backgroundEnd: '#hexcode',
    border: '#2a1f14',
    text: '#2d2d2d',
  },
} as const;
```

Then use it: `<ParchmentCard variant="yourVariant" />`

