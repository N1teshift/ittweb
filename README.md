# ITT Web

A modern website for Island Troll Tribes game statistics, guides, and community features.

## Technology Stack

- **Next.js 15.0.3** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase/Firestore** - Database
- **NextAuth** - Authentication
- **i18next** - Internationalization
- **Recharts** - Data visualization

## Core Features

### Game Statistics
- ✅ Game tracking and management
- ✅ ELO rating system
- ✅ Player statistics and profiles
- ✅ Leaderboards and standings
- ✅ Player comparison tools
- ✅ Analytics dashboard

### Community Features
- ✅ Scheduled games with timezone support
- ✅ Archive entries (replays, clips)
- ✅ Blog posts with MDX support
- ✅ Game guides and class information

### Tools
- ✅ Map analyzer (Warcraft 3 map visualization)
- ✅ Icon mapper utilities
- ✅ Replay parser integration

## Project Structure

```
ittweb/
├── src/
│   ├── features/
│   │   ├── modules/    # Feature modules (games, players, archives, etc.)
│   │   ├── infrastructure/  # Core systems (auth, Firebase, logging)
│   │   └── shared/     # Shared components and utilities
│   ├── pages/          # Next.js pages and API routes
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── docs/               # Documentation
│   ├── api/           # API reference
│   ├── operations/    # Testing and operations guides
│   ├── product/       # Product documentation
│   ├── schemas/       # Firestore schemas
│   └── systems/       # System implementation docs
├── scripts/           # Data pipeline scripts
└── config/            # Configuration files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ittweb
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage
- `npm run type-check` - TypeScript type checking
- `npm run build:check` - Type check + build
- `npm run replay-meta:build` - Build the replay metadata CLI
- `npm run replay-meta:decode -- <path>` - Decode a `.w3g` replay (after build)


## Internationalization

The project uses i18next for internationalization. Currently supports English, but can be easily extended to support additional languages.

### Adding a New Language

1. Create a new directory in `public/locales/` (e.g., `public/locales/es/`)
2. Copy translation files from `public/locales/en/`
3. Translate the content
4. Update `next.config.ts` to include the new locale

## Logging

The application uses a lightweight console-based logging system with:
- Environment-aware logging levels
- Error categorization (VALIDATION, NETWORK, DATABASE, etc.)
- Component-specific logging
- Console output in development mode

## Documentation

- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[API Reference](docs/api/README.md)** - All API endpoints
- **[Module Documentation](src/features/modules/)** - Feature module READMEs
- **[Firestore Schemas](docs/schemas/firestore-collections.md)** - Database schema reference
- **[Testing Guide](docs/operations/testing-guide.md)** - Testing documentation

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Files should be under 200 lines when possible
- Error handling uses `loggerUtils` system

### Adding New Features

1. Create module in `src/features/modules/[module]/`
2. Add README.md in module directory
3. Create API routes in `src/pages/api/[module]/`
4. Update documentation as needed

### Module Structure

Each module should have:
- `README.md` - Module documentation
- `components/` - React components
- `lib/` - Service layer
- `hooks/` - Custom hooks
- `types/` - TypeScript types

## Deployment

The project can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Self-hosted**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.