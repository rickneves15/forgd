# CODING_STANDARDS.md

Standards that `/code-review` enforces on the **Standards** axis. `AGENTS.md` is navigation and non-negotiables; this file is the reviewer-facing detail. When a documented repo standard conflicts with the generic smell baseline, this file wins.

Formatting and mechanical lint are owned by Biome (`api/biome.json`, `app/biome.json`); the Husky pre-commit hook runs it on staged `api/src` files only. Do not restate what tooling catches. Rules tooling does **not** enforce — file naming, the `@/` import alias, layering, and anything under `app/src` — still belong in review. This file covers judgement calls.

## TypeScript

- `strict` is on in both packages. Never write `any`; use `unknown` at boundaries and narrow with Zod.
- Validate untrusted input at the edge with Zod. API request/response schemas are declared in the Fastify route `schema`; reusable shapes live in `api/src/schemas/` and are re-exported from `index.ts`.
- Prefer inferred types from Zod schemas (`z.infer`) over hand-written duplicate interfaces.
- Files are kebab-case, except Expo Router route files, which keep the router's names (`_layout.tsx`, `index.tsx`, `[id].tsx`). Imports use the `@/` alias (`@/*` → `src/*`), not long relative chains. Biome does not enforce either rule.
- Match the surrounding module: named exports, `const` arrow functions for route plugins and helpers, explicit return types only where inference is unclear.
- Keep comments about *why*, not *what*. The codebase uses short comments to record non-obvious decisions and invariants.

## API (`api/`)

- **Layering:** routes hold HTTP concerns and business rules; `src/db/repositories/` owns SQL and returns plain rows; shared auth logic lives in `src/services/auth/token-pair.ts`.
  - Do not import `@/db` from a route. The only exception is `GET /health`, which pings Postgres as an ops probe.
  - Do not add a use-case/DI layer speculatively. ADR-005 records why it was removed.
- **Errors:** throw `HttpError` subclasses from `src/http/_errors/errors/`; the error handler renders `{ code, message }`. Error codes are stable `SCREAMING_SNAKE_CASE` identifiers (e.g. `EMAIL_TAKEN`, `PROJECT_NOT_OPEN`); clients map them without parsing messages. Never leak stack traces or internals.
- **Auth:** access + refresh JWTs (RS256). Both token hashes are persisted and checked, so the `tokens` row is the revocation record for both types; rotation and logout revoke rows. Protected routes state the extra check plainly ("must be the project owner", "must be a member of this group") — there is no role system beyond project owner / group member / sole group admin.
- **Validation:** every body, query, and path param is schema-validated. Response schemas are declared too, so the OpenAPI docs and runtime contract stay honest.
- **No `/v1` prefix.** Add it only if an external consumer appears (ADR-005).
- **Security plugins:** helmet, CORS, rate limit, response throttle, and 404 normalisation are global. Do not disable them per-route without an ADR-level reason.
- **Logging:** request/response bodies are logged only at `debug`, through the redaction helper (ADR-004). Any new sensitive key must be added to the redaction pattern and its test.

## Database (`api/src/db/`)

Follow ADR-003 unless a new ADR supersedes it:

- UUID v7 primary keys generated client-side via the `uuid` package.
- Enum-like fields are `text` + Zod at the boundary, not Postgres enums or CHECK constraints. Valid values live in `schema/constants.ts`.
- `createdAt` + `updatedAt` on every table.
- Soft delete only on `users`; every other FK stays at the default `NO ACTION`.
- FK columns get an explicit index. No denormalised counters: counts are aggregate queries until a measured hot path says otherwise.
- One schema file per domain under `schema/`; all `relations()` in `schema/relations.ts`.
- Migrations: change the schema, run `pnpm --filter api db:generate`, review the generated SQL, then `db:migrate`. Commit the SQL and `meta/` journal together. Never hand-edit an applied migration.

## Mobile (`app/`)

- Expo SDK 57. Read the exact versioned docs at <https://docs.expo.dev/versions/v57.0.0/> before writing code (also stated in `app/AGENTS.md`).
- Expo Router file-based routes live under `app/src/app/`. Screen contracts are `docs/specs/app/APP-*.md`; visual tokens and component patterns are `docs/style-guide.md`.
- NativeWind v4 (Tailwind). Use the style-guide tokens; no raw hex outside brand assets. Match `bg-base`/`bg-surface`/`text-primary`/`accent` conventions.
- Server state belongs to React Query. Query keys and invalidation follow the paired APP spec's §4 tables.
- Forms: `react-hook-form` + `zod` resolver. Client-side validation only covers checks that run before the request — do not duplicate server rules.
- Tokens: `expo-secure-store` only, through `app/src/utils/storage-keys.ts`. Never `AsyncStorage` for credentials.
- HTTP: use `apiClient` (`app/src/http/api-client.ts`); do not create ad-hoc axios instances. Map API error codes to UI behaviour per the APP spec §7.
- UI primitives live in `app/src/components/ui/`. Prefer composing them over adding a second design system.

## Testing

- **API:** integration tests are the default and only strategy — `app.inject()` plus real Postgres (the `forgd_test` database created by the vitest global setup). Prefer the highest seam; one route-level test that exercises zod, auth, error handling, and SQL beats unit tests with mocked repositories.
- Test files sit next to the code they cover (`*.test.ts`) or under `api/test/` for cross-cutting helpers and factories. Use the existing factories/helpers rather than hand-building fixtures.
- Every acceptance criterion in a spec marked `Done` must be backed by a test, or the spec must state the deliberate gap.
- Run the single test file while iterating, and the full suite once before handing off. Never claim a suite passed without running it.
- **App:** no test runner is wired up yet. Do not invent a framework in a feature change; propose it separately.

## Security

- Never commit `.env`; only `.env.example` with empty secret values. Secrets come from the environment.
- Never paste tokens, passwords, private keys, or full auth headers into docs, issues, PRs, or logs. Write `<REDACTED>`.
- OAuth state is DB-backed and single-use (ADR-007); do not reintroduce cookies or server sessions.
- File uploads go through the presigned flow (SPEC-26, `docs/flows/file-upload-flow.md`); validate content type against the purpose allow-list.
- Any new public endpoint needs an explicit auth decision and, where relevant, a per-route rate limit.

## Git

- **Commit messages:** Conventional Commits, lowercase scope and summary, e.g. `feat(api): add projects feed`, `fix(app): persist refresh token`, `docs(specs): clarify upload errors`, `chore: wire pre-commit`.
- Scopes in use: `api`, `app`, `docs`, `specs`, `adr`, `flow`, `redesign`. Omit the scope for repo-wide chores.
- Keep commits focused. Do not mix formatting sweeps with behaviour changes.
- Branch from `main`, short-lived branches (`feat/...`, `fix/...`, `docs/...`, `chore/...`). Do not push or open a PR unless asked.
- Do not commit generated build output, coverage, `.expo/`, or local editor state.
- PR bodies use the `/pr` shape: Summary, Evidence, Merge Danger.

## Documentation

- Committed documentation is always in English, even when the conversation is in Portuguese.
- Use glossary terms verbatim. If a needed term is missing, add it to `docs/glossary.md` deliberately.
- One owner per fact: product behaviour in `prd.md`, entities/rules in `domain-model.md`, decisions in `adr/`, contracts in `specs/`, sequences in `flows/`, visual language in `style-guide.md`. Link, don't copy.
- A change that alters behaviour without updating its spec or ADR is incomplete.

## Reviewing

- `/code-review` runs two independent axes: **Standards** (this file + ADRs) and **Spec** (the originating `SPEC-XX` / `APP-XX` or issue). Report them separately; do not rerank one against the other.
- Documented standards override the generic smell baseline. Baseline smells are labelled judgement calls ("possible Feature Envy"), never hard violations.
- Skip anything Biome, TypeScript, or the tests already enforce. The finding is an unwired check, not a repeated manual rule.
