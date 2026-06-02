# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing the maintainers directly.
Do **not** open a public GitHub issue for security vulnerabilities.

Please include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if available)

You should receive a response within 48 hours. If you don't, please follow up.

## Security Measures

### Secrets Management
- **No secrets in code:** All secrets (API keys, database URLs, JWT secrets) are loaded from environment variables via `.env` files (which are gitignored).
- **GitGuardian/Secret Scanning:** The CI pipeline includes automated secret scanning to detect accidentally committed credentials.
- **Leaked token:** The initial remote URL contained a hardcoded GitHub PAT. This token was revoked and replaced with environment-variable-based authentication.

### Dependency Security
- **Dependabot** is configured to automatically create PRs for dependency updates weekly.
- Dependencies are pinned to exact versions in `package.json`.
- `npm audit` runs in CI to detect known vulnerabilities.

### Input Validation
- All user inputs are validated using `express-validator` before processing.
- Input sanitization is applied to prevent XSS and injection attacks.
- Request payload size is limited via `express` body-parser configuration.

### Authentication & Authorization
- JWT-based authentication with `jsonwebtoken`.
- Middleware validates tokens on protected routes.
- Tokens include expiration and are signed with a strong secret.
- Principle of least privilege applied to all access controls.

### API Security
- **Rate limiting** via `express-rate-limit` to prevent brute-force and DoS attacks.
- **CORS** configured with specific allowed origins (not wildcard in production).
- **Security headers** set via `helmet`.
- **Request body size limits** to prevent payload-based attacks.

### Error Handling
- Generic error messages returned to clients (no stack traces or internal details leaked).
- Structured error responses with proper HTTP status codes.
- Errors are logged server-side for debugging.

### CI/CD Security
- Secrets stored in GitHub Secrets, never in code.
- CI pipelines run with least-privilege permissions.
- Automated SAST (CodeQL) and dependency scanning.
- Secret scanning in CI prevents accidental credential leaks.

## OWASP Top 10 Compliance

| # | Category | Status |
|---|----------|--------|
| 1 | Broken Access Control | JWT auth middleware + least privilege |
| 2 | Cryptographic Failures | Env-based secrets, HTTPS enforced |
| 3 | Injection | Input validation + parameterized queries |
| 4 | Insecure Design | Secure-by-default patterns |
| 5 | Security Misconfiguration | Helmet, CORS, rate limiting |
| 6 | Vulnerable Components | Dependabot + npm audit in CI |
| 7 | Auth Failures | JWT with expiry + validation |
| 8 | Software Integrity | Dependabot + lockfile |
| 9 | Logging & Monitoring | Structured logging + error tracking |
| 10 | SSRF | URL validation on external requests |

## Running Security Audits

```bash
# Audit npm dependencies
npm audit

# Run security-focused tests
npm run test:security
```
