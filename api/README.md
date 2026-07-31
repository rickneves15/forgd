# Forgd API

Fastify API for [Forgd](../README.md). See [`../docs/CONTEXT.md`](../docs/CONTEXT.md) for full context, and [`../docs/specs/`](../docs/specs/) for implementation-ready contracts (SPEC-01 through SPEC-25).

## Stack

- **Fastify** + **Zod** (via `fastify-type-provider-zod`)
- **Drizzle ORM** + **Postgres**
- **`@fastify/jwt`** — plain JWT auth, no Better Auth (see [`ADR-002`](../docs/adr/ADR-002-jwt-over-better-auth.md))
- **Cloudflare R2** for file storage

## Setup

```bash
pnpm install
```

Create a `.env` file in this folder (`api/.env`, gitignored — never commit it) with:

```
DATABASE_URL=
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
REFRESH_JWT_PRIVATE_KEY=
REFRESH_JWT_PUBLIC_KEY=
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the API in watch mode |
| `pnpm start` | Run the built API (`dist/server.js`) |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed the database |

## Schema conventions

See [`ADR-003`](../docs/adr/ADR-003-database-schema-conventions.md) — UUID v7 primary keys, `text` + Zod for enum-like fields, soft delete on `User` only, uniform timestamps, one file per domain under `src/db/schema/`.
