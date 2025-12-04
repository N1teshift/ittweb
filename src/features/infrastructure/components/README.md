# Components

> Date: 2025-12-03

This directory contains reusable React components organized by functional category. Components are grouped into subfolders based on their purpose, making it easier to find and maintain related components.

## Structure

```
components/
├── README.md
├── index.ts                    # Main export file - re-exports all components
├── layout/                     # Layout and page structure components
│   ├── index.ts
│   ├── Layout.tsx              # Main layout wrapper with header/footer
│   ├── Header.tsx              # Top navigation bar
│   └── PageHero.tsx            # Page title and description hero section
├── navigation/                 # Navigation-related components
│   ├── index.ts
│   ├── MobileMenu.tsx          # Mobile navigation menu
│   └── DropdownMenu.tsx        # Dropdown navigation menu
├── buttons/                    # Button components
│   ├── index.ts
│   ├── Button.tsx              # Base button component
│   ├── GitHubButton.tsx        # GitHub link button
│   └── DiscordButton.tsx       # Discord link button
├── containers/                 # Container components
│   ├── index.ts
│   └── Card.tsx                # Card container component
├── loading/                    # Loading state components
│   ├── index.ts
│   ├── LoadingScreen.tsx       # Full-screen loading component
│   └── LoadingOverlay.tsx      # Overlay loading component
├── feedback/                   # User feedback components
│   ├── index.ts
│   ├── EmptyState.tsx          # Empty state display
│   └── Tooltip.tsx             # Tooltip component
├── error/                      # Error handling components
│   ├── index.ts
│   └── ErrorBoundary.tsx       # React error boundary component
```

## Usage

All components are exported from the main `index.ts` file, so you can import them like this:

```typescript
// Import from main index (recommended)
import { 
  Layout, 
  Header, 
  PageHero, 
  Button,
  Card,
  LoadingScreen,
  ErrorBoundary 
} from '@/features/infrastructure/components';

// Or import from specific subfolder
import { Layout, Header } from '@/features/infrastructure/components/layout';
import { Button, GitHubButton } from '@/features/infrastructure/components/buttons';
import { Card } from '@/features/infrastructure/components/containers';
import { ErrorBoundary } from '@/features/infrastructure/components/error';
```

## Component Categories

### Layout Components (`layout/`)

Components that define the overall page structure and layout:

- **Layout**: Main wrapper component that provides the page structure with header, footer, and translation context
- **Header**: Top navigation bar with menu items, authentication, and mobile menu
- **PageHero**: Hero section for page titles and descriptions

### Navigation Components (`navigation/`)

Components for navigation menus and dropdowns:

- **MobileMenu**: Collapsible navigation menu for mobile devices
- **DropdownMenu**: Dropdown menu component with keyboard navigation support

### Button Components (`buttons/`)

All button-related components:

- **Button**: Base button component with variants (primary, secondary, ghost, amber, success, danger)
- **GitHubButton**: Button linking to GitHub repositories
- **DiscordButton**: Button linking to Discord server

### Container Components (`containers/`)

Container and wrapper components:

- **Card**: Card container component with variants (default, glass, medieval)

### Loading Components (`loading/`)

Components for displaying loading states:

- **LoadingScreen**: Full-screen loading component for initial page loads
- **LoadingOverlay**: Overlay component for background processes

### Feedback Components (`feedback/`)

User feedback and interaction components:

- **EmptyState**: Component for displaying empty states with optional actions
- **Tooltip**: Tooltip component for displaying help text

### Error Components (`error/`)

Error handling components:

- **ErrorBoundary**: React error boundary that catches component errors and displays a fallback UI

## Best Practices

1. **Import from main index**: Always import from `@/features/infrastructure/components` rather than individual files for consistency
2. **Use appropriate components**: Choose components from the correct category for your use case
3. **Follow naming conventions**: New components should follow the existing naming patterns
4. **Update exports**: When adding new components, ensure they are exported from both the subfolder `index.ts` and the main `index.ts`

## Adding New Components

When adding a new component:

1. Determine the appropriate category (layout, navigation, buttons, containers, loading, feedback, or error)
2. Create the component file in the appropriate subfolder
3. Export it from the subfolder's `index.ts`
4. Re-export it from the main `components/index.ts`
5. Update this README if adding a new category

## Notes

- All components are organized at the same level in the `components/` folder
- Import paths using `@/features/infrastructure/components` provide a clean, consistent API
- Components are grouped by functional category for easy discovery and maintenance
