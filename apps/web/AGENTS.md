# AGENTS.md

This package is the Next.js frontend for Guest Book, rendering the message feed, auth pages, message composer, filters, and inline author actions.

- Run package commands with `pnpm --filter @guest-book/web <script>`; common scripts are `dev`, `build`, `lint`, `typecheck`, and `test`.
- Keep App Router route files thin; delegate page UI to components and keep shared providers in the root provider layer.
- Use Client Components only where browser state, events, React Query hooks, or MUI client providers are needed.
- Keep API access behind shared fetch/query/mutation helpers so credentials, error handling, and cache invalidation stay consistent.
- Colocate styles, tests, and small component helpers with the component or feature they support.
