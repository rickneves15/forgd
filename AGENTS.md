# AGENTS.md

Repository-level operating instructions for coding agents working on Forgd. Keep this file short: it is a navigation pointer plus the non-negotiables. Detailed sources live under `docs/` and in [`CODING_STANDARDS.md`](./CODING_STANDARDS.md).

## What Forgd is

Forgd is a discovery-and-collaboration app for engineering students working on hardware projects. Students post projects, apply to join open ones, collaborate in Groups (tasks, issues, chat), and build a profile. V1 is mobile-only.

- `api/` — Fastify + Zod + Drizzle/Postgres API.
- `app/` — Expo (React Native) client.
- One pnpm workspace, two packages, **one shared business domain**. There are no per-package glossaries.

Read [`docs/CONTEXT.md`](./docs/CONTEXT.md) first.

## Sources of truth

Do not duplicate these. Update the owning file instead.

| Question | Owner |
|---|---|
| Product, stack, resolved decisions, project rules | [`docs/CONTEXT.md`](./docs/CONTEXT.md) |
| Features, user flows, screens, user stories | [`docs/prd.md`](./docs/prd.md) |
| Domain terminology | [`docs/glossary.md`](./docs/glossary.md) |
| Entities, relationships, business rules | [`docs/domain-model.md`](./docs/domain-model.md) |
| Architecture decisions (canonical) | [`docs/adr/`](./docs/adr/) — ADR-001 … ADR-007 |
| Cross-service sequences | [`docs/flows/`](./docs/flows/) |
| API behaviour contracts | [`docs/specs/api/SPEC-*.md`](./docs/specs/api/) |
| Mobile behaviour contracts | [`docs/specs/app/APP-*.md`](./docs/specs/app/) |
| Visual language, tokens, components | [`docs/style-guide.md`](./docs/style-guide.md) |
| Design source notes (Pencil) | [`docs/redesign/`](./docs/redesign/) |
| Coding rules reviewers enforce | [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) |
| Spec numbering, status, lifecycle | [`docs/agents/specs.md`](./docs/agents/specs.md) |
| Skill workflow | [`docs/agents/workflow.md`](./docs/agents/workflow.md) |
| Issue tracker conventions | [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) |
| Domain-doc consumption rules | [`docs/agents/domain.md`](./docs/agents/domain.md) |

## Before writing code

1. Read `docs/CONTEXT.md`, then `docs/glossary.md`, `docs/domain-model.md`, and the ADRs touching the area.
2. Read the matching API `SPEC-XX` and app `APP-XX` contracts. Read `docs/flows/` when the change is multi-actor.
3. For UI work, read `docs/style-guide.md` and `app/AGENTS.md` (Expo 57 versioned docs).
4. **When code and a spec disagree, the spec wins** — fix the code (documented exception: SPEC-01 §3.3). If the spec itself is wrong, say so and change the spec deliberately, updating affected docs in the same change.
5. If a change contradicts an ADR, surface it explicitly. Do not silently override an ADR.
6. If no spec exists for the feature, write one first (see `docs/agents/specs.md`). The Home feed is currently design-only and has no spec.

## Architecture and boundaries

- **API layering:** routes hold HTTP concerns and business rules; `api/src/db/repositories/` owns SQL; shared auth logic lives in `api/src/services/auth/token-pair.ts`; errors are `HttpError` subclasses rendered as `{ code, message }`. No `/v1` prefix. `GET /health` may query Postgres directly.
- **Database:** Postgres + Drizzle. One schema file per domain under `api/src/db/schema/`; all `relations()` in `relations.ts`; migrations generated with drizzle-kit. Follow ADR-003 (UUID v7 client-side, `text` + Zod for enum-like fields, uniform timestamps, soft delete on `User` only, FK indexes).
- **Mobile:** Expo Router routes under `app/src/app/`; NativeWind tokens from `docs/style-guide.md`; React Query for server state; axios `apiClient`; tokens in `expo-secure-store` (never `AsyncStorage`).
- No shared type package: keep API and app contracts aligned through the paired specs, not generated types.

## Commands

Run from the repository root.

| Task | Command |
|---|---|
| Install | `pnpm install` |
| API dev server | `pnpm --filter api dev` |
| API tests (integration, real Postgres) | `pnpm --filter api test` |
| One API test file | `pnpm --filter api exec vitest run <path>` |
| API typecheck | `pnpm --filter api exec tsc --noEmit` |
| API lint / format | `pnpm --filter api exec biome check .` / `pnpm --filter api exec biome format --write` |
| DB generate / migrate / studio | `pnpm --filter api db:generate` / `db:migrate` / `db:studio` |
| App dev server | `pnpm --filter app start` |
| App lint / fix | `pnpm --filter app lint` / `pnpm --filter app lint:fix` |
| App typecheck | `pnpm --filter app typecheck` |

API tests need a local Postgres: the vitest global setup creates and migrates `forgd_test`. `api/package.json`'s `db:seed` currently points at a missing `src/db/seed.ts` — do not rely on it. App tests are not configured yet (jest-expo is installed, but there is no test script); do not claim app test coverage.

## Non-negotiables

- TypeScript `strict`; no `any`; validate every external boundary with Zod.
- Biome owns formatting and mechanical lint: single quotes, no semicolons, 2-space indent, 80-column lines. Kebab-case filenames (Expo Router route files keep the router's names, e.g. `_layout.tsx`, `[id].tsx`) and `@/` imports are conventions Biome does not enforce — review them.
- API tests are integration tests through `app.inject()` against real Postgres. No mocked `@/db`.
- All committed documentation is in English. Use glossary terms exactly; do not drift to synonyms the glossary avoids.
- Conventional Commits (`feat(api):`, `fix(app):`, `docs:`, `chore:`). Do not commit unrelated work; do not push unless asked.
- Never commit `.env` files or secrets. Redact credentials from logs and captured output.
- Add or amend an ADR only for a hard-to-reverse, surprising, real trade-off. Keep it short.

## Keeping docs in sync

- A behaviour change lands with its docs in the same change: glossary, domain model, PRD, spec, and ADR as applicable.
- Spec IDs are stable. Never renumber. New specs follow `docs/agents/specs.md`.
- Temporary specs and tickets live in GitHub issues; durable knowledge is promoted into `docs/` (see `docs/agents/workflow.md`).
- Prefer a pointer over a copy. If information already has an owner, link to it.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`rickneves15/forgd`) and are managed with the `gh` CLI. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).

### Triage labels

Triage labels are intentionally **not configured** (decided 2026-11-14). `to-spec` and `to-tickets` expect to apply `ready-for-agent`; until the labels exist, run them with an explicit instruction to skip labels, or create the labels first. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) § Triage labels.

### Domain docs

Single-context: read `docs/glossary.md`, `docs/CONTEXT.md`, `docs/domain-model.md`, and the ADRs in `docs/adr/` before domain or architectural decisions. Never create per-package glossaries. See [`docs/agents/domain.md`](./docs/agents/domain.md).

### Engineering workflow

Main flow: `grill-with-docs` → `to-spec` → `to-tickets` → `implement` (per ticket) or `implement-spec` (whole spec) → `code-review` → `pr` (when a PR is wanted) → `retro`. Use `wayfinder` only for foggy multi-session efforts, and `triage` only for incoming issues you did not create. Full guidance: [`docs/agents/workflow.md`](./docs/agents/workflow.md).
