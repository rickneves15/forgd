# Forgd API

Fastify API for [Forgd](../README.md). See [`../docs/CONTEXT.md`](../docs/CONTEXT.md) for full context and [`../docs/specs/api/`](../docs/specs/api/) for implementation-ready contracts (SPEC-01 through SPEC-26). Repository-wide agent rules live in [`../AGENTS.md`](../AGENTS.md); coding standards in [`../CODING_STANDARDS.md`](../CODING_STANDARDS.md).

## Stack

- **Fastify** + **Zod** (via `fastify-type-provider-zod`)
- **Drizzle ORM** + **Postgres**
- **`@fastify/jwt`** — plain JWT auth, no Better Auth (see [`ADR-002`](../docs/adr/ADR-002-jwt-over-better-auth.md))
- **Cloudflare R2** for file storage

## Setup

```bash
pnpm install
```

Create a `.env` file in this folder (`api/.env`, gitignored — never commit it) with the keys from [`.env.example`](./.env.example):

```
API_PUBLIC_URL=
DATABASE_URL=
LOG_LEVEL=
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
REFRESH_JWT_PRIVATE_KEY=
REFRESH_JWT_PUBLIC_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_MOBILE_REDIRECT_URI=
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the API in watch mode |
| `pnpm test` | Run integration tests (real Postgres, `forgd_test`) |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |

There is no `lint` or `typecheck` script; run them through pnpm exec:

```bash
pnpm --filter api exec biome check .
pnpm --filter api exec tsc --noEmit
```

`pnpm db:seed` points at `src/db/seed.ts`, which does not exist yet — do not rely on it.

## Schema conventions

See [`ADR-003`](../docs/adr/ADR-003-database-schema-conventions.md) — UUID v7 primary keys, `text` + Zod for enum-like fields, soft delete on `User` only, uniform timestamps, one file per domain under `src/db/schema/`.
