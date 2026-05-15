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
pnpm --filter @guest-book/api start:dev
curl http://localhost:3001/health
```

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
# Edit .env and set POSTGRES_PASSWORD (see Docker Compose section for variables)

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

If the `web` resource reloads in a loop, ensure `.tiltignore` is present and that Tilt is not watching `apps/web/.next` (build output). Restart with `tilt down` then `tilt up` after pulling changes to the `Tiltfile`.

Environment variables are the same as [Docker Compose (API + PostgreSQL)](#docker-compose-api--postgresql); Tilt reads the root `.env` file used by Compose.

### Web (Next.js)

```bash
pnpm --filter @guest-book/web dev
# http://localhost:3000
```

Optional: set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` when connecting to the API (default not required for the foundation scaffold).

### E2E (Playwright)

Install dependencies (the `apps/e2e` workspace runs `postinstall` to download Chromium, Firefox, and WebKit into the repo’s local Playwright cache):

```bash
pnpm install
# Or manually:
pnpm --filter @guest-book/e2e run install:browsers
```

Run all E2E specs from the repository root (starts the web app automatically via Playwright `webServer`):

```bash
pnpm run test:e2e
```

Equivalent to `npm run test:e2e` when using npm at the root. If tests fail with a missing-browser error, re-run `pnpm --filter @guest-book/e2e run install:browsers` (browsers are stored under `playwright-core/.local-browsers` via `PLAYWRIGHT_BROWSERS_PATH=0`).

## Continuous integration (GitHub Actions)

CI runs automatically on **pull requests** and on **pushes to `main`**. Workflows live under [`.github/workflows/`](.github/workflows/).

### Verify (PR and `main`)

The [CI workflow](.github/workflows/ci.yml) runs on `ubuntu-latest` with Node.js from [`.nvmrc`](.nvmrc) and pnpm 9.15.9:

1. `pnpm install --frozen-lockfile`
2. `pnpm build` (TypeScript checks for API via `nest build` and web via `next build`)
3. `pnpm lint`
4. `pnpm test`
5. `pnpm format:check`

No Docker, Tilt, or PostgreSQL is required for this job. Open the **Actions** tab on GitHub to see logs for a failed step.

**Common fixes:**

- Lockfile out of date — run `pnpm install` locally and commit `pnpm-lock.yaml`.
- Formatting — run `pnpm format` and commit the diff.
- Lint or test failures — reproduce locally with the same command shown in the failed step.

### E2E (manual)

The [E2E workflow](.github/workflows/e2e.yml) runs only when triggered manually (**Actions → E2E → Run workflow**). It installs Chromium, runs the Playwright smoke spec against the Next.js dev server, and uploads the HTML report as an artifact if the job fails.

Locally, all three browsers still run via `pnpm test:e2e`; CI uses Chromium only to keep dispatch runs fast.

## Turborepo

Pipeline definitions live in `turbo.json`. Local caching is enabled by default. Build outputs are declared for `dist/**` and `.next/**` when apps produce them.
