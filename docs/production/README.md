# 🚀 Production Documentation

This section contains documentation that will remain when the ITT Web project is finished. It covers your custom business logic, domain-specific functionality, and user-facing features that define what your website does.

## 📋 Contents

### API Reference
- **[API Index](./api/README.md)** - Complete API documentation
- Individual API docs: `games`, `players`, `standings`, `analytics`, `archives`, `blog`, `classes`, `scheduled-games`, `user`, `admin`, `icons`, `items`, `revalidate`

### Database
- **[Indexes](./database/indexes.md)** - Firestore index configuration (required for queries)
- **[Schemas](./database/schemas.md)** - Firestore collection schemas (single source of truth)

### Systems
- **[Game Stats](./systems/game-stats/)** - Game statistics system architecture and data models
- **[Replay Parser](./systems/replay-parser/)** - Replay file parsing integration
- **[Data Pipeline](./systems/data-pipeline/)** - Data generation scripts and guides
- **[Timestamp Management](./systems/timestamp-time-management.md)** - Firestore timestamp handling

### Product
- **[Summary](./product/summary.md)** - Feature showcase
- **[Status](./product/status.md)** - Current roadmap and phases
- **[Improvements](./product/improvements.md)** - Infrastructure and DX upgrades
- **[User Roles](./product/user-roles.md)** - Access and permissions

### Security
- **[Authentication & Authorization](./security/authentication-authorization.md)** - User auth and permissions
- **[Input Validation](./security/input-validation.md)** - Data validation patterns
- **[Web Security](./security/web-security.md)** - Web security best practices
- **[Secrets Management](./security/secrets-management.md)** - Secret handling
- **[Automated Scanning](./security/automated-scanning.md)** - Security scanning setup

## 🎯 Purpose

This documentation represents the **core value** of your ITT Web project:
- Custom API endpoints and business logic
- Domain-specific data models and schemas
- User-facing features and functionality
- Security implementations
- System integrations

When your project goes live, this is the documentation you'll want to keep and potentially share with users, maintainers, or other developers working on similar systems.
