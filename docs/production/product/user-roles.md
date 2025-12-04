# User Roles Guide

## Overview

The `role` attribute controls how the website functions for different users. This allows you to customize features, permissions, and UI based on user roles.

## Available Roles

- **`user`** (default) - Standard user with basic access
- **`premium`** - Premium users with enhanced features
- **`moderator`** - Users with moderation capabilities
- **`admin`** - Administrative users with full access
- **`developer`** - Developers with highest privileges

## How to Manually Add Role to Your User

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Open the `userData` collection
5. Find your user document (document ID = your Discord ID)
6. Click on the document to edit it
7. Click **Add field**
8. Set:
   - **Field name**: `role`
   - **Field type**: `string`
   - **Field value**: `admin` (or `developer`, `moderator`, `premium`, `user`)
9. Click **Update**

### Option 2: Using Firebase CLI

```bash
firebase firestore:set userData/YOUR_DISCORD_ID role admin
```

Replace `YOUR_DISCORD_ID` with your actual Discord ID (e.g., `257312315265908746`).

## Using Roles in Code

### Import the utilities

```typescript
import { hasRole, isAdmin, isDeveloper, isModerator, isPremium } from '@/features/infrastructure/utils/user/userRoleUtils';
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';
```

### Example: Check user role in a component

```typescript
import { useSession } from 'next-auth/react';
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';
import { isAdmin } from '@/features/infrastructure/utils/user/userRoleUtils';
import { useEffect, useState } from 'react';

function MyComponent() {
  const { data: session } = useSession();
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (session?.discordId) {
        const userData = await getUserDataByDiscordId(session.discordId);
        setIsUserAdmin(isAdmin(userData?.role));
      }
    }
    checkRole();
  }, [session]);

  return (
    <div>
      {isUserAdmin && (
        <button>Admin Only Button</button>
      )}
    </div>
  );
}
```

### Example: Protect API routes

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getUserDataByDiscordIdServer } from '@/features/infrastructure/lib/userDataService.server';
import { isAdmin } from '@/features/infrastructure/utils/user/userRoleUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.discordId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userData = await getUserDataByDiscordId(session.discordId);
  
  if (!isAdmin(userData?.role)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // Admin-only logic here
  return res.status(200).json({ message: 'Success' });
}
```

### Example: Conditional rendering based on role

```typescript
import { hasRole } from '@/features/infrastructure/utils/user/userRoleUtils';

function FeatureComponent({ userRole }: { userRole?: string }) {
  return (
    <div>
      {hasRole(userRole as any, 'premium') && (
        <PremiumFeature />
      )}
      {hasRole(userRole as any, 'admin') && (
        <AdminPanel />
      )}
    </div>
  );
}
```

## Role Hierarchy

Roles follow a hierarchy where higher roles inherit permissions from lower roles:

```
developer (highest)
  ↓
admin
  ↓
moderator
  ↓
premium
  ↓
user (lowest)
```

For example, if you check `hasRole(userRole, 'moderator')`, it will return `true` for:
- `moderator`
- `admin`
- `developer`

But `false` for:
- `premium`
- `user`

## Utility Functions

- `hasRole(userRole, requiredRole)` - Check if user has a specific role or higher
- `isAdmin(userRole)` - Check if user is admin or developer
- `isDeveloper(userRole)` - Check if user is developer
- `isModerator(userRole)` - Check if user is moderator, admin, or developer
- `isPremium(userRole)` - Check if user has premium access or higher

## Default Behavior

- New users are created with `role: undefined` (treated as `'user'`)
- The `removeUndefined()` function ensures undefined roles are not saved to Firestore
- When checking roles, `undefined` is treated as `'user'` (the default role)





