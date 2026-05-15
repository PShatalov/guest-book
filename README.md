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

- Node.js 20+
- [pnpm](https://pnpm.io/installation) 9.x (see `packageManager` in root `package.json`)

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

Equivalent to `npm run test:e2e` when using npm at the root. If tests fail with a missing-browser error, re-run `playwright install` in the `apps/e2e` workspace.

## Turborepo

Pipeline definitions live in `turbo.json`. Local caching is enabled by default. Build outputs are declared for `dist/**` and `.next/**` when apps produce them.
