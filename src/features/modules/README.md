# Feature Modules

All feature modules in the ITT Web application.

## Core Modules

- **[games](./games/README.md)** - Game statistics and management
- **[players](./players/README.md)** - Player statistics and profiles
- **[standings](./standings/README.md)** - Leaderboards and rankings
- **[analytics](./analytics/README.md)** - Analytics and charts

## Community Modules

- **[archives](./archives/README.md)** - Archive entry management
- **[scheduled-games](./scheduled-games/README.md)** - Scheduled game management
- **[blog](./blog/README.md)** - Blog post system

## Content Modules

- **[guides](./guides/README.md)** - Game guides and static data
- **[classes](./classes/README.md)** - Class information pages
- **[meta](./meta/README.md)** - Analytics dashboard

## Tools Modules

- **[map-analyzer](./map-analyzer/README.md)** - Map visualization tools
- **[tools](./tools/README.md)** - Utility tools
- **[entries](./entries/README.md)** - Entry form system

## Module Structure Standards

All modules should follow this consistent structure:

```
module/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook tests
│   └── index.ts        # Hook exports
├── lib/                # Business logic, services, utilities
│   ├── __tests__/      # Service tests
│   └── index.ts        # Service exports
├── types/              # TypeScript type definitions
│   └── index.ts        # Type exports
├── utils/              # Pure utility functions
│   ├── __tests__/      # Utility tests
│   └── index.ts        # Utility exports
├── index.ts            # Main module exports
└── README.md           # Module documentation
```

## Future Improvements Needed

### Large Module Refactoring

**Archives Module** (54+ components): Consider splitting into sub-modules:
- `archives/forms/` - Form-related components (ArchiveForm, ArchiveEditForm, ArchiveDeleteDialog)
- `archives/display/` - Display components (ArchiveEntry, ArchiveMediaSections, etc.)
- `archives/media/` - Media components (TwitchClipEmbed, YouTubeEmbed)
- `archives/timeline/` - Timeline-specific components (HomeTimeline, ArchivesContent)

**Guides Data Files**: Large data files (5000+ lines) should be split:
- `unknown.ts` (148KB, 5047 lines)
- `allUnits.ts` (147KB, 5173 lines)
- `building.ts` (83KB, 1727 lines)

Consider lazy loading or code splitting for large data files.

## Related Documentation

- [API Reference](../../../docs/api/README.md)
- [Infrastructure](../infrastructure/README.md)
- [Shared Features](../shared/README.md)



