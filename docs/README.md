# Documentation Index

Quick navigation to ITT Web documentation.

## Getting Started

- **[Environment Setup](./getting-started/setup.md)** - Firebase, Discord OAuth, and local development setup
- **[Quick Start Testing](./operations/quick-start-testing.md)** - Launch dev server, seed data, test flows
- **[Troubleshooting](./getting-started/troubleshooting.md)** - Common issues and solutions

## Development

- **[Development Guide](./development/development-guide.md)** - How to add features, API routes, follow conventions
- **[Architecture](./development/architecture.md)** - System architecture and design patterns
- **[Code Patterns](./development/code-patterns.md)** - Common code patterns and recipes
- **[Component Library](./development/components.md)** - Shared UI components
- **[API Client Usage](./development/api-client.md)** - Using APIs from client-side code
- **[Contributing](./development/contributing.md)** - Development standards and contribution process

## Database

- **[Indexes](./database/indexes.md)** - Firestore index configuration (required for queries)
- **[Schemas](./database/schemas.md)** - Firestore collection schemas (single source of truth)

## API Reference

- **[API Index](./api/README.md)** - Complete API documentation
- Individual API docs: `games`, `players`, `standings`, `analytics`, `archives`, `blog`, etc.

## Operations

- **[Testing Guide](./operations/testing-guide.md)** - Testing scenarios and API calls
- **[Test Plans](./operations/test-plans/)** - Comprehensive test plans by feature
- **[Deployment](./operations/deployment.md)** - Deployment procedures
- **[CI/CD](./operations/ci-cd.md)** - Continuous integration setup

## Systems

- **[Game Stats](./systems/game-stats/implementation-plan.md)** - Game statistics system architecture
- **[Replay Parser](./systems/replay-parser/)** - Replay file parsing integration
- **[Data Pipeline](./systems/data-pipeline/)** - Data generation scripts and guides
- **[Timestamp Management](./systems/timestamp-time-management.md)** - Firestore timestamp handling

## Product

- **[Summary](./product/summary.md)** - Feature showcase
- **[Status](./product/status.md)** - Current roadmap and phases
- **[Improvements](./product/improvements.md)** - Infrastructure and DX upgrades
- **[User Roles](./product/user-roles.md)** - Access and permissions

## Module Documentation

All 13 feature modules have README files in `src/features/modules/[module-name]/README.md`:
- `games`, `players`, `standings`, `analytics`, `archives`, `scheduled-games`, `blog`, `guides`, `classes`, `meta`, `map-analyzer`, `tools`, `entries`

## Reference

- **[Error Handling](./ERROR_HANDLING.md)** - Complete error handling guide and patterns
- **[Known Issues](./KNOWN_ISSUES.md)** - Technical debt and known issues
- **[Performance](./PERFORMANCE.md)** - Performance optimization strategies
- **[Security](./SECURITY.md)** - Security best practices
- **[Documentation Style](./DOCUMENTATION_STYLE.md)** - Documentation standards

## External

- **[Scripts](../scripts/README.md)** - Data generation and utility scripts
- **[Infrastructure](../src/features/infrastructure/README.md)** - Core systems (auth, Firebase, logging)

---

**Archive**: Historical and outdated documentation is in [`archive/`](./archive/).
