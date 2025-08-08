# ITT Web

A modern website built with Next.js, TypeScript, Tailwind CSS, and internationalization support.

## Technology Stack

- **Next.js 15.0.3** - React framework for production
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **i18next** - Internationalization support
- **Winston** - Logging framework

## Features

- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern styling with utility classes
- ✅ **Internationalization** - Multi-language support (currently English, expandable)
- ✅ **Logging** - Structured logging with Winston
- ✅ **ESLint** - Code quality and consistency
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark Mode Support** - Automatic theme switching

## Project Structure

```
ittweb/
├── src/
│   ├── config/          # Configuration files (logger, etc.)
│   ├── features/        # Feature-based components
│   ├── pages/          # Next.js pages
│   ├── shared/         # Shared components and utilities
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── public/
│   └── locales/        # Translation files
└── logs/              # Application logs
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


## Internationalization

The project uses i18next for internationalization. Currently supports English, but can be easily extended to support additional languages.

### Adding a New Language

1. Create a new directory in `public/locales/` (e.g., `public/locales/es/`)
2. Copy translation files from `public/locales/en/`
3. Translate the content
4. Update `next.config.ts` to include the new locale

## Logging

The application uses Winston for structured logging. Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output in development mode

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier formatting (recommended)

### Adding New Features

1. Create feature directory in `src/features/`
2. Add components in `src/shared/components/`
3. Add utilities in `src/shared/utils/`
4. Update translations in `public/locales/en/`

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