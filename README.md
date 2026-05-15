# Guest Book

Monorepo for the guestbook application (message feed, auth, filtering). Orchestrated with [Turborepo](https://turbo.build) and [pnpm](https://pnpm.io) workspaces.

## Workspace layout

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js frontend |
| `apps/api` | NestJS API |
| `packages/typescript-config` | Shared TypeScript presets |
| `packages/eslint-config` | Shared ESLint flat config |

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

## Turborepo

Pipeline definitions live in `turbo.json`. Local caching is enabled by default. Build outputs are declared for `dist/**` and `.next/**` when apps produce them.
