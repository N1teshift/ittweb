# Component Library Guide

Shared UI components and their usage.

## Button

Standard button component with multiple variants and sizes.

### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'amber' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'a';  // Render as button or link
  // ... standard HTML button/anchor attributes
}
```

### Variants

- `primary` - Blue button for primary actions
- `secondary` - Gray button for secondary actions
- `ghost` - Transparent button with hover effect
- `amber` - Amber-themed button (default, matches site theme)
- `success` - Green button for success actions
- `danger` - Red button for destructive actions

### Sizes

- `sm` - Small (h-8, px-3, text-xs)
- `md` - Medium (h-9, px-4, text-sm) - **default**
- `lg` - Large (h-10, px-8, text-base)

### Usage

```typescript
import { Button } from '@/features/infrastructure/shared/components/ui';

// Basic button
<Button onClick={handleClick}>Click me</Button>

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Cancel</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// As link
<Button as="a" href="/games">View Games</Button>

// Disabled
<Button disabled>Cannot Click</Button>
```

## Card

Container component for grouping content.

### Props

```typescript
interface CardProps {
  variant?: 'default' | 'glass' | 'medieval';
  // ... standard HTML div attributes
}
```

### Variants

- `default` - White background with border
- `glass` - Glassmorphism effect (semi-transparent with blur)
- `medieval` - Dark theme with amber border (matches site theme)

### Usage

```typescript
import { Card } from '@/features/infrastructure/shared/components/ui';

// Basic card
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>

// Variants
<Card variant="glass">Glass effect</Card>
<Card variant="medieval">Medieval theme</Card>

// With padding
<Card className="p-6">
  <p>Padded content</p>
</Card>
```

## Input

Form input component with label and error support.

### Props

```typescript
interface InputProps {
  label?: string;
  error?: string;
  // ... standard HTML input attributes
}
```

### Usage

```typescript
import { Input, NumberInput, SelectInput } from '@/features/infrastructure/shared/components/ui';

// Text input
<Input
  label="Player Name"
  name="playerName"
  value={value}
  onChange={handleChange}
  placeholder="Enter name"
/>

// With error
<Input
  label="Email"
  name="email"
  error="Invalid email address"
/>

// Number input
<NumberInput
  label="Age"
  name="age"
  min={0}
  max={100}
/>

// Select dropdown
<SelectInput
  label="Category"
  name="category"
  options={[
    { value: 'ranked', label: 'Ranked' },
    { value: 'casual', label: 'Casual' }
  ]}
/>
```

## LoadingOverlay

Overlay component for background operations.

### Props

```typescript
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;  // Default: "Loading..."
}
```

### Usage

```typescript
import LoadingOverlay from '@/features/infrastructure/shared/components/ui/LoadingOverlay';

<LoadingOverlay isVisible={isSubmitting} message="Saving game..." />
```

## LoadingScreen

Full-screen loading component for page loads.

### Props

```typescript
interface LoadingScreenProps {
  message?: string;  // Default: "Loading..."
}
```

### Usage

```typescript
import LoadingScreen from '@/features/infrastructure/shared/components/ui/LoadingScreen';

if (loading) {
  return <LoadingScreen message="Loading games..." />;
}
```

## Component Patterns

### Form with Validation

```typescript
import { Input, Button, Card } from '@/features/infrastructure/shared/components/ui';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation and submission
  };

  return (
    <Card variant="medieval" className="p-6">
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <div className="mt-4 flex gap-2">
          <Button type="submit" variant="primary">Submit</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
```

### Loading States

```typescript
import LoadingScreen from '@/features/infrastructure/shared/components/ui/LoadingScreen';
import LoadingOverlay from '@/features/infrastructure/shared/components/ui/LoadingOverlay';

function MyComponent() {
  const { data, loading } = useMyData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <LoadingScreen message="Loading data..." />;
  }

  return (
    <>
      <LoadingOverlay isVisible={isSubmitting} message="Saving..." />
      {/* Component content */}
    </>
  );
}
```

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Infrastructure README](../src/features/infrastructure/README.md)

