# Automated Security Scanning

ITT Web includes automated security scanning via GitHub Actions to detect vulnerabilities and secrets.

## Dependency Vulnerability Scanning

**Workflow**: `.github/workflows/security.yml` (dependency-scan job)

**What it does**:
- Runs `npm audit` on every push and pull request
- Fails build on critical vulnerabilities
- Creates GitHub issues for high vulnerabilities (weekly schedule)
- Uploads audit results as artifacts

**How to use**:
1. View results in GitHub Actions tab
2. Download `audit-results.json` artifact for details
3. Fix vulnerabilities: `npm audit fix` (if safe)
4. Update dependencies: `npm update` or `npm install package@latest`

**Configuration**:
- Audit level: `moderate` (reports moderate, high, and critical)
- Critical vulnerabilities: Fail build immediately
- High vulnerabilities: Create GitHub issue (weekly)

## Secrets Scanning

**Workflow**: `.github/workflows/security.yml` (secrets-scan job)

**What it does**:
- Scans codebase for accidentally committed secrets
- Uses Gitleaks for detection
- Scans full git history
- Uploads scan results as artifacts

**What it scans for**:
- API keys and tokens
- Passwords and credentials
- Firebase service account keys
- NextAuth secrets
- Discord OAuth secrets
- Other common secret patterns

**Configuration**: `.gitleaks.toml`

**Allowlist**:
- `.env.example` files
- Documentation files
- Test files and mocks
- Workflow files (may contain example secrets)

**How to use**:
1. View results in GitHub Actions tab
2. Download `gitleaks-results.json` artifact for details
3. If false positive: Add to allowlist in `.gitleaks.toml`
4. If real secret: Rotate the secret immediately

## Manual Security Checks

**Run locally**:
```bash
# Dependency audit
npm audit

# Fix vulnerabilities (if safe)
npm audit fix

# Secrets scan (requires Gitleaks)
gitleaks detect --source . --verbose
```

## Responding to Security Issues

**If vulnerability found**:
1. Review the vulnerability details
2. Check if fix is available: `npm audit fix`
3. Update dependency if needed
4. Test thoroughly after update
5. Re-run audit to verify fix

**If secret found**:
1. **Immediately rotate the secret**
2. Remove secret from git history (if possible)
3. Add to `.gitleaks.toml` allowlist if false positive
4. Review access logs for compromised secret
5. Update documentation if secret format changed

## Related Documentation

- [Security Overview](../SECURITY.md)
- [Secrets Management](./secrets-management.md)
- [CI/CD Pipeline](../operations/ci-cd.md)

