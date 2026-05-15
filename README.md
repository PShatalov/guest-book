# Guest Book

Monorepo for the guestbook application (message feed, auth, filtering). Orchestrated with [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io) workspaces.

## Workspace layout

| Path                         | Purpose                   |
| ---------------------------- | ------------------------- |
| `apps/web`                   | Next.js frontend          |
| `apps/api`                   | NestJS API                |
| `apps/e2e`                   | Playwright E2E tests      |
| `packages/typescript-config` | Shared TypeScript presets |
| `packages/eslint-config`     | Shared ESLint flat config |

## Prerequisites

- Node.js **24.15.0** LTS ([`.nvmrc`](.nvmrc) — use `nvm install`, `fnm use`, or [nodejs.org](https://nodejs.org/))
- [pnpm](https://pnpm.io/installation) 9.15.9 (see `packageManager` in root `package.json`; `engine-strict` is enabled in [`.npmrc`](.npmrc))

## Commands

Run from the repository root:

```bash
pnpm install
pnpm dev      # turbo run dev (persistent dev stubs)
pnpm build    # turbo run build
pnpm test     # turbo run test
pnpm test:e2e # Playwright E2E (Chromium, Firefox, WebKit)
pnpm lint     # turbo run lint
pnpm format   # prettier write
```

Filter to a single workspace:

```bash
pnpm --filter @guest-book/api build
pnpm --filter @guest-book/web test
```

### API (NestJS)

```bash
cp apps/api/.env.example apps/api/.env
# Set SESSION_SECRET and ensure DATABASE_URL points at Postgres, then:
pnpm --filter @guest-book/api db:migrate
pnpm --filter @guest-book/api start:dev
curl http://localhost:3001/health
curl http://localhost:3001/api/docs
```

Auth endpoints: `POST /auth/register`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout` (cookie session). Run auth API e2e against an isolated Docker test database (port **5433**, database `guestbook_test` — does not use dev Postgres on 5432):

```bash
pnpm --filter @guest-book/api test:e2e:db
```

Requires [Docker Engine](https://docs.docker.com/engine/) with Compose v2. The test stack is defined in `docker-compose.test.yml` and torn down automatically after the run.

### Docker Compose (API + PostgreSQL)

Runs the NestJS API and PostgreSQL with credentials supplied only via environment variables.

**Prerequisites:** [Docker Engine](https://docs.docker.com/engine/) with Compose v2.

```bash
cp compose.env.example .env
# Edit .env and set POSTGRES_PASSWORD (and other values if needed)

docker compose up --build
curl http://localhost:3001/health
```

A healthy stack returns JSON with `"status":"ok"` and `"database":"up"`. Stop with `docker compose down` (add `-v` to remove the Postgres volume).

| Variable            | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `POSTGRES_USER`     | PostgreSQL role                               |
| `POSTGRES_PASSWORD` | PostgreSQL password                           |
| `POSTGRES_DB`       | Database name                                 |
| `POSTGRES_PORT`     | Host port mapped to Postgres (default `5432`) |
| `API_PORT`          | Host port mapped to the API (default `3001`)  |

The API container receives `DATABASE_URL` built from those values and connects to the `postgres` service hostname on the Compose network.

### Tilt (local development)

Runs the Compose stack (PostgreSQL + API) and the Next.js dev server from a single command with the [Tilt](https://tilt.dev/) dashboard.

**Prerequisites:** [Tilt CLI](https://docs.tilt.dev/install.html), [Docker Engine](https://docs.docker.com/engine/) with Compose v2, Node.js 24.15.0 LTS (see [`.nvmrc`](.nvmrc)), pnpm 9.15.9, and `pnpm install` at the repository root.

```bash
cp compose.env.example .env
# Edit .env: set POSTGRES_PASSWORD and SESSION_SECRET (required for API auth)

pnpm dev:free-ports   # if 3000/3001 are still in use from a prior dev or E2E run
tilt up
```

Open the Tilt UI at [http://localhost:10350](http://localhost:10350). When `postgres` and `api` are green:

```bash
curl http://localhost:3001/health
```

A healthy stack returns JSON with `"status":"ok"` and `"database":"up"`. The web app is available at [http://localhost:3000](http://localhost:3000).

Stop everything with:

```bash
tilt down
```

If a resource stays unhealthy, inspect logs with `tilt logs <resource>` or `docker compose logs <service>` (for example `docker compose logs api`).

If the `web` resource fails with `EADDRINUSE` on port 3000, a previous Next.js or E2E process is still running. Run `pnpm dev:free-ports`, then `tilt up` again.

If you see `SESSION_SECRET variable is not set`, add `SESSION_SECRET` to the root `.env` (see `compose.env.example`).

If the `web` resource reloads in a loop, ensure `.tiltignore` is present and that Tilt is not watching `apps/web/.next` (build output). Restart with `tilt down` then `tilt up` after pulling changes to the `Tiltfile`.

Environment variables are the same as [Docker Compose (API + PostgreSQL)](#docker-compose-api--postgresql); Tilt reads the root `.env` file used by Compose.

### Web (Next.js)

```bash
pnpm --filter @guest-book/web dev
# http://localhost:3000
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and set `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). The API must expose `CORS_ORIGIN=http://localhost:3000` and `SESSION_SECRET` for cookie auth. Routes: `/register`, `/login`; the nav shows your username when signed in.

### E2E (Playwright)

Browser tests live in **`apps/e2e`** (`pnpm test:e2e`). Story suites (e.g. KAN-7 auth) are under `apps/e2e/tests/kan-7-sign-up-sign-in/`. Agent RECON/generation scratch stays in `.playwright-output/` (gitignored).

**Prerequisites:** [Docker Engine](https://docs.docker.com/engine/) with Compose v2 (for the optional isolated test Postgres used by Playwright global setup and API database E2E).

Install dependencies (the `apps/e2e` workspace runs `postinstall` to download Chromium, Firefox, and WebKit into the repo’s local Playwright cache):

```bash
pnpm install
# Or manually:
pnpm --filter @guest-book/e2e run install:browsers
```

Run all E2E specs from the repository root (starts dedicated API/web processes via Playwright `webServer`; global setup always starts `docker-compose.test.yml` on port **5433** and tears it down afterward):

```bash
pnpm run test:e2e
```

The test database is separate from the dev stack (`docker-compose.yml` on port 5432). E2E ignores a shell `DATABASE_URL` pointing at dev Postgres and does not reuse Tilt/Docker servers on 3000/3001 unless you set `E2E_REUSE_SERVERS=true`. Data lives on container tmpfs and is removed when the test Postgres container stops.

Equivalent to `npm run test:e2e` when using npm at the root. If tests fail with a missing-browser error, re-run `pnpm --filter @guest-book/e2e run install:browsers` (browsers are stored under `playwright-core/.local-browsers` via `PLAYWRIGHT_BROWSERS_PATH=0`).

**API database E2E (Jest + Supertest):**

```bash
pnpm --filter @guest-book/api test:e2e:db
```

**Harness smoke test** (optional, verifies the Docker lifecycle utilities):

```bash
RUN_TEST_DB_INTEGRATION=1 pnpm --filter @guest-book/api test:e2e:db
```

## Continuous integration (GitHub Actions)

CI runs automatically on **pull requests** and on **pushes to `main`**. Workflows live under [`.github/workflows/`](.github/workflows/).

### Verify (PR and `main`)

The [CI workflow](.github/workflows/ci.yml) runs on `ubuntu-latest` with Node.js from [`.nvmrc`](.nvmrc) and pnpm 9.15.9:

1. `pnpm install --frozen-lockfile`
2. `pnpm build` (TypeScript checks for API via `nest build` and web via `next build`)
3. `pnpm lint`
4. `pnpm test` (unit tests in `apps/api` and `apps/web` only — no Playwright or `*.e2e-spec.ts` suites)
5. `pnpm format:check`

No Docker, Tilt, PostgreSQL, or running dev servers is required for this job. Browser and API e2e run via the manual [E2E workflow](#e2e-manual) when you need a live stack. Open the **Actions** tab on GitHub to see logs for a failed step.

**Common fixes:**

- Lockfile out of date — run `pnpm install` locally and commit `pnpm-lock.yaml`.
- Formatting — run `pnpm format` and commit the diff.
- Lint or test failures — reproduce locally with the same command shown in the failed step.

### E2E (manual) {#e2e-manual}

The [E2E workflow](.github/workflows/e2e.yml) runs only when triggered manually (**Actions → E2E → Run workflow**). It starts the test Postgres stack (`docker-compose.test.yml`), applies migrations, installs Chromium, runs the Playwright smoke spec against the Next.js dev server, tears down the test database (even on failure), and uploads the HTML report as an artifact if the job fails.

Locally, all three browsers still run via `pnpm test:e2e`; CI uses Chromium only to keep dispatch runs fast.

## Turborepo

Pipeline definitions live in `turbo.json`. Local caching is enabled by default. Build outputs are declared for `dist/**` and `.next/**` when apps produce them.
