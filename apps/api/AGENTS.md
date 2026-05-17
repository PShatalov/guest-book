# AGENTS.md

This package is the NestJS backend API for Guest Book, serving REST endpoints for auth, users, messages, health checks, sessions, and OpenAPI docs.

- Run package commands with `pnpm --filter @guest-book/api <script>`; common scripts are `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e:api`, and `db:generate`.
- Keep controllers thin: validate DTOs, document REST contracts with Swagger decorators, and delegate behavior to application/domain services.
- Keep database access behind repositories and Drizzle schema types; when schema changes, update the Drizzle schema and generate a migration.
- Use unit specs beside source files for service logic and DB-backed e2e specs for persistence, auth/session, security, and API contract behavior.
