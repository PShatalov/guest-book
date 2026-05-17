# Guest Book

Full-stack TypeScript guest book app with a NestJS API, Next.js web app, Playwright E2E tests, pnpm workspaces, and Turborepo.

## Required Tools

- Node.js `24.15.0` (`.nvmrc`)
- pnpm `9.15.9`
- Docker Engine with Compose v2
- [Tilt CLI](https://docs.tilt.dev/install.html)

Install dependencies from the repository root:

```bash
pnpm install
```

## Setup `.env` Files

Create local env files from the committed examples:

```bash
pnpm setup:env
```

The script creates these files if they do not already exist:

- `.env` from `compose.env.example`
- `apps/api/.env` from `apps/api/.env.example`
- `apps/web/.env.local` from `apps/web/.env.example`
- `apps/e2e/.env` from `apps/e2e/.env.example`

The examples use local-only defaults so the app can start immediately after copying. Change secrets and credentials before using them outside local development.

## Start App Locally Using Tilt

Tilt starts PostgreSQL and the API through Docker Compose, then starts the Next.js app on the host.

```bash
pnpm setup:env
tilt up
```

Open the Tilt dashboard at [http://localhost:10350](http://localhost:10350). The web app runs at [http://localhost:3000](http://localhost:3000), and the API runs at [http://localhost:3001](http://localhost:3001).

Swagger API docs are available at [http://localhost:3001/api/docs](http://localhost:3001/api/docs) after the API starts.

Useful checks:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/docs
```

Stop the local stack with:

```bash
tilt down
```

## Run Tests In All Apps

Run unit tests for all workspaces:

```bash
pnpm test
```

Run browser E2E tests:

```bash
pnpm test:e2e
```

Run API database-backed E2E tests:

```bash
pnpm test:e2e:api
```

Package-specific tests can be run with pnpm filters:

```bash
pnpm --filter @guest-book/api test
pnpm --filter @guest-book/web test
pnpm --filter @guest-book/e2e test:e2e
```

## Use Turborepo

Root scripts delegate to Turbo:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Turbo task definitions live in `turbo.json`. Use filters when you only want one workspace:

```bash
pnpm --filter @guest-book/api build
pnpm --filter @guest-book/web lint
```

Useful Turbo options:

```bash
pnpm turbo run build --filter=@guest-book/api
pnpm turbo run test --filter=@guest-book/web
pnpm turbo run lint --force
```

## Answers To Questions

### 1. How would you scale?

The API and web app should be horizontally scaled behind a load balancer because the application services are stateless. Session data is already stored outside the app process, so adding more API instances should not require sticky in-memory state.

For the database, I would start with the simplest reliable path: tune indexes, add read replicas for read-heavy traffic, and use materialized views for expensive feed or aggregate queries if the query patterns justify it. If materialized views are not enough, I would move to CQRS: keep the write database, maintain separate read databases optimized for feed queries, and synchronize them through a message queue.

### 2. How would you ensure minimal response time at scale?

For the current message feed, the backend supports filtering by `categoryTag`, `authorUsername`, `createdFrom`, `createdTo`, and cursor-based pagination. Because the query reads from the `message_feed` materialized view and sorts by newest messages first, I would add indexes on that view for the default feed order, category filtering, and case-insensitive author username filtering. If production metrics show users frequently combine category and author filters, I would add a combined index for that path later, but not before it is justified because every extra materialized view index increases refresh cost.

If we remove the materialized view at some point and read directly from base tables, the same access patterns should be covered on the underlying tables instead. The `messages` table would need indexes for newest-first pagination, category plus newest-first pagination, and author plus newest-first pagination.

At the infrastructure level, I would use CDN caching for static Next.js assets and keep API instances close to the database. Slow query logs and traces will help with future optimizations.

### 3. How would you ensure fault tolerance?

The current app already has a `/health` endpoint and stores persistent state in PostgreSQL. In production, I would run multiple web and API instances across availability zones and make sure database migrations are backward-compatible with the currently deployed version.

For PostgreSQL, I would use automated backups, point-in-time recovery and monitoring. If we introduce asynchronous workflows later, message queue consumers should be idempotent so retries do not duplicate messages or corrupt state.

### 4. How would you monitor performance and errors in production?

The API already uses structured Pino logging and OpenTelemetry dependencies, so I would export logs, metrics, and traces to a production observability platform. We should track request rate, error rate, latency percentiles, database query duration, connection pool saturation, failed sign-ins, message creation failures, and health check status.

For the frontend, I would collect web vitals and client-side errors. We can install a tool like Bugsnag, Sentry, or a similar service to catch browser errors.
