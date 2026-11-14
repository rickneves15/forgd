# Forgd

> Find your next hardware project, build it with a team.

Forgd is a discovery-and-collaboration app for **engineering students** working on hardware projects (electronics, electrical, mechanical, civil, aerospace, chemical). Post a project, find collaborators, run the group's work inside the app, and build a track record other students can see.

**Start here:** [`docs/CONTEXT.md`](./docs/CONTEXT.md) — primary context doc (stack, decisions, rules, full document map).

## Repo structure

This is a pnpm workspace with two packages:

| Package | What it is | Status |
|---|---|---|
| `api/` | Fastify + Zod + Drizzle API (see [`api/README.md`](./api/README.md)) | In progress |
| `app/` | Expo (React Native) mobile app (see [`app/README.md`](./app/README.md)) | Scaffolded — routing, theming, UI primitives |

Both packages share one business domain and one documentation tree. There are no per-package glossaries or duplicated specs.

## Docs

- [`docs/CONTEXT.md`](./docs/CONTEXT.md) — read this first
- [`docs/prd.md`](./docs/prd.md) — features, user flows, screens, user stories
- [`docs/domain-model.md`](./docs/domain-model.md) — entities, relationships, business rules
- [`docs/glossary.md`](./docs/glossary.md) — terminology
- [`docs/style-guide.md`](./docs/style-guide.md) — brand, colors, type, spacing, components
- [`docs/adr/`](./docs/adr/) — architecture decision records (ADR-001 … ADR-007)
- [`docs/flows/`](./docs/flows/) — cross-service sequence diagrams
- [`docs/specs/api/`](./docs/specs/api/) — SPEC-01 … SPEC-26, API contracts
- [`docs/specs/app/`](./docs/specs/app/) — APP-01 … APP-25, mobile contracts
- [`docs/redesign/`](./docs/redesign/) — screen-by-screen redesign notes

## Working on Forgd

- [`AGENTS.md`](./AGENTS.md) — agent entry point: sources of truth, pre-code reading, boundaries, commands, non-negotiables.
- [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) — standards `/code-review` enforces.
- [`docs/agents/`](./docs/agents/) — issue tracker, spec conventions, domain-doc rules, skill workflow.
