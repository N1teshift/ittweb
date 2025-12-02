# CI/CD Pipeline Documentation

Complete guide for the Continuous Integration and Continuous Deployment pipeline.

## Overview

ITT Web uses **GitHub Actions** for CI/CD. The pipeline includes automated testing, building, security scanning, and deployment.

## Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Purpose**: Run tests and linting on every push and pull request.

**Triggers**:
- Push to `main` branch
- Pull requests to `main` branch

**Jobs**:
- **Test**: Runs on Node.js 18.x and 20.x
  - Install dependencies: `npm ci`
  - Type check: `npm run type-check`
  - Lint: `npm run lint`
  - Test: `npm run test`
  - Upload coverage: Uploads to Codecov (Node.js 20.x only)

**Duration**: ~3-5 minutes

### 2. Build Workflow (`.github/workflows/build.yml`)

**Purpose**: Verify production builds succeed.

**Triggers**:
- Push to `main` branch
- Pull requests to `main` branch

**Jobs**:
- **Build**: Runs on Node.js 20.x
  - Install dependencies: `npm ci`
  - Build check: `npm run build:check` (type-check + build)
  - Verify artifacts: Checks `.next` directory exists
  - Upload artifacts: Uploads build artifacts (main branch only)

**Duration**: ~5-8 minutes

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Purpose**: Deploy application to Vercel.

**Triggers**:
- Push to `main` branch (staging)
- Release/tag creation (production)
- Manual trigger via GitHub Actions UI

**Jobs**:
- **Deploy**: Runs on Node.js 20.x
  - Install dependencies: `npm ci`
  - Run tests: `npm run test`
  - Build: `npm run build`
  - Deploy to Vercel: Uses Vercel Action
  - Verify deployment: Checks deployment URL

**Environments**:
- **Staging**: Deploys on push to `main`
- **Production**: Deploys on release/tag or manual trigger

**Duration**: ~8-12 minutes

**Required Secrets**:
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

**Note**: The build workflow automatically skips environment variable validation in CI (see [Environment Variables](#environment-variables) section below). Environment variables are still required for actual deployments to Vercel.

### 4. Bundle Size Workflow (`.github/workflows/bundle-size.yml`)

**Purpose**: Monitor bundle size on pull requests.

**Triggers**:
- Pull requests to `main` branch

**Jobs**:
- **Bundle Size**: Runs on Node.js 20.x
  - Install dependencies: `npm ci`
  - Build with analyzer: `ANALYZE=true npm run build`
  - Analyze bundle: Generates bundle analysis
  - Upload artifacts: Uploads bundle analysis reports
  - Comment PR: Comments on PR with bundle size info

**Duration**: ~6-10 minutes

### 5. Security Workflow (`.github/workflows/security.yml`)

**Purpose**: Scan for security vulnerabilities and secrets.

**Triggers**:
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Monday 9 AM UTC)

**Jobs**:

#### Dependency Scan
- **Dependency Scan**: Runs on Node.js 20.x
  - Install dependencies: `npm ci`
  - Run audit: `npm audit --audit-level=moderate`
  - Check vulnerabilities: Fails on critical vulnerabilities
  - Create issues: Creates GitHub issues for high vulnerabilities (weekly)
  - Upload results: Uploads audit results

#### Secrets Scan
- **Secrets Scan**: Runs on Ubuntu latest
  - Checkout code: Full history for scanning
  - Run Gitleaks: Scans for accidentally committed secrets
  - Upload results: Uploads scan results

**Duration**: ~2-5 minutes

### 6. Workflow Monitor (`.github/workflows/workflow-monitor.yml`)

**Purpose**: Automatically monitor all workflows and provide feedback on status and failures.

**Triggers**:
- After any workflow completes (Test, Build, Deploy, Security, Bundle Size)
- Daily schedule (9 AM UTC)
- Manual trigger via GitHub Actions UI

**Jobs**:
- **Monitor Workflows**: Runs on Ubuntu latest
  - Monitors workflow completion events
  - Creates GitHub issues for failures
  - Writes status files for programmatic access
  - Prevents duplicate issues for recurring failures

**Features**:
- **Automatic Issue Creation**: Creates GitHub issues when workflows fail (labeled `workflow-failure`, `ci/cd`, `devops`)
- **Duplicate Prevention**: Checks for existing issues before creating new ones
- **Daily Health Check**: Runs daily to ensure workflows are active

**Duration**: ~1-2 minutes

**Feedback Methods**:
- GitHub Issues (automatic on failures)

## Workflow Status

### Viewing Workflow Status

**Manual Methods**:
- **GitHub Repository**: Actions tab
- **Badge**: Add to README: `![CI](https://github.com/owner/repo/workflows/Test/badge.svg)`

**Automated Feedback**:
- **Workflow Monitor**: Automatically monitors all workflows and creates GitHub issues on failures

### Workflow Monitoring

The **Workflow Monitor** workflow (`.github/workflows/workflow-monitor.yml`) provides automated feedback:

1. **Monitors All Workflows**: Automatically triggers when any workflow completes
2. **Creates Issues on Failure**: Opens GitHub issues with details when workflows fail
3. **Updates Status Files**: Writes status files that can be read programmatically
4. **Daily Health Check**: Runs daily to ensure workflows are active

**Feedback Methods**:
- ✅ **GitHub Issues**: Automatic issue creation for failures (labeled `workflow-failure`, `ci/cd`, `devops`)

## Adding New Workflows

### 1. Create Workflow File

Create `.github/workflows/your-workflow.yml`:

```yaml
name: Your Workflow

on:
  push:
    branches: [main]

jobs:
  your-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Your step
        run: echo "Hello"
```

### 2. Test Locally (Optional)

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
act -j your-job
```

### 3. Commit and Push

```bash
git add .github/workflows/your-workflow.yml
git commit -m "Add new workflow"
git push
```

## Workflow Best Practices

1. **Use caching**: Cache `node_modules` for faster builds
2. **Fail fast**: Run quick checks (lint, type-check) before slow operations (build, test)
3. **Parallel jobs**: Run independent jobs in parallel
4. **Conditional steps**: Use `if` conditions to skip unnecessary steps
5. **Artifacts**: Upload build artifacts and test results
6. **Secrets**: Never commit secrets, use GitHub Secrets
7. **Matrix builds**: Use matrix strategy for multiple Node.js versions

## Troubleshooting

### Workflow Not Running

**Issue**: Workflow doesn't trigger
- **Check**: Verify workflow file is in `.github/workflows/`
- **Check**: Verify trigger conditions (branch, event)
- **Check**: Verify YAML syntax is correct

### Workflow Fails

**Issue**: Workflow fails with error
- **Check**: View workflow logs in GitHub Actions tab
- **Check**: Verify all required secrets are set
- **Check**: Verify environment variables are available

### Slow Workflows

**Issue**: Workflows take too long
- **Solution**: Add caching for dependencies
- **Solution**: Run jobs in parallel
- **Solution**: Use matrix strategy efficiently

### Secrets Not Available

**Issue**: Secrets not found in workflow
- **Check**: Verify secrets are set in GitHub repository settings
- **Check**: Verify secret names match exactly
- **Check**: Verify secrets are available for the workflow

## Environment Variables

### CI Build Environment

The build workflow automatically skips environment variable validation when running in CI (GitHub Actions). This allows CI builds to pass without requiring all environment variables to be configured in GitHub Secrets, since CI builds only need to verify that the code compiles and builds successfully.

**How it works**:
- The `scripts/validate-env.js` script checks for `CI=true` environment variable
- If `CI=true`, validation is skipped and the script exits successfully
- This allows type-checking and build verification to proceed without real environment variables

**Note**: This only applies to CI builds. Local development and actual deployments still require all environment variables to be configured.

### GitHub Secrets Configuration

For workflows that need environment variables (e.g., deploy workflow), configure them in GitHub Secrets:

1. Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each required environment variable as a secret:
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

**Note**: GitHub Secrets are encrypted and only available to workflows. They are not exposed in logs or to forks.

### Vercel Environment Variables

For deployments to Vercel, configure environment variables in the Vercel Dashboard:

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add each required environment variable
3. Select which environments to apply to (Production, Preview, Development)
4. For secrets, you can either:
   - Add as direct values
   - Reference Vercel Secrets (create secret first, then reference it)

**Required Variables**:
- All `NEXT_PUBLIC_FIREBASE_*` variables
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (production URL for production, preview URL for previews)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

**Important**: After adding environment variables in Vercel, you must redeploy for changes to take effect.

See [Environment Setup Guide](../getting-started/setup.md) for detailed instructions on obtaining these values.

## Workflow Examples

### Example: Custom Test Workflow

```yaml
name: Custom Tests

on:
  pull_request:
    branches: [main]

jobs:
  custom-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:custom
```


## Related Documentation

- [Deployment Guide](./deployment.md) - Deployment process
- [Environment Setup](../getting-started/setup.md) - Environment configuration
- [Monitoring Guide](./monitoring.md) - Monitoring and observability

