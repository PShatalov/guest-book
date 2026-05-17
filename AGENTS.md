# AGENTS.md

Guest Book is a TypeScript full-stack pnpm/Turborepo monorepo. It contains a NestJS REST API, a Next.js App Router web app, shared lint/type configuration packages, and a Playwright E2E package. The application lets guests register, sign in, create messages, edit or delete their own messages, and browse the message feed with filters.

- Use `pnpm@9.15.9`; `pnpm-lock.yaml` is authoritative.
- Common root commands: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
- When doing feature development or bug fixes, use the `/tdd` skill if it is available and the task benefits from a red-green-refactor workflow.
- When installing, updating, or removing dependencies, use the `/dependency-installer` skill if it is available.
- Keep package- or domain-specific guidance in the nearest relevant `AGENTS.md` instead of expanding this root file.
