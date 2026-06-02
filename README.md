# aniversario-core

Anniversary/Birthday management core API built with Express, TypeScript, and JWT authentication.

## Badges

![CI/CD Pipeline](https://github.com/juninmd/aniversario-core/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/juninmd/aniversario-core/branch/main/graph/badge.svg)](https://codecov.io/gh/juninmd/aniversario-core)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-blue)](https://github.com/juninmd/aniversario-core)

## Quick Start

```bash
npm ci
cp .env.example .env
# Edit JWT_SECRET in .env
npm run dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:security` | Run security-focused tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run audit` | Check dependencies for vulnerabilities |

## API Endpoints

### Health
- `GET /health` - Health check

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Anniversaries (authenticated)
- `GET /api/anniversaries` - List all anniversaries
- `GET /api/anniversaries/:id` - Get a specific anniversary
- `POST /api/anniversaries` - Create a new anniversary (admin/user)
- `DELETE /api/anniversaries/:id` - Delete an anniversary (admin only)

## Architecture

```
src/
  __tests__/        # Test files
  middleware/       # Express middleware (auth, cors, rate-limit, validation, error handling)
  routes/           # Route handlers (auth, anniversaries)
  types/            # TypeScript type definitions
  utils/            # Utility functions (validation, error classes)
  app.ts            # Express app setup
  index.ts          # Server entry point
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- **Lint**: ESLint, TypeScript strict check, Prettier formatting
- **Test**: Jest with 80% coverage threshold, Codecov integration
- **Security**: Security tests, npm audit, CodeQL SAST, secret scanning
- **Build**: TypeScript compilation with source maps
- **Deploy**: Automatic staging deployment on `develop`, production on `main`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed CI/CD workflow and contribution guidelines.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `JWT_SECRET` | **Yes** | - | JWT signing secret |
| `JWT_EXPIRY` | No | `24h` | Token expiration |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS origins |

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

## License

MIT
