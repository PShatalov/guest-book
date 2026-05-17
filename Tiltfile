# Guest Book local development — API + PostgreSQL via Compose, Next.js on the host.
# Prerequisites: Tilt CLI, Docker, pnpm install at repo root, cp compose.env.example .env

docker_compose('./docker-compose.yml')

dc_resource(
    'postgres',
    labels=['database'],
    links=['localhost:5432'],
)

local_resource(
    'migrations',
    cmd='set -a; [ -f .env ] && . ./.env; set +a; DATABASE_URL="postgresql://${POSTGRES_USER:-guestbook}:${POSTGRES_PASSWORD:-guestbook}@localhost:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-guestbook}" pnpm --filter @guest-book/api run db:migrate',
    deps=[
        'apps/api/drizzle',
        'apps/api/drizzle.config.ts',
        'apps/api/src/database/schema',
        'apps/api/package.json',
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
    ],
    resource_deps=['postgres'],
    labels=['database'],
)

dc_resource(
    'api',
    labels=['backend'],
    resource_deps=['postgres', 'migrations'],
    links=['http://localhost:3001'],
)

# Watch source and config only — not apps/web/.next (Next dev rewrites it constantly).
local_resource(
    'web',
    serve_cmd='pnpm --filter @guest-book/web dev',
    deps=[
        'apps/web/app',
        'apps/web/src',
        'apps/web/package.json',
        'apps/web/next.config.ts',
        'apps/web/tsconfig.json',
        'apps/web/eslint.config.mjs',
        'apps/web/jest.config.ts',
        'apps/web/jest.setup.ts',
        'packages/typescript-config',
        'packages/eslint-config',
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
    ],
    ignore=[
        'apps/web/.next',
        'apps/web/.turbo',
        'apps/web/tsconfig.tsbuildinfo',
    ],
    links=['http://localhost:3000'],
    labels=['frontend'],
)
