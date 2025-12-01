# Deployment Guide

Complete guide for deploying ITT Web to production.

## Overview

ITT Web is deployed to **Vercel** (recommended) with automated CI/CD via GitHub Actions. The deployment process includes automated testing, building, and verification.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **Environment Variables**: All required environment variables configured
4. **Firebase Project**: Production Firebase project set up

## Deployment Environments

### Staging

- **Trigger**: Automatic on push to `staging` branch
- **URL**: `https://ittweb-git-staging-*.vercel.app` (Vercel auto-generated) or custom staging domain
- **Purpose**: Pre-production testing in production-like environment
- **Note**: Not connected to production custom domain
- **Setup**: See [Staging Setup Guide](./staging-setup.md) for detailed instructions

### Production

- **Trigger**: Automatic on push to `main` branch
- **URL**: Your custom domain (e.g., `https://yourdomain.com`)
- **Purpose**: Live production environment
- **Note**: Connected to your custom domain

## Initial Setup

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

**Firebase Client (Public)**:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)
```

**Firebase Admin (Server-side)**:
```
FIREBASE_SERVICE_ACCOUNT_KEY
```

**NextAuth**:
```
NEXTAUTH_URL (production URL)
NEXTAUTH_SECRET
```

**Discord OAuth**:
```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
```

**Note**: Set variables for Production, Preview, and Development environments as needed.

### 3. Configure GitHub Secrets

For automated deployment via GitHub Actions, add these secrets:

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
   - `VERCEL_ORG_ID`: Get from Vercel → Settings → General
   - `VERCEL_PROJECT_ID`: Get from Vercel → Project Settings → General

### 4. Update Discord OAuth Redirect URI

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Add production redirect URI: `https://your-domain.com/api/auth/callback/discord`
3. Add staging redirect URI if using separate staging environment

## Deployment Process

### Recommended Workflow

1. **Develop locally**: Test with `npm run dev`
2. **Push to staging**: Push to `staging` branch → Auto-deploys to staging URL
3. **Test staging**: Verify everything works in staging environment
4. **Deploy to production**: Merge `staging` → `main` → Auto-deploys to production

**See [Staging Setup Guide](./staging-setup.md) for complete setup instructions.**

### Automated Deployment

Deployment is automated via Vercel:

1. **Push to `staging` branch**: Automatically deploys to staging environment
2. **Push to `main` branch**: Automatically deploys to production environment
3. **Push to any other branch**: Creates preview deployment (for testing)

**Note**: Vercel automatically detects pushes and deploys accordingly. No GitHub Actions workflow required for basic deployments.

### Manual Deployment

1. **Via Vercel Dashboard**:
   - Go to Vercel Dashboard → Your Project
   - Click "Deployments" tab
   - Click "Redeploy" on latest deployment

2. **Via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

## Deployment Verification

After deployment, verify:

1. **Health Check**: Visit `https://your-domain.com/api/health`
   - Should return `200 OK` with `"status": "ok"`

2. **Application**: Visit main application URL
   - Should load without errors
   - Check browser console for errors

3. **Authentication**: Test login flow
   - Should redirect to Discord OAuth
   - Should redirect back after authentication

4. **Database**: Test database operations
   - Create a test game/entry
   - Verify data appears in Firebase Console

5. **API Routes**: Test critical API endpoints
   - `/api/games`
   - `/api/players`
   - `/api/entries`

## Rollback Procedures

### Via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the previous working deployment
3. Click "..." menu → "Promote to Production"

### Via Vercel CLI

```bash
vercel rollback [deployment-url]
```

### Via GitHub Actions

1. Revert the problematic commit
2. Push to `main` branch
3. Deployment will automatically trigger with reverted code

## Environment-Specific Configuration

### Staging Environment

- Use separate Firebase project (recommended) or same project with different database
- Use staging Discord OAuth application
- Set `NEXTAUTH_URL` to staging URL

### Production Environment

- Use production Firebase project
- Use production Discord OAuth application
- Set `NEXTAUTH_URL` to production URL
- Enable Firebase App Check for additional security

## Build Configuration

Build settings are configured in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Build Process**:
1. Install dependencies: `npm ci`
2. Validate environment variables: `npm run validate-env`
3. Build application: `npm run build`
4. Deploy to Vercel

## Monitoring Deployment

### Deployment Status

- **Vercel Dashboard**: View deployment status, logs, and metrics
- **GitHub Actions**: View workflow runs and logs

### Post-Deployment Monitoring

1. **Error Tracking**: Check Sentry (if configured) for errors
2. **Performance**: Monitor Core Web Vitals in Firebase Performance
3. **Health Checks**: Monitor `/api/health` endpoint
4. **User Reports**: Monitor user feedback and bug reports

## Troubleshooting

### Build Failures

**Issue**: Build fails with environment variable errors
- **Solution**: Verify all required environment variables are set in Vercel
- **Check**: Run `npm run validate-env` locally

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run type-check` locally and fix errors
- **Check**: Ensure all types are correct

**Issue**: Build fails with linting errors
- **Solution**: Run `npm run lint` locally and fix errors
- **Check**: Ensure code follows linting rules

### Deployment Failures

**Issue**: Deployment succeeds but application doesn't work
- **Solution**: Check Vercel deployment logs
- **Check**: Verify environment variables are correct
- **Check**: Verify Firebase connection

**Issue**: Authentication not working
- **Solution**: Verify `NEXTAUTH_URL` matches deployment URL exactly
- **Check**: Verify Discord redirect URI matches
- **Check**: Verify `NEXTAUTH_SECRET` is set

**Issue**: Database connection fails
- **Solution**: Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is correct
- **Check**: Verify Firebase project ID matches
- **Check**: Verify Firestore security rules allow operations

### Performance Issues

**Issue**: Slow page loads
- **Solution**: Check bundle size with `ANALYZE=true npm run build`
- **Check**: Review Core Web Vitals in Firebase Performance
- **Check**: Optimize images and assets

## Best Practices

1. **Always test in staging** before deploying to production
2. **Monitor deployments** for errors and performance issues
3. **Keep environment variables** synchronized between environments
4. **Use separate Firebase projects** for staging and production
5. **Enable Firebase App Check** in production for security
6. **Set up alerts** for deployment failures and errors
7. **Document any manual steps** required for deployment
8. **Review deployment logs** after each deployment

## Related Documentation

- [Staging Setup Guide](./staging-setup.md) - Complete guide for setting up staging environment
- [Environment Setup](../getting-started/setup.md) - Environment variable configuration
- [CI/CD Guide](./ci-cd.md) - CI/CD pipeline documentation
- [Monitoring Guide](./monitoring.md) - Monitoring and observability
- [Architecture](../development/architecture.md) - System architecture

