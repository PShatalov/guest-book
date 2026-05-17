# Guest Book Architecture

## Application Structure And Reasoning

```text
guest-book/
  apps/
    api/        NestJS REST API, Drizzle schema/migrations, Jest API tests
    web/        Next.js App Router UI, feature components, shared API/query hooks
    e2e/        Playwright browser tests and local server orchestration
  packages/
    eslint-config/
    typescript-config/
```

The monorepo layout keeps deployable applications in `apps/*` and shared development configuration in `packages/*`. Turborepo coordinates build, lint, typecheck, and test tasks, while pnpm workspaces keep dependencies and lockfile state centralized.

The API follows a layered NestJS structure:

- Controllers define routes, DTO validation boundaries, guards, and Swagger metadata.
- Application services coordinate request-level use cases.
- Domain-focused services hold business rules such as message creation, listing, update, deletion, registration, and authentication.
- Repositories isolate Drizzle/PostgreSQL access.
- `common/*` centralizes guards, validation helpers, security middleware, exception handling, logging, sessions, SQL helpers, and telemetry.

The web app is organized around Next.js App Router pages, feature components, shared providers, and shared API/query helpers. Feature modules own UI-specific state and validation, while `src/lib` and `components/shared` hold reusable API clients, message types, auth/message query keys, and mutation/query hooks.

The E2E package is intentionally separate from the app packages. Its Playwright config can start API and web servers on dedicated ports and point them at an isolated PostgreSQL test database, reducing the chance that browser tests mutate a developer database.

## 3-Tier Separation

The main runtime application follows a 3-tier architecture:

- Presentation tier: `apps/web` owns the Next.js pages, feature components, browser state, form validation, and API/query hooks used by the UI.
- Application/business tier: `apps/api` owns HTTP controllers, DTO validation, guards, application services, domain services, authentication, authorization, and request-level use case coordination.
- Data tier: API repositories isolate Drizzle/PostgreSQL access, including message persistence, session storage, migrations, and the `message_feed` materialized view used by feed reads.

## Key Decisions

### Filtering And Message Feed Reads

Message list filtering is API-owned. The list endpoint accepts `categoryTag`, `authorUsername`, `createdFrom`, and `createdTo`, with DTO validation at the controller boundary and additional normalization in the listing service.

Category tags are trimmed and lowercased for writes and filters, which makes tag matching predictable. Author usernames are trimmed and matched case-insensitively in SQL, preserving user-entered casing while avoiding surprising filter misses. Date filters use inclusive ISO-8601 bounds and reject inverted ranges.

The read path uses a `message_feed` PostgreSQL materialized view that joins messages to author usernames. The idea was to emulate CQRS. Write operations refresh the materialized view after create, update, and delete operations.

### Pagination

Pagination is cursor-based. The cursor encodes `createdAt` and `id`, and SQL orders by `created_at DESC, id DESC`. The repository fetches `limit + 1` rows to determine `hasMore`, then returns an opaque `nextCursor`.

This design is stable for append-heavy feeds and avoids offset drift when new messages arrive. The `id` tie-breaker keeps ordering deterministic for messages with identical timestamps.

### Authentication And Authorization

Authentication uses server-side sessions with `express-session`, cookies, and a PostgreSQL session store via `connect-pg-simple`. Passwords are hashed with Argon2.

Protected API routes use `AuthenticatedSessionGuard`. Message update and delete operations also check authorship in the message service, so authorization is enforced close to the resource being modified.

The web client sends requests with `credentials: 'include'`. Next.js rewrites allow the browser to call `/api/*` as same-origin during local development and E2E runs, which aligns with cookie-based auth.

### Error Handling And Validation

The API uses a global `ValidationPipe` with whitelisting, forbidden non-whitelisted properties, transformation, and forbidden unknown values. Controllers and services throw Nest HTTP exceptions with consistent response payloads for validation, auth, not-found, conflict, and forbidden cases.

A global exception filter preserves HTTP exception bodies, logs expected client/server HTTP errors at appropriate levels, and normalizes unhandled errors to a generic `500` response. The web app centralizes API error parsing in `apiFetchClient`, converting API error payloads into an `ApiError` for UI handling.

### Security and observability

The API applies `helmet`, `hpp`, CORS only when configured, and Nest throttling with a stricter auth route profile. Secure session cookies are enabled by default in production unless explicitly overridden for local HTTP Compose runs. Health checks include database connectivity and report degraded status when the database probe fails.

OpenTelemetry hooks exist for both API and web, and API logs use Pino with trace mixin support. Docker Compose provides local PostgreSQL plus an API container, and a separate Compose file provides separate PostgreSQL database for tests.

## Testing

Current testing layers include:

- API unit tests with Jest and `ts-jest`.
- API DB-backed e2e/integration tests for auth, health, messages, users, security.
- Web component tests with Jest, jsdom, and React Testing Library.
- Browser E2E tests with Playwright across Chromium, Firefox, and WebKit.

## CI/CD

The current GitHub Actions CI workflow installs with a frozen pnpm lockfile, builds, lints, runs unit tests, and checks formatting on pushes to `main` and pull requests.

In the future CI should split checks into focused jobs:

- `quality`: install dependencies with `pnpm install --frozen-lockfile`, then run `pnpm format:check`, `pnpm lint`, and `pnpm typecheck`.
- `unit-tests`: run `pnpm build` and `pnpm test` for API and web unit/component coverage.
- `api-e2e`: start `docker-compose.test.yml`, run the API DB-backed E2E suite, always tear down Compose, and upload logs on failure.
- `browser-e2e`: install Playwright browser dependencies, run `pnpm test:e2e` across Chromium, Firefox, and WebKit on every pull request, and upload `playwright-report`, traces, screenshots, videos, and server logs when tests fail.
- `docker-smoke`: build the API Docker image and run a Compose `/health` smoke check before CD relies on the production container path.

CD is not configured yet. A portable CD design should trigger only after CI passes on `main`, publish immutable artifacts tagged by commit SHA, and deploy first to staging before production. The API should be published as a Docker image. A CDN should be configured in front of the web app to serve static Next.js assets and cacheable public responses at the edge, while dynamic authenticated routes and API traffic should either bypass caching or use conservative cache rules. Database migrations should run as an explicit release step.

Deployment environments should own their secrets and runtime settings: `DATABASE_URL`, `SESSION_SECRET`, session cookie security, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `API_PROXY_TARGET`, and OpenTelemetry exporter settings. Production deploys should use GitHub Environments, required reviewers, deployment concurrency, and deployment history. Post-deploy smoke checks should cover API `/health`, the web home page, the auth session endpoint, and a synthetic sign-up/sign-in flow against staging.

## Suggested Next Steps

- Add the recommended CI jobs for quality, unit, API E2E, browser E2E, and Docker smoke validation.
- Add a CD workflow after the deployment target is selected, keeping staging and production as separate protected environments.
- Consider adding observability dashboards and alerting around API latency, error rate, throttling and database connectivity.
