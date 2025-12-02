# Firebase Setup

Complete guide for setting up Firebase in the development environment.

## Prerequisites

- **Firebase account** with a project created

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Firestore Database** (Native mode)
4. Enable **Authentication** (Discord provider)
5. Enable **Storage** (if using file uploads)

## Get Firebase Client Config

1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Add a web app or select existing
4. Copy the Firebase configuration object
5. Extract values to `.env.local` as `NEXT_PUBLIC_FIREBASE_*`:

```bash
# Firebase Client Configuration (Public - exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id  # Optional
```

## Get Firebase Admin Credentials

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

## Configure Firestore Rules

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

## Configure Storage Rules (if using)

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

## Verify Firebase Connection

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Check browser console for Firebase errors
```

## Common Issues

### Firebase Not Initializing

- **Check**: All `NEXT_PUBLIC_FIREBASE_*` variables are set
- **Check**: No typos in variable names
- **Check**: Firebase project exists and is active
- **Solution**: Restart dev server after changing env vars

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

### Firebase Production

1. Use separate Firebase project for production (recommended)
2. Or use environment-specific Firestore databases
3. Update Firestore rules for production security
4. Enable Firebase App Check for additional security

## Related Documentation

- [Environment Setup](./setup.md)
- [Infrastructure README](../../src/features/infrastructure/README.md)
- [Firebase Admin Setup](../../src/features/infrastructure/api/firebase/admin.ts)

