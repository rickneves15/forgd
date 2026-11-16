# Spec Conventions

How Forgd's API and app specifications are structured, numbered, and kept in sync with the code. `AGENTS.md` points here; this file owns the rules.

## Locations and pairing

- API contracts: `docs/specs/api/SPEC-XX-<slug>.md` (`SPEC-XX`).
- App contracts: `docs/specs/app/APP-XX-<slug>.md` (`APP-XX`).
- Templates: `docs/specs/api/SPEC-TEMPLATE.md`, `docs/specs/app/APP-TEMPLATE.md`.
- Specs are paired by topic: `SPEC-03` ↔ `APP-03`. The app spec references the API endpoints it consumes; the API spec references the app screen it powers.
- **Exception:** `SPEC-26` (presigned upload) is shared infrastructure and has no app pair. Do not invent an `APP-26` for it.
- Paths inside specs (`prd.md`, `domain-model.md`, `adr/…`, `flows/…`, `specs/api/…`) are relative to `docs/`, not to the spec file.

## Numbering

- IDs are permanent. Never renumber, reuse, or split an ID into two files.
- New contracts take the next free number in their family. Current highest: `SPEC-26`, `APP-25`.
- The next paired feature (the Home feed) is expected to become `SPEC-27` / `APP-26`. It is **not written yet** — see below.
- Shared infrastructure may take an API-only number, as `SPEC-26` did.

## Status vocabulary

Every spec starts with exactly one:

| Status | Meaning |
|---|---|
| `Draft` | Under discussion. The contract is not agreed and implementation must not start. |
| `Ready` | Contract agreed and stable. Implementation may start; no further design decisions expected. |
| `Done` | Implemented and verified. Every acceptance criterion in §5/§9 is checked and backed by a test (or the spec states the deliberate gap). |

Do not mark `Done` because the code "mostly works". Unchecked boxes with `Done` is a contradiction to fix, not a style choice.

Current state: API `SPEC-01`–`SPEC-05` are `Done` (archived to `docs/specs/archive/api/`); `SPEC-06`–`SPEC-26` are `Ready`. App specs `APP-01`–`APP-05` are archived to `docs/specs/archive/app/`; `APP-06`–`APP-25` are `Draft` because the Expo screens are not built yet.

## Required metadata

API spec header:

```markdown
# SPEC-XX: Title

**Status:** Draft | Ready | Done
**Pairs with:** `specs/app/APP-XX-<slug>.md`
**Screen(s):** … (or "no dedicated screen — background behaviour")
**Related docs:** `prd.md` §…, `domain-model.md` §…, `adr/…`, `flows/…`
```

App spec header:

```markdown
# APP-XX: Title

**Status:** Draft | Ready | Done
**Pairs with:** `specs/api/SPEC-XX-<slug>.md`
**Screen(s):** …
**Related docs:** `prd.md` §…, `redesign/NN-<name>.md`, `flows/…`
```

`Pairs with` is mandatory on both sides. `Related docs` must point at files that exist. Do not link from a spec header to a spec that has not been written; forward references elsewhere (e.g. `prd.md` user stories) must be marked "to be written".

## What belongs where

- **API spec** — endpoint, auth check, request/response schemas, error codes, scenarios, acceptance criteria, implementation notes. The HTTP contract is the product of this file.
- **App spec** — entry/navigation, React Query reads/writes, screen states, client-side validation, error mapping, device-local state, acceptance criteria. Do not repeat server validation; link to the API spec.
- **PRD** — product behaviour and user stories only. It links forward to specs; it does not duplicate acceptance criteria.
- **Flow docs** — multi-actor sequences shared by several specs. If a sequence is used by more than one spec, it belongs in `docs/flows/`, and specs link to it.
- **ADR** — a hard-to-reverse decision with real alternatives. Not a place for feature contracts.

## New feature lifecycle

1. **Grill** the idea (`grill-with-docs`). Terms land in `docs/glossary.md`; hard decisions land in `docs/adr/`.
2. **Spec** it (`to-spec`) into a GitHub issue. That issue is temporary; it is not a durable doc.
3. **Break it down** (`to-tickets`) into tracer-bullet tickets with blocking edges.
4. **Write or update the durable spec** in `docs/specs/` — `Ready` once the contract is agreed. If the feature changes product behaviour, update `prd.md` (feature list, flows, screens, user stories) in the same pass.
5. **Implement** (`implement` or `implement-spec`). API tests back the API spec; the app follows the APP spec.
6. **Promote outcomes**: update `domain-model.md` for entity/rule changes, `glossary.md` for new terms, `docs/flows/` for new sequences, `adr/` for decisions that must outlive the feature.
7. **Close the loop**: check every acceptance criterion, mark the spec `Done`, close the tickets. The GitHub issue is closed, not copied into `docs/`.

If a spec and the code disagree, the spec wins and the code is fixed — unless the spec is wrong, in which case change the spec deliberately and update everything that references it.

## Updating templates

Templates are the structure for new specs. Changing a template does not retroactively rewrite existing specs; it applies to new files and to specs you are already editing. Keep existing section numbers stable — APP-25 references `SPEC-25 §4.1`, for example.

## Open spec work

- **Home feed** — confirmed as the product direction by the owner on 2026-11-14 (design added 2026-08-15; screens still `review`): `docs/redesign/02-projects.md` §1, `docs/redesign/00-screen-checklist.md` Home section, reflected in `prd.md`. It has **no SPEC-27 / APP-26 yet**. Do not implement Home from redesign notes alone: write the API and app contracts first, including the feed, activity, people-you-may-know, and bookmark data sources, and decide whether Home needs new endpoints or reuses `SPEC-07`/`SPEC-11`.
- **Spec drift** — when a `Done` spec's acceptance boxes are unchecked, treat it as a documentation bug. Fix the spec or the code, not the checkbox alone.
