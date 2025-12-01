# Staging Environment Setup Guide

Complete guide for setting up a staging environment that allows you to test changes in a production-like environment before deploying to your live site.

## Overview

This setup creates a **staging environment** that:
- Deploys automatically when you push to a `staging` branch
- Uses a separate Vercel URL (not connected to your custom domain)
- Allows you to test changes in a production-like environment
- Prevents accidental changes to your live production site

## Architecture

```
Local Development (npm run dev)
    ↓
Push to `staging` branch
    ↓
Staging Deployment (staging.ittweb.vercel.app)
    ↓
Test & Verify
    ↓
Merge to `main` branch
    ↓
Production Deployment (your-custom-domain.com)
```

## Step-by-Step Setup

### 1. Create a Staging Branch

First, create and push a staging branch:

```bash
# Create and switch to staging branch
git checkout -b staging

# Push staging branch to GitHub
git push -u origin staging
```

### 2. Configure Vercel Branch Deployments

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Git**
4. Under **Production Branch**, ensure `main` is selected (this is your production branch)
5. Under **Ignored Build Step**, leave it empty (or configure if needed)

### 3. Configure Environment Variables for Staging

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. For each environment variable, you can set it for different environments:
   - **Production**: Only applies to `main` branch
   - **Preview**: Applies to all branches except `main` (this includes `staging`)
   - **Development**: Only for local development

**Recommended Setup:**
- Set all your environment variables for **Production** (for `main` branch)
- Set all your environment variables for **Preview** (for `staging` branch)
- Optionally use a separate Firebase project for staging by setting different Firebase variables for Preview

**Important Variables for Staging:**
- `NEXTAUTH_URL`: Set to your staging URL (e.g., `https://ittweb-staging.vercel.app`)
- All Firebase variables: Can use same project or separate staging project
- Discord OAuth: Add staging redirect URI (see step 4)

### 4. Update Discord OAuth Redirect URIs

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **Redirects**
4. Add your staging redirect URI:
   - `https://ittweb-staging.vercel.app/api/auth/callback/discord`
   - (Replace with your actual staging URL)

### 5. Verify Staging Deployment

After pushing to `staging` branch:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. You should see a new deployment from the `staging` branch
3. The deployment will have a URL like: `https://ittweb-git-staging-yourusername.vercel.app`
4. Click on the deployment to view details and get the URL

### 6. (Optional) Assign a Custom Staging Domain

If you want a cleaner staging URL:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter a subdomain like `staging.yourdomain.com` (if you own the domain)
4. Or use Vercel's default: `ittweb-staging.vercel.app` (if available)

**Note**: The staging deployment will NOT be connected to your production custom domain, keeping them completely separate.

## Workflow

### Daily Development Workflow

1. **Develop locally:**
   ```bash
   npm run dev
   # Test your changes locally
   ```

2. **Push to staging:**
   ```bash
   git checkout staging
   git merge main  # or cherry-pick specific commits
   git push origin staging
   ```

3. **Test on staging:**
   - Wait for Vercel to deploy (usually 1-2 minutes)
   - Visit your staging URL
   - Test all functionality thoroughly
   - Check browser console for errors
   - Test authentication, database operations, etc.

4. **Deploy to production:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

### Alternative: Feature Branch Workflow

You can also use feature branches that automatically create preview deployments:

1. **Create feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Push feature branch:**
   ```bash
   git push -u origin feature/my-feature
   ```

3. **Vercel automatically creates a preview deployment** for each branch
4. **Test the preview deployment**
5. **Merge to staging** for final testing
6. **Merge to main** for production

## Environment Differences

### Staging Environment
- **URL**: `https://ittweb-staging.vercel.app` (or similar)
- **Branch**: `staging`
- **Purpose**: Pre-production testing
- **Database**: Can use separate Firebase project or same project
- **OAuth**: Separate redirect URI configured

### Production Environment
- **URL**: Your custom domain (e.g., `https://yourdomain.com`)
- **Branch**: `main`
- **Purpose**: Live production site
- **Database**: Production Firebase project
- **OAuth**: Production redirect URI

## Troubleshooting

### Staging deployment not triggering

**Issue**: Pushing to `staging` doesn't create a deployment

**Solutions**:
- Verify the branch exists on GitHub
- Check Vercel project settings → Git → ensure repository is connected
- Check Vercel deployment logs for errors

### Environment variables not working in staging

**Issue**: Staging deployment fails or behaves differently

**Solutions**:
- Verify environment variables are set for **Preview** environment in Vercel
- Check that `NEXTAUTH_URL` matches your staging URL exactly
- Ensure Discord redirect URI includes staging URL
- Redeploy after changing environment variables

### Authentication not working in staging

**Issue**: Discord OAuth fails on staging

**Solutions**:
- Verify Discord redirect URI includes staging URL
- Check `NEXTAUTH_URL` environment variable matches staging URL
- Ensure `NEXTAUTH_SECRET` is set for Preview environment

## Best Practices

1. **Always test in staging** before merging to `main`
2. **Keep staging branch up to date** with `main` regularly
3. **Use descriptive commit messages** to track what's being tested
4. **Monitor staging deployments** for errors
5. **Use separate Firebase project** for staging if possible (prevents test data in production)
6. **Document any staging-specific configurations**

## Quick Reference

### Common Commands

**Using the helper script (recommended):**

```bash
# Push current branch to staging
npm run staging:push

# Deploy staging to production
npm run staging:deploy

# Check current status
npm run staging:status
```

**Manual Git commands:**

```bash
# Switch to staging branch
git checkout staging

# Update staging from main
git checkout staging
git merge main
git push origin staging

# Deploy tested changes to production
git checkout main
git merge staging
git push origin main

# Create feature branch for preview testing
git checkout -b feature/my-feature
git push -u origin feature/my-feature
```

### Vercel Dashboard Locations

- **Deployments**: View all deployments (staging and production)
- **Settings → Git**: Configure branch settings
- **Settings → Environment Variables**: Set environment-specific variables
- **Settings → Domains**: Manage custom domains

## Related Documentation

- [Deployment Guide](./deployment.md) - General deployment information
- [Environment Setup](../getting-started/setup.md) - Environment variable configuration
- [CI/CD Guide](./ci-cd.md) - CI/CD pipeline documentation

