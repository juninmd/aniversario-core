# Contributing to aniversario-core

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/juninmd/aniversario-core.git
   cd aniversario-core
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Code Quality

All code must pass the following quality gates before merging:

| Gate | Command | Description |
|------|---------|-------------|
| Linting | `npm run lint` | ESLint with TypeScript rules |
| Type checking | `npm run typecheck` | TypeScript strict mode |
| Formatting | `npm run format:check` | Prettier code style |
| Unit tests | `npm test` | Jest with 80% coverage threshold |
| Security tests | `npm run test:security` | Security-focused test suite |
| Dependency audit | `npm run audit` | Check for known vulnerabilities |

Run all checks locally before pushing:
```bash
npm run lint && npm run typecheck && npm run format:check && npm test -- --coverage
```

## Testing Guidelines

### Test structure
- Unit tests: `src/__tests__/*.test.ts`
- Security tests: `src/__tests__/security-*.test.ts`
- Coverage threshold: 80% (branches, functions, lines, statements)

### Writing tests
- Use `supertest` for HTTP integration tests
- Use `jest.fn()` for mocking
- Set `JWT_SECRET` and `NODE_ENV=test` in test files
- Test error cases, edge cases, and happy paths

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD. The pipeline runs on every push to `main`/`develop` and on PRs to `main`.

### Pipeline stages

1. **Lint** - ESLint + TypeScript check + Prettier formatting
2. **Test** - Unit tests with coverage report uploaded to Codecov
3. **Security Test** - Security-focused test suite
4. **Audit** - npm audit for dependency vulnerabilities
5. **CodeQL** - GitHub's SAST security analysis
6. **Secret Scanning** - Gitleaks for leaked credentials
7. **Build** - TypeScript compilation, artifact upload
8. **Deploy (staging)** - Automatic on `develop` branch
9. **Deploy (production)** - On `main` branch

### Quality gates
- All linting and type checks must pass
- Test coverage must meet 80% threshold
- No high-severity dependency vulnerabilities
- CodeQL analysis must pass
- No secrets detected in code

## Deployment

### Staging
- Automatically deployed from the `develop` branch
- URL: `https://staging.aniversario-core.example.com`

### Production
- Deployed from the `main` branch
- URL: `https://aniversario-core.example.com`
- Requires all pipeline stages to pass

### Rollback
If a deployment fails health checks, the pipeline automatically triggers rollback to the previous version.

## Environment Variables

See `.env.example` for all required environment variables. Never commit `.env` files to the repository.

## Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- Feature branches: `feature/<name>`
- Bug fixes: `fix/<name>`

## Pull Request Process

1. Create a feature branch from `develop`
2. Implement your changes
3. Run all quality checks locally
4. Open a PR against `develop`
5. Ensure CI pipeline passes
6. Request review from maintainers
7. Squash-merge into `develop`

## Security

- Never commit secrets or credentials
- Report vulnerabilities via email (see SECURITY.md)
- All inputs must be validated and sanitized
- Follow least-privilege principle for access control
