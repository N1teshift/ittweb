# Environment Setup Guide

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

# Optional: Bundle Analyzer
ANALYZE=false  # Set to 'true' to analyze bundle size
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Firestore Database** (Native mode)
4. Enable **Authentication** (Discord provider)
5. Enable **Storage** (if using file uploads)

### 2. Get Firebase Client Config

1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Add a web app or select existing
4. Copy the Firebase configuration object
5. Extract values to `.env.local` as `NEXT_PUBLIC_FIREBASE_*`

### 3. Get Firebase Admin Credentials

**Option A: Service Account Key (Development)**

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Convert JSON to string and set as `FIREBASE_SERVICE_ACCOUNT_KEY`:
   ```bash
   # On Linux/Mac
   FIREBASE_SERVICE_ACCOUNT_KEY=$(cat path/to/serviceAccountKey.json | jq -c)
   
   # Or manually copy JSON content as single-line string
   ```

**Option B: Application Default Credentials (Production)**

- Use Google Cloud Application Default Credentials
- No `FIREBASE_SERVICE_ACCOUNT_KEY` needed
- Works automatically in Firebase/Google Cloud environments

### 4. Configure Firestore Rules

Set up security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /players/{playerId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Player stats
    match /playerStats/{playerId} {
      allow read: if true;
      allow write: if false;  // Server-only writes
    }
    
    // Add other collection rules as needed
  }
}
```

### 5. Configure Storage Rules (if using)

Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Discord OAuth Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your application
4. Go to "OAuth2" section

### 2. Configure OAuth2

1. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
2. Copy **Client ID** → `DISCORD_CLIENT_ID`
3. Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
4. Enable required scopes: `identify`, `email`, `guilds`, `guilds.members.read`

### 3. Get Discord Server ID (Optional)

If using guild-specific features:
1. Enable Developer Mode in Discord
2. Right-click server → Copy Server ID
3. Use in application if needed

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

### Firebase Not Initializing

- **Check**: All `NEXT_PUBLIC_FIREBASE_*` variables are set
- **Check**: No typos in variable names
- **Check**: Firebase project exists and is active
- **Solution**: Restart dev server after changing env vars

### Authentication Not Working

- **Check**: `NEXTAUTH_SECRET` is set
- **Check**: `NEXTAUTH_URL` matches your dev URL
- **Check**: Discord redirect URI matches exactly
- **Check**: Discord client ID/secret are correct
- **Solution**: Clear browser cookies and try again

### Firestore Permission Denied

- **Check**: Firestore rules allow read/write
- **Check**: User is authenticated (for write operations)
- **Check**: Firebase Admin is initialized (for server-side)
- **Solution**: Review Firestore rules in Firebase Console

### Service Account Key Issues

- **Check**: JSON is valid and properly escaped
- **Check**: Service account has correct permissions
- **Check**: Project ID matches in key and env vars
- **Solution**: Regenerate service account key

## Production Environment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

- All `NEXT_PUBLIC_FIREBASE_*` variables
- `FIREBASE_SERVICE_ACCOUNT_KEY` (or use Application Default Credentials)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (production URL)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

### Vercel Setup

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Update `NEXTAUTH_URL` to production URL
4. Redeploy after adding variables

### Firebase Production

1. Use separate Firebase project for production (recommended)
2. Or use environment-specific Firestore databases
3. Update Firestore rules for production security
4. Enable Firebase App Check for additional security

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Infrastructure README](../src/features/infrastructure/README.md)
- [Firebase Admin Setup](../src/features/infrastructure/api/firebase/admin.ts)


