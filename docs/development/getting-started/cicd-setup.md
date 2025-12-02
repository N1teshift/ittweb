# CI/CD Environment Variables

Configuration for CI/CD pipelines and production deployments.

## GitHub Actions (CI)

**Good News**: CI builds automatically skip environment variable validation! The `validate-env.js` script detects when running in CI (`CI=true`) and skips validation, allowing CI builds to pass without requiring all environment variables in GitHub Secrets.

**When you DO need GitHub Secrets**:
- If a workflow needs to actually build and deploy (not just verify compilation)
- If a workflow needs to test with real Firebase/Discord connections
- If a workflow needs to run integration tests that require environment variables

**To configure GitHub Secrets** (if needed):
1. Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each required environment variable (see list below)
4. Secrets are encrypted and only available to workflows

**Required Secrets** (if needed for workflows):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)

**Note**: The build workflow (`build.yml`) only verifies that code compiles and builds successfully, so it doesn't need real environment variables. The deploy workflow may need them if it performs actual deployments.

See [CI/CD Documentation](../operations/ci-cd.md#environment-variables) for more details.

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

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add all required variables
3. Select which environments to apply to (Production, Preview, Development)
4. Update `NEXTAUTH_URL` to production URL for production environment
5. **Redeploy after adding variables** (changes don't take effect until redeploy)

**Vercel Secrets**:
- You can create secrets in Vercel and reference them in environment variables
- Go to **Settings** → **Secrets** to create reusable secrets
- Then reference them in environment variables (e.g., `${{ secrets.firebase_api_key }}`)

**Note**: The build process automatically validates environment variables in local development and deployments. If any required variables are missing, the build will fail with clear error messages indicating which variables need to be set. CI builds automatically skip this validation.

## Related Documentation

- [Environment Setup](./setup.md)
- [CI/CD Guide](../operations/ci-cd.md)

