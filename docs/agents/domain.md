# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

These four sources are the canonical domain documentation for Forgd. They already exist — **do not recreate, delete, rename, or duplicate them**. Read them before making any domain or architectural decision.

1. **`docs/glossary.md`** — the canonical domain glossary. The glossary lives under `docs/` rather than at the root; treat it as `GLOSSARY.md` and do **not** create a duplicate root `GLOSSARY.md`.
2. **`docs/CONTEXT.md`** — the primary project context: stack, resolved decisions, project rules, and the full document map. Read this first.
3. **`docs/domain-model.md`** — the canonical domain model: entities, relationships, invariants, and business rules. Use it to check that a proposed change fits the existing model.
4. **`docs/adr/`** — the canonical architectural decision records. Read every ADR that touches the area you're about to work in. Decisions are numbered `ADR-001` onward.

If a source is missing a detail you need, update that existing file in place through the relevant skill (e.g. `/domain-modeling`) rather than creating a parallel document. Do not create new top-level glossary or domain-model files.

## File structure

Single-context repo: one glossary, one domain model, one context doc, and one ADR set for the whole product domain. `api/` and `app/` share the same business domain — there are no per-package glossaries and no `GLOSSARY-MAP.md`.

```
/
├── docs/
│   ├── glossary.md                    ← domain glossary (referenced as GLOSSARY.md)
│   ├── CONTEXT.md                     ← project context: stack, decisions, rules
│   ├── domain-model.md                ← entities, relationships, invariants
│   └── adr/                           ← canonical ADR location
│       ├── ADR-001-mobile-expo-fastify-api.md
│       └── ...
├── api/
└── app/
```

When a skill says to update `GLOSSARY.md`, update `docs/glossary.md`. Keep it a glossary only — no implementation details, no specs, no scratch notes. Put implementation decisions in `docs/adr/` and project-wide rules in `docs/CONTEXT.md`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/glossary.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-007 (Fastify Passport), but worth reopening because…_
