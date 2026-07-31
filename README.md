# Forgd

> Find your next hardware project, build it with a team.

Forgd is a discovery-and-collaboration app for **engineering students** working on hardware projects (electronics, electrical, mechanical, civil, aerospace, chemical). Post a project, find collaborators, run the group's work inside the app, and build a track record other students can see.

**Start here:** [`docs/CONTEXT.md`](./docs/CONTEXT.md) — primary context doc (stack, decisions, rules, full document map).

## Repo structure

This is a pnpm workspace with two packages:

| Package | What it is | Status |
|---|---|---|
| `api/` | Fastify API (see [`api/README.md`](./api/README.md)) | In progress |
| `app/` | Expo (React Native) mobile app | Not scaffolded yet |

> **Note:** this root README is a temporary stand-in for `app/README.md`. Once the Expo app is scaffolded, its own README should move there, and this file can be trimmed down to just the monorepo overview.

## Docs

- [`docs/CONTEXT.md`](./docs/CONTEXT.md) — read this first
- [`docs/prd.md`](./docs/prd.md) — features, user flows, screens
- [`docs/domain-model.md`](./docs/domain-model.md) — entities, relationships
- [`docs/glossary.md`](./docs/glossary.md) — terminology
- [`docs/style-guide.md`](./docs/style-guide.md) — brand, colors, type, spacing
- [`docs/adr/`](./docs/adr/) — architecture decision records
- [`docs/specs/`](./docs/specs/) — SPEC-01 through SPEC-25, implementation-ready contracts
- [`docs/redesign/`](./docs/redesign/) — screen-by-screen redesign notes
