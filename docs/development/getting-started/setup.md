# Environment Setup Guide

> Date: 2025-12-02

Complete guide for setting up the development environment.

## Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **npm** or **yarn** package manager
- **Firebase account** with a project created
- **Discord application** (for authentication)

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ittweb
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

**Note**: Environment variable validation runs automatically during build. The `scripts/validate-env.js` script checks all required environment variables and provides clear error messages if any are missing.

Create a `.env.local` file in the project root:

```bash
# Firebase Client Configuration (Public - exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id  # Optional

# Firebase Admin (Server-side only - keep secret!)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # JSON string
# OR use Application Default Credentials in production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # Development URL
NEXTAUTH_SECRET=your-secret-key  # Generate with: openssl rand -base64 32

# Discord OAuth (for authentication)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Discord Bot API (for bot join/leave operations)
BOT_API_KEY=your-secure-bot-api-key  # Generate with: openssl rand -base64 32

# Optional: Bundle Analyzer
ANALYZE=false  # Set to 'true' to analyze bundle size
```

## Firebase Setup

See [Firebase Setup Guide](./firebase-setup.md) for complete Firebase configuration:
- Creating Firebase project
- Getting client config and admin credentials
- Configuring Firestore and Storage rules
- Troubleshooting common issues

## Discord OAuth Setup

See [Discord OAuth Setup Guide](./discord-setup.md) for complete Discord authentication setup:
- Creating Discord application
- Configuring OAuth2
- Setting up redirect URIs
- Troubleshooting authentication issues

## NextAuth Secret

Generate a secure secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Set as `NEXTAUTH_SECRET` in `.env.local`.

## Verify Setup

### 1. Check Environment Variables

```bash
# Verify Firebase config is loaded
npm run dev
# Check console for Firebase initialization errors

# Or test in Node.js
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)"
```

### 2. Test Firebase Connection

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Check browser console for Firebase errors
```

### 3. Test Authentication

1. Visit `http://localhost:3000`
2. Click login/sign in
3. Should redirect to Discord OAuth
4. After authorization, should redirect back

## Common Setup Issues

See individual setup guides for troubleshooting:
- [Firebase Setup](./firebase-setup.md#common-issues)
- [Discord Setup](./discord-setup.md#common-issues)

## CI/CD Environment Variables

See [CI/CD Setup Guide](./cicd-setup.md) for complete CI/CD configuration:
- GitHub Actions setup
- Production environment variables
- Vercel configuration

## Related Documentation

- [Development Guide](./development-guide.md)
- [Infrastructure README](../src/features/infrastructure/README.md)
- [Firebase Admin Setup](../src/features/infrastructure/api/firebase/admin.ts)


