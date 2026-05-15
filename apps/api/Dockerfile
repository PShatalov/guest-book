# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/typescript-config packages/typescript-config
COPY packages/eslint-config packages/eslint-config
RUN pnpm install --frozen-lockfile --filter @guest-book/api...

COPY apps/api apps/api
COPY packages/typescript-config packages/typescript-config
COPY packages/eslint-config packages/eslint-config
RUN pnpm --filter @guest-book/api build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app/apps/api

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/packages /app/packages

EXPOSE 3001
CMD ["node", "dist/main.js"]
